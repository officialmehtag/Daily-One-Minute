export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const SUPABASE_URL = 'https://haktqxkdfsrprsorhfiz.supabase.co';

  try {
    // Get the Stripe customer ID from Supabase
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bb_user_settings?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=stripe_customer_id`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );
    const data = await sbRes.json();
    const customerId = Array.isArray(data) && data.length > 0 ? data[0].stripe_customer_id : null;

    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Create Stripe billing portal session
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'customer': customerId,
        'return_url': 'https://brag.dailyoneminute.com'
      })
    });

    const portal = await portalRes.json();

    if (portal.url) {
      return res.status(200).json({ url: portal.url });
    }

    return res.status(500).json({ error: 'Failed to create portal session', detail: portal });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
