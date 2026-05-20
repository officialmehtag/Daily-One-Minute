const SUPABASE_URL = 'https://haktqxkdfsrprsorhfiz.supabase.co';

async function getStats(serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bb_user_settings?select=*&order=updated_at.desc`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });
  return res.json();
}

async function togglePaid(serviceKey, userId, isPaid) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bb_user_settings?user_id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ is_paid: isPaid, signup_date: new Date().toISOString() })
  });
  return res.ok;
}

export default async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // Handle toggle paid action
  if (req.method === 'POST') {
    const { password, userId, isPaid } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const ok = await togglePaid(SUPABASE_SERVICE_KEY, userId, isPaid);
    return res.status(ok ? 200 : 500).json({ success: ok });
  }

  // GET — serve the admin page
  const { p } = req.query;
  const authenticated = p === ADMIN_PASSWORD;

  const adminHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — YourBragBook</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0e0f13;--sur:#16181e;--bdr:rgba(255,255,255,0.07);
  --tx:#f0f0f0;--tx2:#a8aab5;--tx3:#5a5d6b;
  --acc:#7C6FF7;--green:#2EC97A;--amber:#F5A623;--red:#e05a4a;
}
body{background:var(--bg);color:var(--tx);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;padding:24px;}
.login-wrap{max-width:360px;margin:80px auto;}
.login-title{font-size:24px;font-weight:700;margin-bottom:24px;text-align:center;}
.input{width:100%;padding:12px 16px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;color:var(--tx);font-family:inherit;font-size:14px;outline:none;margin-bottom:12px;}
.input:focus{border-color:var(--acc);}
.btn{width:100%;padding:13px;background:var(--acc);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
.btn:hover{opacity:.9;}
.wrap{max-width:1100px;margin:0 auto;}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid var(--bdr);}
.header h1{font-size:22px;font-weight:700;}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:32px;}
.stat{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:20px;}
.stat-num{font-size:32px;font-weight:700;color:var(--acc);line-height:1;}
.stat-label{font-size:12px;color:var(--tx3);margin-top:6px;text-transform:uppercase;letter-spacing:.06em;}
.search{width:100%;max-width:320px;padding:10px 16px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;color:var(--tx);font-family:inherit;font-size:13px;outline:none;margin-bottom:20px;}
.search:focus{border-color:var(--acc);}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{text-align:left;padding:10px 14px;font-size:11px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--bdr);}
td{padding:12px 14px;border-bottom:1px solid var(--bdr);color:var(--tx2);vertical-align:middle;}
tr:hover td{background:rgba(255,255,255,0.02);}
.badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.badge-paid{background:rgba(46,201,122,0.12);color:var(--green);border:1px solid rgba(46,201,122,0.25);}
.badge-free{background:rgba(90,93,107,0.15);color:var(--tx3);border:1px solid var(--bdr);}
.toggle-btn{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:all .15s;}
.toggle-btn-activate{background:rgba(46,201,122,0.08);color:var(--green);border-color:rgba(46,201,122,0.3);}
.toggle-btn-activate:hover{background:rgba(46,201,122,0.15);}
.toggle-btn-deactivate{background:rgba(224,90,74,0.08);color:var(--red);border-color:rgba(224,90,74,0.3);}
.toggle-btn-deactivate:hover{background:rgba(224,90,74,0.15);}
.toast{position:fixed;bottom:24px;right:24px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;padding:12px 20px;font-size:13px;color:var(--tx);display:none;z-index:999;}
</style>
</head>
<body>

${authenticated ? `
<div class="wrap">
  <div class="header">
    <h1>YourBragBook Admin</h1>
    <span style="font-size:12px;color:var(--tx3);">Last updated: ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</span>
  </div>

  <div class="stats" id="stats">
    <div class="stat"><div class="stat-num" id="total-users">—</div><div class="stat-label">Total users</div></div>
    <div class="stat"><div class="stat-num" id="paid-users" style="color:var(--green);">—</div><div class="stat-label">Paid users</div></div>
    <div class="stat"><div class="stat-num" id="free-users" style="color:var(--tx3);">—</div><div class="stat-label">Free users</div></div>
    <div class="stat"><div class="stat-num" id="total-entries" style="color:var(--amber);">—</div><div class="stat-label">Total entries</div></div>
  </div>

  <input class="search" type="text" placeholder="Search by email or country..." oninput="filterUsers(this.value)">

  <table>
    <thead>
      <tr>
        <th>Email</th>
        <th>Country</th>
        <th>Signed up</th>
        <th>Entries</th>
        <th>Playbooks</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="users-table"></tbody>
  </table>
</div>

<div class="toast" id="toast"></div>

<script>
const PASSWORD = '${p}';
let allUsers = [];

async function loadUsers() {
  const res = await fetch('/admin?p=' + PASSWORD + '&data=1');
  allUsers = await res.json();
  renderStats(allUsers);
  renderTable(allUsers);
}

function renderStats(users) {
  document.getElementById('total-users').textContent = users.length;
  document.getElementById('paid-users').textContent = users.filter(u => u.is_paid).length;
  document.getElementById('free-users').textContent = users.filter(u => !u.is_paid).length;
  document.getElementById('total-entries').textContent = users.reduce((sum, u) => sum + (parseInt(u.entry_count) || 0), 0);
}

function renderTable(users) {
  const tbody = document.getElementById('users-table');
  tbody.innerHTML = users.map(u => {
    const date = u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN') : '—';
    const isPaid = u.is_paid;
    return \`<tr>
      <td style="color:var(--tx);">\${u.email || '—'}</td>
      <td>\${u.country || '—'}</td>
      <td>\${date}</td>
      <td>\${u.entry_count || 0}</td>
      <td>\${u.report_count || 0}</td>
      <td><span class="badge \${isPaid ? 'badge-paid' : 'badge-free'}">\${isPaid ? 'Paid' : 'Free'}</span></td>
      <td><button class="toggle-btn \${isPaid ? 'toggle-btn-deactivate' : 'toggle-btn-activate'}" onclick="togglePaid('\${u.user_id}', \${!isPaid})">\${isPaid ? 'Deactivate' : 'Activate'}</button></td>
    </tr>\`;
  }).join('');
}

function filterUsers(q) {
  const filtered = allUsers.filter(u =>
    (u.email || '').toLowerCase().includes(q.toLowerCase()) ||
    (u.country || '').toLowerCase().includes(q.toLowerCase())
  );
  renderTable(filtered);
}

async function togglePaid(userId, isPaid) {
  const res = await fetch('/admin', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ password: PASSWORD, userId, isPaid })
  });
  const data = await res.json();
  if (data.success) {
    showToast(isPaid ? 'User activated' : 'User deactivated');
    await loadUsers();
  } else {
    showToast('Something went wrong');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3000);
}

loadUsers();
</script>
` : `
<div class="login-wrap">
  <div class="login-title">Admin Login</div>
  <input class="input" type="password" id="pwd" placeholder="Password" onkeydown="if(event.key==='Enter')login()">
  <button class="btn" onclick="login()">Sign in</button>
</div>
<script>
function login() {
  const pwd = document.getElementById('pwd').value;
  window.location.href = '/admin?p=' + encodeURIComponent(pwd);
}
</script>
`}

</body>
</html>`;

  // If data requested (for JS fetch)
  if (req.query.data === '1' && authenticated) {
    const data = await getStats(SUPABASE_SERVICE_KEY);
    return res.status(200).json(data);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(authenticated ? 200 : 200).send(adminHTML);
}
