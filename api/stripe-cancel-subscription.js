export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const auth = 'Basic ' + Buffer.from(STRIPE_SECRET_KEY + ':').toString('base64');

  try {
    // Get subscription ID from Supabase
    const supaRes = await fetch(
      `${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=razorpay_subscription_id,status`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const supaData = await supaRes.json();
    const subscriptionId = supaData?.[0]?.razorpay_subscription_id;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription at period end
    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ cancel_at_period_end: 'true' }).toString()
    });
    const cancelData = await cancelRes.json();

    if (cancelData.error) {
      return res.status(500).json({ error: 'Failed to cancel subscription', details: cancelData.error });
    }

    // Update Supabase status to cancelled
    await fetch(`${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
