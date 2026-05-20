export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, plan } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = plan === 'platinum.' ? 'price_1TT1EiSCxU4epk8YBieAwc6Q' : 'price_1TT1DPSCxU4epk8YdXGx4v6r';
  const auth = 'Basic ' + Buffer.from(STRIPE_SECRET_KEY + ':').toString('base64');
  const origin = req.headers.origin || 'https://gauravmehta.me';
  try {
    let customerId = null;
    const searchRes = await fetch(`https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email.toLowerCase().trim())}'&limit=1`, {
      headers: { 'Authorization': auth }
    });
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
    } else {
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: email.toLowerCase().trim(),
          'metadata[plan_tier]': plan || 'pro.',
          'metadata[product]': 'speak'
        }).toString()
      });
      const createData = await createRes.json();
      if (!createData.id) return res.status(500).json({ error: 'Failed to create customer', details: createData });
      customerId = createData.id;
    }
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        mode: 'subscription',
        billing_address_collection: 'required',
        'payment_method_types[0]': 'card',
        'line_items[0][price]': PRICE_ID,
        'line_items[0][quantity]': '1',
        'metadata[customer_email]': email.toLowerCase().trim(),
        'metadata[plan_tier]': plan || 'pro.',
        'metadata[product]': 'speak',
        'subscription_data[metadata][customer_email]': email.toLowerCase().trim(),
        'subscription_data[metadata][plan_tier]': plan || 'pro.',
        'subscription_data[metadata][product]': 'speak',
        'customer_email': email.toLowerCase().trim(),
        success_url: `${origin}/dailyoneminute?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
        cancel_url: `${origin}/dailyoneminute`,
      }).toString()
    });
    const sessionData = await sessionRes.json();
    if (!sessionData.id) return res.status(500).json({ error: 'Failed to create session', details: sessionData });
    return res.status(200).json({ session_id: sessionData.id, session_url: sessionData.url });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
