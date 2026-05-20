import crypto from 'crypto';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
async function updatePaidUser(email, subscriptionId, status, expiresAt = null, planTier = 'pro') {
  const now = new Date().toISOString();
  const payload = {
    email: email.toLowerCase().trim(),
    status: status,
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
async function razorpayFetch(path) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET
      ).toString('base64')
    }
  });
  return response.json();
}
async function getEmail(subscription, payment) {
  if (subscription?.notes?.customer_email) return subscription.notes.customer_email;
  if (subscription?.notes?.email) return subscription.notes.email;
  if (payment?.notes?.customer_email) return payment.notes.customer_email;
  if (payment?.notes?.email) return payment.notes.email;
  if (payment?.email) return payment.email;
  const customerId = subscription?.customer_id || payment?.customer_id;
  if (customerId) {
    const customer = await razorpayFetch(`/customers/${customerId}`);
    if (customer?.email) return customer.email;
  }
  if (subscription?.id) {
    const fullSub = await razorpayFetch(`/subscriptions/${subscription.id}`);
    if (fullSub?.customer_id) {
      const customer = await razorpayFetch(`/customers/${fullSub.customer_id}`);
      if (customer?.email) return customer.email;
    }
  }
  return null;
}
export const config = {
  api: { bodyParser: false }
};
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const rawBody = await getRawBody(req);
  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  if (signature !== expectedSignature) return res.status(400).json({ error: 'Invalid signature' });
  const body = JSON.parse(rawBody);
  const event = body.event;
  const subscription = body.payload?.subscription?.entity;
  const payment = body.payload?.payment?.entity;
  if (!subscription && !payment) return res.status(200).json({ received: true });

  // Only process Speak (DOM.com) payments
  const product = subscription?.notes?.product || payment?.notes?.product;
  if (product && product !== 'speak') return res.status(200).json({ received: true });

  const email = await getEmail(subscription, payment);
  if (!email) return res.status(200).json({ received: true, note: 'No email found' });
  const subscriptionId = subscription?.id;
  if (event === 'subscription.activated' || event === 'subscription.charged') {
    const currentEnd = subscription?.current_end;
    const expiresAt = currentEnd ? new Date(currentEnd * 1000).toISOString() : null;
    const planTier = subscription?.notes?.plan_tier || 'pro';
    await updatePaidUser(email, subscriptionId, 'active', expiresAt, planTier);
  } else if (
    event === 'subscription.cancelled' ||
    event === 'subscription.halted' ||
    event === 'payment.failed'
  ) {
    await updatePaidUser(email, subscriptionId, 'cancelled');
  }
  return res.status(200).json({ received: true });
}
