const SUPABASE_URL = 'https://haktqxkdfsrprsorhfiz.supabase.co';

async function getUsers(serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bb_user_settings?select=*&order=updated_at.desc`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
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

function renewalDate(signupDate) {
  if (!signupDate) return '—';
  const d = new Date(signupDate);
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function inferAmount(gateway) {
  if (gateway === 'razorpay') return '₹2,999';
  if (gateway === 'stripe') return '$29';
  return '—';
}

export default async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (req.method === 'POST') {
    const { password, userId, isPaid } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
    const ok = await togglePaid(SUPABASE_SERVICE_KEY, userId, isPaid);
    return res.status(ok ? 200 : 500).json({ success: ok });
  }

  const { p, data } = req.query;
  const authenticated = p === ADMIN_PASSWORD;

  if (data === '1' && authenticated) {
    const users = await getUsers(SUPABASE_SERVICE_KEY);
    return res.status(200).json(users);
  }

  const html = `<!DOCTYPE html>
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
.login-wrap{max-width:360px;margin:80px auto;text-align:center;}
.login-title{font-size:22px;font-weight:700;margin-bottom:24px;}
.input{width:100%;padding:12px 16px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;color:var(--tx);font-family:inherit;font-size:14px;outline:none;margin-bottom:12px;}
.input:focus{border-color:var(--acc);}
.btn{width:100%;padding:13px;background:var(--acc);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
.btn:hover{opacity:.9;}
.wrap{max-width:1200px;margin:0 auto;}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--bdr);}
.header h1{font-size:20px;font-weight:700;}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:28px;}
.stat{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:18px;}
.stat-num{font-size:28px;font-weight:700;color:var(--acc);line-height:1;}
.stat-label{font-size:11px;color:var(--tx3);margin-top:6px;text-transform:uppercase;letter-spacing:.06em;}
.filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;align-items:center;}
.filter-input{padding:9px 14px;background:var(--sur);border:1px solid var(--bdr);border-radius:8px;color:var(--tx);font-family:inherit;font-size:13px;outline:none;}
.filter-input:focus{border-color:var(--acc);}
.filter-select{padding:9px 14px;background:var(--sur);border:1px solid var(--bdr);border-radius:8px;color:var(--tx);font-family:inherit;font-size:13px;outline:none;cursor:pointer;}
.filter-select:focus{border-color:var(--acc);}
.download-btn{padding:9px 18px;background:rgba(124,111,247,0.12);border:1px solid rgba(124,111,247,0.3);border-radius:8px;color:var(--acc);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto;}
.download-btn:hover{background:rgba(124,111,247,0.2);}
.result-count{font-size:12px;color:var(--tx3);padding:4px 0;}
.table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{text-align:left;padding:10px 14px;font-size:11px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--bdr);white-space:nowrap;}
td{padding:11px 14px;border-bottom:1px solid var(--bdr);color:var(--tx2);vertical-align:middle;}
tr:hover td{background:rgba(255,255,255,0.02);}
.badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.badge-paid{background:rgba(46,201,122,0.12);color:var(--green);border:1px solid rgba(46,201,122,0.25);}
.badge-free{background:rgba(90,93,107,0.15);color:var(--tx3);border:1px solid var(--bdr);}
.badge-razorpay{background:rgba(245,166,35,0.1);color:var(--amber);border:1px solid rgba(245,166,35,0.25);}
.badge-stripe{background:rgba(124,111,247,0.1);color:var(--acc);border:1px solid rgba(124,111,247,0.25);}
.toggle-btn{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:all .15s;}
.toggle-btn-activate{background:rgba(46,201,122,0.08);color:var(--green);border-color:rgba(46,201,122,0.3);}
.toggle-btn-activate:hover{background:rgba(46,201,122,0.18);}
.toggle-btn-deactivate{background:rgba(224,90,74,0.08);color:var(--red);border-color:rgba(224,90,74,0.3);}
.toggle-btn-deactivate:hover{background:rgba(224,90,74,0.18);}
.toast{position:fixed;bottom:24px;right:24px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;padding:12px 20px;font-size:13px;color:var(--tx);display:none;z-index:999;}
@media(max-width:768px){.filters{flex-direction:column;}.download-btn{margin-left:0;width:100%;}}
</style>
</head>
<body>

