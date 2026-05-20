import crypto from 'crypto';
export const config = { api: { bodyParser: false } };
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
async function stripeGet(path) {
  const auth = 'Basic ' + Buffer.from(process.env.STRIPE_SECRET_KEY + ':').toString('base64');
  const res = await fetch(`https://api.stripe.com/v1${path}`, { headers: { 'Authorization': auth } });
  return res.json();
}
async function updatePaidUser(email, subscriptionId, status, expiresAt = null, planTier = 'pro.') {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const now = new Date().toISOString();
  const payload = {
    email: email.toLowerCase().trim(),
    status,
    razorpay_subscription_id: subscriptionId,
  };
  if (status === 'active') {
    payload.subscribed_at = now;
    payload.plan = planTier;
    payload.expires_at = expiresAt || new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
  }
  await fetch(`${SUPABASE_URL}/rest/v1/paid_users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
}
function verifyStripeSignature(payload, sig, secret) {
  const parts = sig.split(',');
  let timestamp = '';
  const signatures = [];
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return signatures.some(sig => sig === expected);
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  if (!verifyStripeSignature(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  const event = JSON.parse(rawBody);
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Only process Speak (DOM.com) payments
      if (session.metadata?.product !== 'speak') return res.status(200).json({ received: true });
      const email = session.metadata?.customer_email || session.customer_details?.email;
      const planTier = session.metadata?.plan_tier || 'pro.';
      const subscriptionId = session.subscription;
      if (email && subscriptionId) {
        const subscription = await stripeGet(`/subscriptions/${subscriptionId}`);
        const expiresAt = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        await updatePaidUser(email, subscriptionId, 'active', expiresAt, planTier);
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (subscriptionId) {
        const subscription = await stripeGet(`/subscriptions/${subscriptionId}`);
        // Only process Speak (DOM.com) payments
        if (subscription.metadata?.product !== 'speak') return res.status(200).json({ received: true });
        const email = subscription.metadata?.customer_email;
        const planTier = subscription.metadata?.plan_tier || 'pro.';
        const expiresAt = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        if (email) await updatePaidUser(email, subscriptionId, 'active', expiresAt, planTier);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      // Only process Speak (DOM.com) cancellations
      if (subscription.metadata?.product !== 'speak') return res.status(200).json({ received: true });
      const email = subscription.metadata?.customer_email;
      if (email) await updatePaidUser(email, subscription.id, 'cancelled');
    }
  } catch (err) {
    return res.status(500).json({ error: 'Webhook processing error', message: err.message });
  }
  return res.status(200).json({ received: true });
}
