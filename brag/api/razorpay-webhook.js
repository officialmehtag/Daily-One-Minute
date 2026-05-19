import crypto from 'crypto';

const SUPABASE_URL = 'https://haktqxkdfsrprsorhfiz.supabase.co';

async function updateSupabase(email, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/bb_user_settings?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return response.ok;
}

function verifyRazorpaySignature(rawBody, signature, secret) {
  const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'No signature' });
  }

  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => rawBody += chunk);
    req.on('end', resolve);
    req.on('error', reject);
  });

  try {
    if (!verifyRazorpaySignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Signature verification failed' });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'subscription.activated' || event.event === 'payment.captured') {
    const email = event.payload?.payment?.entity?.email
      || event.payload?.subscription?.entity?.notes?.email;
    if (email) {
      await updateSupabase(email, {
        is_paid: true,
        signup_date: new Date().toISOString()
      });
    }
  }

  if (event.event === 'subscription.cancelled' || event.event === 'subscription.completed') {
    const email = event.payload?.subscription?.entity?.notes?.email;
    if (email) {
      await updateSupabase(email, { is_paid: false });
    }
  }

  return res.status(200).json({ received: true });
}

export const config = { api: { bodyParser: false } };