${authenticated ? `
<div class="wrap">
  <div class="header">
    <h1>YourBragBook Admin</h1>
    <span style="font-size:12px;color:var(--tx3);">IST: ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</span>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num" id="s-total">—</div><div class="stat-label">Total users</div></div>
    <div class="stat"><div class="stat-num" id="s-paid" style="color:var(--green);">—</div><div class="stat-label">Paid</div></div>
    <div class="stat"><div class="stat-num" id="s-free" style="color:var(--tx3);">—</div><div class="stat-label">Free / Trial</div></div>
    <div class="stat"><div class="stat-num" id="s-razorpay" style="color:var(--amber);">—</div><div class="stat-label">Razorpay</div></div>
    <div class="stat"><div class="stat-num" id="s-stripe" style="color:var(--acc);">—</div><div class="stat-label">Stripe</div></div>
    <div class="stat"><div class="stat-num" id="s-entries" style="color:var(--amber);">—</div><div class="stat-label">Total entries</div></div>
  </div>

  <div class="filters">
    <input class="filter-input" type="text" id="f-search" placeholder="Search email or country..." oninput="applyFilters()">
    <select class="filter-select" id="f-status" onchange="applyFilters()">
      <option value="">All users</option>
      <option value="paid">Paid only</option>
      <option value="free">Free only</option>
    </select>
    <select class="filter-select" id="f-gateway" onchange="applyFilters()">
      <option value="">All gateways</option>
      <option value="razorpay">Razorpay</option>
      <option value="stripe">Stripe</option>
    </select>
    <select class="filter-select" id="f-country" onchange="applyFilters()">
      <option value="">All countries</option>
    </select>
    <button class="download-btn" onclick="downloadCSV()">⬇ Download CSV</button>
  </div>

  <div class="result-count" id="result-count"></div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Country</th>
          <th>Signed up</th>
          <th>Renewal date</th>
          <th>Gateway</th>
          <th>Amount</th>
          <th>Entries</th>
          <th>Playbooks</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="users-table"></tbody>
    </table>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const PASSWORD = '${p}';
let allUsers = [];
let filtered = [];

async function loadUsers() {
  const res = await fetch('/admin?p=' + PASSWORD + '&data=1');
  allUsers = await res.json();
  populateCountryFilter(allUsers);
  renderStats(allUsers);
  applyFilters();
}

function populateCountryFilter(users) {
  const countries = [...new Set(users.map(u => u.country).filter(Boolean))].sort();
  const sel = document.getElementById('f-country');
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

function renderStats(users) {
  document.getElementById('s-total').textContent = users.length;
  document.getElementById('s-paid').textContent = users.filter(u => u.is_paid).length;
  document.getElementById('s-free').textContent = users.filter(u => !u.is_paid).length;
  document.getElementById('s-razorpay').textContent = users.filter(u => u.payment_gateway === 'razorpay').length;
  document.getElementById('s-stripe').textContent = users.filter(u => u.payment_gateway === 'stripe').length;
  document.getElementById('s-entries').textContent = users.reduce((sum, u) => sum + (parseInt(u.entry_count) || 0), 0);
}

function applyFilters() {
  const search = document.getElementById('f-search').value.toLowerCase();
  const status = document.getElementById('f-status').value;
  const gateway = document.getElementById('f-gateway').value;
  const country = document.getElementById('f-country').value;

  filtered = allUsers.filter(u => {
    if (search && !(u.email || '').toLowerCase().includes(search) && !(u.country || '').toLowerCase().includes(search)) return false;
    if (status === 'paid' && !u.is_paid) return false;
    if (status === 'free' && u.is_paid) return false;
    if (gateway && u.payment_gateway !== gateway) return false;
    if (country && u.country !== country) return false;
    return true;
  });

  document.getElementById('result-count').textContent = filtered.length + ' user' + (filtered.length !== 1 ? 's' : '') + ' shown';
  renderTable(filtered);
}

function renewalDate(signupDate) {
  if (!signupDate) return '—';
  const d = new Date(signupDate);
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function inferAmount(gateway) {
  if (gateway === 'razorpay') return '₹2,999';
  if (gateway === 'stripe') return '$29';
  return '—';
}

function renderTable(users) {
  const tbody = document.getElementById('users-table');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--tx3);">No users match the current filters.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => {
    const isPaid = u.is_paid;
    const signup = u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '—';
    const renewal = isPaid ? renewalDate(u.signup_date) : '—';
    const amount = isPaid ? inferAmount(u.payment_gateway) : '—';
    const gw = u.payment_gateway;
    return \`<tr>
      <td style="color:var(--tx);">\${u.email || '—'}</td>
      <td>\${u.country || '—'}</td>
      <td>\${signup}</td>
      <td style="color:\${isPaid ? 'var(--green)' : 'var(--tx3)'};">\${renewal}</td>
      <td>\${gw ? '<span class="badge badge-' + gw + '">' + gw + '</span>' : '—'}</td>
      <td style="font-weight:600;color:var(--tx);">\${amount}</td>
      <td>\${u.entry_count || 0}</td>
      <td>\${u.report_count || 0}</td>
      <td><span class="badge \${isPaid ? 'badge-paid' : 'badge-free'}">\${isPaid ? 'Paid' : 'Free'}</span></td>
      <td><button class="toggle-btn \${isPaid ? 'toggle-btn-deactivate' : 'toggle-btn-activate'}" onclick="togglePaid('\${u.user_id}', \${!isPaid})">\${isPaid ? 'Deactivate' : 'Activate'}</button></td>
    </tr>\`;
  }).join('');
}

async function togglePaid(userId, isPaid) {
  const res = await fetch('/admin', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ password: PASSWORD, userId, isPaid })
  });
  const data = await res.json();
  if (data.success) {
    showToast(isPaid ? '✓ User activated' : '✓ User deactivated');
    await loadUsers();
  } else {
    showToast('Something went wrong');
  }
}

function downloadCSV() {
  const headers = ['Email','Country','Signed up','Renewal date','Gateway','Amount','Entries','Playbooks','Status'];
  const rows = filtered.map(u => [
    u.email || '',
    u.country || '',
    u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN') : '',
    u.is_paid ? renewalDate(u.signup_date) : '',
    u.payment_gateway || '',
    u.is_paid ? inferAmount(u.payment_gateway) : '',
    u.entry_count || 0,
    u.report_count || 0,
    u.is_paid ? 'Paid' : 'Free'
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yourbragbook-users-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
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
  <div class="login-title">Admin</div>
  <input class="input" type="password" id="pwd" placeholder="Password" onkeydown="if(event.key==='Enter')login()">
  <button class="btn" onclick="login()">Sign in</button>
</div>
<script>
function login(){
  const pwd = document.getElementById('pwd').value;
  if(pwd) window.location.href = '/admin?p=' + encodeURIComponent(pwd);
}
</script>
`}

</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
