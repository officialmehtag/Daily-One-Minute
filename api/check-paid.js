export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=status,expires_at,plan`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ plan: null, expires_at: null });
    }
    const { status, expires_at, plan } = data[0];
    const isActive = (
      status === 'active' || status === 'cancelled'
    ) &&
      expires_at &&
      new Date(expires_at) > new Date();
    if (!isActive) return res.status(200).json({ plan: null, expires_at: null });
    return res.status(200).json({
      plan: plan || null,
      expires_at: expires_at || null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
