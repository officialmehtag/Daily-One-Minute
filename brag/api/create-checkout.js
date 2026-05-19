export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { gateway, email } = req.body;

  if (gateway === 'stripe') {
    try {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'mode': 'subscription',
          'line_items[0][price]': process.env.STRIPE_PRICE_ID,
          'line_items[0][quantity]': '1',
          'customer_email': email,
          'success_url': 'https://brag.dailyoneminute.com?payment=success',
          'cancel_url': 'https://brag.dailyoneminute.com?payment=cancelled',
          'allow_promotion_codes': 'true'
        })
      });
      const session = await response.json();
      if (session.url) {
        return res.status(200).json({ url: session.url });
      }
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (gateway === 'razorpay') {
    try {
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: process.env.RAZORPAY_PLAN_ID,
          total_count: 12,
          quantity: 1,
          notes: { email: email }
        })
      });
      const subscription = await response.json();
      if (subscription.id) {
        return res.status(200).json({
          subscriptionId: subscription.id,
          keyId: process.env.RAZORPAY_KEY_ID
        });
      }
      return res.status(500).json({ error: 'Failed to create Razorpay subscription' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid gateway' });
}
