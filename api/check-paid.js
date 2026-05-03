export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  try {
    const url = `${SUPABASE_URL}/rest/v1/paid_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=status,expires_at,plan`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    return res.status(200).json({ debug_url: url, debug_status: response.status, debug_data: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
