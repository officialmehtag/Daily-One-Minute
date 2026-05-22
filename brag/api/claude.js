// /api/claude.js
// Server-side check that mirrors the front-end gating logic exactly,
// so a user cannot bypass the paywall by flipping is_paid in DevTools.
// Mirrors functions in the HTML: isTrialExpired, freeEntryLimitReached,
// hasUsedFreePlaybook, isSubscriptionExpired, and PLAN limits.

const SUPABASE_URL = process.env.SUPABASE_URL;            // https://haktqxkdfsrprsorhfiz.supabase.co
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;  // same anon key used in the HTML

// Plan limits — match PLAN object in HTML (line 1326)
const PAID_MAX_ENTRIES_YEAR = 300;
const PAID_MAX_REPORTS_YEAR = 12;

// Trial limits — match isTrialExpired / freeEntryLimitReached / hasUsedFreePlaybook in HTML
const TRIAL_DAYS = 14;
const TRIAL_MAX_ENTRIES = 25;
const TRIAL_MAX_REPORTS = 1;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // ── 1. Verify the user's Supabase session ───────────────────────────
  const authHeader = req.headers.authorization || '';
  const userToken = authHeader.replace('Bearer ', '').trim();
  if (!userToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let userId;
  try {
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${userToken}`
      }
    });
    if (!userResp.ok) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const userData = await userResp.json();
    userId = userData.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid session' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Auth check failed' });
  }

  // ── 2. Load this user's row from bb_user_settings ───────────────────
  let settings;
  try {
    const settingsResp = await fetch(
      `${SUPABASE_URL}/rest/v1/bb_user_settings?user_id=eq.${userId}&select=is_paid,signup_date,report_count,bonus_reports,entry_count`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    const rows = await settingsResp.json();
    settings = rows && rows[0] ? rows[0] : {};
  } catch (e) {
    return res.status(500).json({ error: 'Could not load user settings' });
  }

  const isPaid = settings.is_paid === true;
  const reportCount = parseInt(settings.report_count) || 0;
  const bonusReports = parseInt(settings.bonus_reports) || 0;
  const entryCount = parseInt(settings.entry_count) || 0;
  const signupDate = settings.signup_date ? new Date(settings.signup_date) : null;

  // ── 3. Apply the same gating rules the front end uses ───────────────
  if (!isPaid) {
    // Free / trial user
    if (!signupDate) {
      return res.status(402).json({ error: 'No signup date on record' });
    }
    // Mirrors isTrialExpired(): daysDiff >= 14
    const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSignup >= TRIAL_DAYS) {
      return res.status(402).json({ error: 'Trial expired' });
    }
    // Mirrors freeEntryLimitReached(): entryCount >= 25
    if (entryCount >= TRIAL_MAX_ENTRIES) {
      return res.status(402).json({ error: 'Free entry limit reached' });
    }
    // Mirrors hasUsedFreePlaybook(): reportCount >= 1
    if (reportCount >= TRIAL_MAX_REPORTS) {
      return res.status(402).json({ error: 'Free playbook already used' });
    }
  } else {
    // Paid user — check 12-month subscription window + quotas
    if (signupDate) {
      const now = new Date();
      const yearsElapsed = Math.floor((now - signupDate) / (365.25 * 24 * 60 * 60 * 1000));
      const nextRenewal = new Date(signupDate);
      nextRenewal.setFullYear(signupDate.getFullYear() + yearsElapsed + 1);
      if (nextRenewal <= now) {
        return res.status(402).json({ error: 'Subscription expired' });
      }
    }
    if (reportCount >= PAID_MAX_REPORTS_YEAR + bonusReports) {
      return res.status(402).json({ error: 'Playbook quota exceeded for this year' });
    }
    if (entryCount >= PAID_MAX_ENTRIES_YEAR) {
      return res.status(402).json({ error: 'Entry quota exceeded for this year' });
    }
  }

  // ── 4. Call Anthropic ───────────────────────────────────────────────
  const apiKey = process.env.BRAGBOOK_ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
            }
            if (parsed.type === 'message_stop') {
              res.write('data: [DONE]\n\n');
            }
          } catch (e) {}
        }
      }
    }
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to reach Anthropic API' });
    }
    res.end();
  }
}
