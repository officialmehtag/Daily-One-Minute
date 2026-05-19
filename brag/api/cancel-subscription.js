import crypto from 'crypto';

const SUPABASE_URL = 'https://haktqxkdfsrprsorhfiz.supabase.co';

async function getRecord(email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bb_user_settings?email=eq.${encodeURIComponent(email)}&select=gateway_subscription_id,payment_gateway,stripe_customer_id`,
    {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      }
    }
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function cancelRazorpay(subscriptionId) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cancel_at_cycle_end: 1 })
  });
  return res.ok;
}

async function createStripePortalSession(customerId) {
  const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
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
  const data = await res.json();
  return data.url || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const record = await getRecord(email.toLowerCase().trim());

    if (!record) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Razorpay — cancel directly via API
    if (record.payment_gateway === 'razorpay') {
      if (!record.gateway_subscription_id) {
        return res.status(400).json({ error: 'No Razorpay subscription ID found' });
      }
      const cancelled = await cancelRazorpay(record.gateway_subscription_id);
      if (!cancelled) return res.status(500).json({ error: 'Failed to cancel with Razorpay' });
      return res.status(200).json({ success: true, gateway: 'razorpay' });
    }

    // Stripe — return portal URL for redirect
    if (record.payment_gateway === 'stripe') {
      if (!record.stripe_customer_id) {
        return res.status(400).json({ error: 'No Stripe customer ID found' });
      }
      const portalUrl = await createStripePortalSession(record.stripe_customer_id);
      if (!portalUrl) return res.status(500).json({ error: 'Failed to create Stripe portal' });
      return res.status(200).json({ success: true, gateway: 'stripe', portal_url: portalUrl });
    }

    return res.status(400).json({ error: 'Unknown payment gateway' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
