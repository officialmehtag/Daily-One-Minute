import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function razorpayFetch(path, method = 'GET', body = null) {
  const auth = 'Basic ' + Buffer.from(
    process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET
  ).toString('base64');

  const options = {
    method,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`https://api.razorpay.com/v1${path}`, options);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Step 1: Look up subscription ID from Supabase
    const supaRes = await fetch(
      `${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=razorpay_subscription_id,status`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const supaData = await supaRes.json();

    if (!Array.isArray(supaData) || supaData.length === 0) {
      return res.status(404).json({ error: 'No subscription found for this email' });
    }

    const { razorpay_subscription_id, status } = supaData[0];

    if (!razorpay_subscription_id) {
      return res.status(404).json({ error: 'No subscription ID found' });
    }

    if (status === 'cancelled') {
      // Already cancelled — just return success
      return res.status(200).json({ success: true, note: 'Already cancelled' });
    }

    // Step 2: Cancel the subscription in Razorpay
    // cancel_at_cycle_end: 1 means it cancels at end of billing period (cleaner)
    const cancelRes = await razorpayFetch(
      `/subscriptions/${razorpay_subscription_id}/cancel`,
      'POST',
      { cancel_at_cycle_end: 0 }
    );

    if (cancelRes.status !== 'cancelled') {
      return res.status(500).json({ error: 'Razorpay cancellation failed', details: cancelRes });
    }

    // Step 3: Update Supabase — set status to cancelled but keep expires_at untouched
    await fetch(
      `${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: 'cancelled' })
      }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
