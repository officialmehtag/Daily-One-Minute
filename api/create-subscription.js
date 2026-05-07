export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, name, plan, start_at } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const PLAN_ID = plan === 'platinum' ? 'plan_SmVHjaoGLH4tcO' : 'plan_SmVHDFedh6D2P7';
  const auth = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  const cleanEmail = email.toLowerCase().trim();
  const customerName = name || cleanEmail.split('@')[0];
  try {
    let customerId = null;
    const customerRes = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customerName, email: cleanEmail, fail_existing: 0 })
    });
    const customerData = await customerRes.json();
    console.log('Step 1 status:', customerRes.status, 'data:', JSON.stringify(customerData));
    if (customerData.id) {
      customerId = customerData.id;
    } else {
      const searchRes = await fetch(
        `https://api.razorpay.com/v1/customers?count=100`,
        { headers: { 'Authorization': auth } }
      );
      const searchData = await searchRes.json();
      console.log('Step 2 search status:', searchRes.status);
      if (searchData?.items?.length > 0) {
        const match = searchData.items.find(
          c => c.email && c.email.toLowerCase().trim() === cleanEmail
        );
        if (match) {
          customerId = match.id;
          console.log('Step 2 found customer:', customerId);
        }
      }
    }
    const subPayload = {
      plan_id: PLAN_ID,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: { customer_email: cleanEmail, plan_tier: plan || 'pro' }
    };
    if (customerId) {
      subPayload.customer_id = customerId;
    }
    if (start_at && typeof start_at === 'number') {
      subPayload.start_at = start_at;
    }
    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(subPayload)
    });
    const subData = await subRes.json();
    console.log('Subscription status:', subRes.status, 'data:', JSON.stringify(subData));
    if (!subData.id) {
      return res.status(500).json({ error: 'Failed to create subscription', details: subData });
    }
    return res.status(200).json({ subscription_id: subData.id, key_id: RAZORPAY_KEY_ID });
  } catch (err) {
    console.log('Caught error:', err.message);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
