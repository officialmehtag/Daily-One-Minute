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
  --bg:#0e0f13;--sur:#16181e;--sur2:#1e2028;--bdr:rgba(255,255,255,0.07);
  --tx:#f0f0f0;--tx2:#a8aab5;--tx3:#5a5d6b;
  --acc:#7C6FF7;--green:#2EC97A;--amber:#F5A623;--red:#e05a4a;
}
body{background:var(--bg);color:var(--tx);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;padding:24px;}
.login-wrap{max-width:360px;margin:80px auto;text-align:center;}
.login-title{font-size:22px;font-weight:700;margin-bottom:24px;}
.input{width:100%;padding:12px 16px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;color:var(--tx);font-family:inherit;font-size:14px;outline:none;margin-bottom:12px;}
.input:focus{border-color:var(--acc);}
.btn-primary{width:100%;padding:13px;background:var(--acc);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
.wrap{max-width:1300px;margin:0 auto;}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid var(--bdr);}
.header h1{font-size:20px;font-weight:700;}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;}
.stat{background:var(--sur);border:1px solid var(--bdr);border-radius:10px;padding:16px;}
.stat-num{font-size:26px;font-weight:700;line-height:1;}
.stat-label{font-size:11px;color:var(--tx3);margin-top:5px;text-transform:uppercase;letter-spacing:.06em;}
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
.search-input{padding:9px 14px;background:var(--sur);border:1px solid var(--bdr);border-radius:8px;color:var(--tx);font-family:inherit;font-size:13px;outline:none;min-width:220px;}
.search-input:focus{border-color:var(--acc);}
.result-count{font-size:12px;color:var(--tx3);margin-left:4px;}
.clear-btn{padding:8px 14px;background:none;border:1px solid var(--bdr);border-radius:8px;color:var(--tx3);font-family:inherit;font-size:12px;cursor:pointer;}
.clear-btn:hover{color:var(--tx);border-color:var(--tx3);}
.download-btn{padding:9px 16px;background:rgba(124,111,247,0.12);border:1px solid rgba(124,111,247,0.3);border-radius:8px;color:var(--acc);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto;}
.download-btn:hover{background:rgba(124,111,247,0.2);}
.table-wrap{overflow-x:auto;border:1px solid var(--bdr);border-radius:12px;}
table{width:100%;border-collapse:collapse;font-size:13px;}

/* Column header with filter */
th{
  padding:0;border-bottom:1px solid var(--bdr);
  white-space:nowrap;position:relative;
}
.th-inner{
  display:flex;align-items:center;gap:6px;
  padding:10px 14px;cursor:pointer;
  font-size:11px;font-weight:600;color:var(--tx3);
  text-transform:uppercase;letter-spacing:.06em;
  user-select:none;transition:color .15s;
}
.th-inner:hover{color:var(--tx2);}
.th-inner.active{color:var(--acc);}
.th-icon{font-size:10px;opacity:0.5;}
.th-inner.active .th-icon{opacity:1;}

/* Filter dropdown */
.filter-drop{
  display:none;position:absolute;top:100%;left:0;z-index:100;
  background:var(--sur2);border:1px solid var(--bdr);border-radius:10px;
  padding:8px;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,0.4);
}
.filter-drop.open{display:block;}
.filter-option{
  padding:7px 12px;border-radius:6px;cursor:pointer;
  font-size:13px;color:var(--tx2);display:flex;align-items:center;gap:8px;
}
.filter-option:hover{background:rgba(255,255,255,0.05);color:var(--tx);}
.filter-option.selected{color:var(--acc);}
.filter-option .check{width:14px;height:14px;border:1px solid var(--bdr);border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;}
.filter-option.selected .check{background:var(--acc);border-color:var(--acc);color:#fff;}
.filter-search{width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;color:var(--tx);font-family:inherit;font-size:12px;outline:none;margin-bottom:6px;}

td{padding:10px 14px;border-bottom:1px solid var(--bdr);color:var(--tx2);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,0.02);}
.badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.badge-paid{background:rgba(46,201,122,0.12);color:var(--green);border:1px solid rgba(46,201,122,0.25);}
.badge-free{background:rgba(90,93,107,0.15);color:var(--tx3);border:1px solid var(--bdr);}
.badge-razorpay{background:rgba(245,166,35,0.1);color:var(--amber);border:1px solid rgba(245,166,35,0.25);}
.badge-stripe{background:rgba(124,111,247,0.1);color:var(--acc);border:1px solid rgba(124,111,247,0.25);}
.toggle-btn{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:all .15s;}
.act{background:rgba(46,201,122,0.08);color:var(--green);border-color:rgba(46,201,122,0.3);}
.act:hover{background:rgba(46,201,122,0.18);}
.deact{background:rgba(224,90,74,0.08);color:var(--red);border-color:rgba(224,90,74,0.3);}
.deact:hover{background:rgba(224,90,74,0.18);}
.toast{position:fixed;bottom:24px;right:24px;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;padding:12px 20px;font-size:13px;color:var(--tx);display:none;z-index:9999;}
.empty-row{text-align:center;padding:40px!important;color:var(--tx3);}
</style>
</head>
<body>

${authenticated ? `
<div class="wrap">
  <div class="header">
    <h1>YourBragBook Admin</h1>
    <span style="font-size:12px;color:var(--tx3);">IST: ${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</span>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num" id="s-total" style="color:var(--acc);">—</div><div class="stat-label">Total users</div></div>
    <div class="stat"><div class="stat-num" id="s-paid" style="color:var(--green);">—</div><div class="stat-label">Paid</div></div>
    <div class="stat"><div class="stat-num" id="s-free" style="color:var(--tx3);">—</div><div class="stat-label">Free / Trial</div></div>
    <div class="stat"><div class="stat-num" id="s-rzp" style="color:var(--amber);">—</div><div class="stat-label">Razorpay</div></div>
    <div class="stat"><div class="stat-num" id="s-stripe" style="color:var(--acc);">—</div><div class="stat-label">Stripe</div></div>
    <div class="stat"><div class="stat-num" id="s-entries" style="color:var(--amber);">—</div><div class="stat-label">Total entries</div></div>
  </div>

  <div class="toolbar">
    <input class="search-input" type="text" id="global-search" placeholder="Search email..." oninput="applyAll()">
    <span class="result-count" id="result-count"></span>
    <button class="clear-btn" onclick="clearAllFilters()">Clear filters</button>
    <button class="download-btn" onclick="downloadCSV()">⬇ Download CSV</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th id="th-email"><div class="th-inner" onclick="toggleDrop('email')"><span>Email</span><span class="th-icon">⌄</span></div><div class="filter-drop" id="drop-email"><input class="filter-search" placeholder="Search..." oninput="renderDrop('email',this.value)" id="search-email"><div id="opts-email"></div></div></th>
          <th id="th-country"><div class="th-inner" onclick="toggleDrop('country')"><span>Country</span><span class="th-icon">⌄</span></div><div class="filter-drop" id="drop-country"><div id="opts-country"></div></div></th>
          <th id="th-signup"><div class="th-inner" onclick="sortBy('signup_date')"><span>Signed up</span><span class="th-icon" id="icon-signup">⌄</span></div></th>
          <th id="th-renewal"><div class="th-inner" onclick="sortBy('renewal')"><span>Renewal</span><span class="th-icon" id="icon-renewal">⌄</span></div></th>
          <th id="th-gateway"><div class="th-inner" onclick="toggleDrop('gateway')"><span>Gateway</span><span class="th-icon">⌄</span></div><div class="filter-drop" id="drop-gateway"><div id="opts-gateway"></div></div></th>
          <th id="th-amount"><div class="th-inner"><span>Amount</span></div></th>
          <th id="th-entries"><div class="th-inner" onclick="sortBy('entry_count')"><span>Entries</span><span class="th-icon" id="icon-entries">⌄</span></div></th>
          <th id="th-playbooks"><div class="th-inner" onclick="sortBy('report_count')"><span>Playbooks</span><span class="th-icon" id="icon-playbooks">⌄</span></div></th>
          <th id="th-status"><div class="th-inner" onclick="toggleDrop('status')"><span>Status</span><span class="th-icon">⌄</span></div><div class="filter-drop" id="drop-status"><div id="opts-status"></div></div></th>
          <th id="th-lastlogin"><div class="th-inner" onclick="sortBy('last_login')"><span>Last login</span><span class="th-icon" id="icon-lastlogin">⌄</span></div></th>
          <th><div class="th-inner"><span>Action</span></div></th>
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
let sortCol = 'signup_date';
let sortDir = -1;
let activeFilters = { country: [], gateway: [], status: [] };

async function loadUsers() {
  const res = await fetch('/admin?p=' + PASSWORD + '&data=1');
  allUsers = await res.json();
  renderStats(allUsers);
  initDrops();
  applyAll();
}

function renderStats(u) {
  document.getElementById('s-total').textContent = u.length;
  document.getElementById('s-paid').textContent = u.filter(x=>x.is_paid).length;
  document.getElementById('s-free').textContent = u.filter(x=>!x.is_paid).length;
  document.getElementById('s-rzp').textContent = u.filter(x=>x.payment_gateway==='razorpay').length;
  document.getElementById('s-stripe').textContent = u.filter(x=>x.payment_gateway==='stripe').length;
  document.getElementById('s-entries').textContent = u.reduce((s,x)=>s+(parseInt(x.entry_count)||0),0);
}

function initDrops() {
  // Country
  const countries = [...new Set(allUsers.map(u=>u.country).filter(Boolean))].sort();
  renderDropOptions('country', countries, activeFilters.country);
  // Gateway
  const gateways = [...new Set(allUsers.map(u=>u.payment_gateway).filter(Boolean))].sort();
  renderDropOptions('gateway', gateways, activeFilters.gateway);
  // Status
  renderDropOptions('status', ['paid','free'], activeFilters.status);
}

function renderDropOptions(key, options, selected, filter='') {
  const container = document.getElementById('opts-' + key);
  const filtered_opts = filter ? options.filter(o=>o.toLowerCase().includes(filter.toLowerCase())) : options;
  container.innerHTML = filtered_opts.map(o => \`
    <div class="filter-option \${selected.includes(o)?'selected':''}" onclick="toggleFilter('\${key}','\${o}')">
      <div class="check">\${selected.includes(o)?'✓':''}</div>
      <span>\${o}</span>
    </div>
  \`).join('');
}

function renderDrop(key, filterVal) {
  const options = key === 'email'
    ? [...new Set(allUsers.map(u=>u.email).filter(Boolean))].sort()
    : key === 'country'
    ? [...new Set(allUsers.map(u=>u.country).filter(Boolean))].sort()
    : [];
  renderDropOptions(key, options, activeFilters[key]||[], filterVal);
}

function toggleFilter(key, value) {
  if (!activeFilters[key]) activeFilters[key] = [];
  const idx = activeFilters[key].indexOf(value);
  if (idx > -1) activeFilters[key].splice(idx, 1);
  else activeFilters[key].push(value);

  // Re-render the dropdown options
  const allOpts = key === 'country'
    ? [...new Set(allUsers.map(u=>u.country).filter(Boolean))].sort()
    : key === 'gateway'
    ? [...new Set(allUsers.map(u=>u.payment_gateway).filter(Boolean))].sort()
    : ['paid','free'];
  renderDropOptions(key, allOpts, activeFilters[key]);

  // Update header active state
  const thInner = document.querySelector('#th-' + key + ' .th-inner');
  if (thInner) thInner.classList.toggle('active', activeFilters[key].length > 0);

  applyAll();
}

function toggleDrop(key) {
  document.querySelectorAll('.filter-drop').forEach(d => {
    if (d.id !== 'drop-' + key) d.classList.remove('open');
  });
  document.getElementById('drop-' + key).classList.toggle('open');
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('th')) {
    document.querySelectorAll('.filter-drop').forEach(d => d.classList.remove('open'));
  }
});

function sortBy(col) {
  if (sortCol === col) sortDir *= -1;
  else { sortCol = col; sortDir = -1; }
  // Reset all icons
  ['signup','renewal','entries','playbooks','lastlogin'].forEach(k => {
    const el = document.getElementById('icon-' + k);
    if (el) el.textContent = '⌄';
  });
  const iconMap = {signup_date:'signup',renewal:'renewal',entry_count:'entries',report_count:'playbooks',last_login:'lastlogin'};
  const iconEl = document.getElementById('icon-' + iconMap[col]);
  if (iconEl) iconEl.textContent = sortDir === 1 ? '↑' : '↓';
  applyAll();
}

function applyAll() {
  const search = document.getElementById('global-search').value.toLowerCase();

  filtered = allUsers.filter(u => {
    if (search && !(u.email||'').toLowerCase().includes(search)) return false;
    if (activeFilters.country.length && !activeFilters.country.includes(u.country)) return false;
    if (activeFilters.gateway.length && !activeFilters.gateway.includes(u.payment_gateway)) return false;
    if (activeFilters.status.length) {
      const isPaid = u.is_paid ? 'paid' : 'free';
      if (!activeFilters.status.includes(isPaid)) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let av, bv;
    if (sortCol === 'signup_date') { av = new Date(a.signup_date||0); bv = new Date(b.signup_date||0); }
    else if (sortCol === 'last_login') { av = new Date(a.last_login||0); bv = new Date(b.last_login||0); }
    else if (sortCol === 'renewal') { av = new Date(renewalTs(a)); bv = new Date(renewalTs(b)); }
    else { av = parseInt(a[sortCol])||0; bv = parseInt(b[sortCol])||0; }
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });

  document.getElementById('result-count').textContent = filtered.length + ' of ' + allUsers.length + ' users';
  renderTable(filtered);
}

function renewalTs(u) {
  if (!u.signup_date) return 0;
  const d = new Date(u.signup_date);
  d.setFullYear(d.getFullYear()+1);
  return d;
}

function renewalStr(u) {
  if (!u.is_paid || !u.signup_date) return '—';
  return renewalTs(u).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

function inferAmount(gw) {
  if (gw==='razorpay') return '₹2,999';
  if (gw==='stripe') return '$29';
  return '—';
}

function renderTable(users) {
  const tbody = document.getElementById('users-table');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty-row">No users match the current filters.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => {
    const isPaid = u.is_paid;
    const signup = u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
    const gw = u.payment_gateway;
    return \`<tr>
      <td style="color:var(--tx);max-width:200px;overflow:hidden;text-overflow:ellipsis;">\${u.email||'—'}</td>
      <td>\${u.country||'—'}</td>
      <td>\${signup}</td>
      <td style="color:\${isPaid?'var(--green)':'var(--tx3)'};">\${renewalStr(u)}</td>
      <td>\${gw?'<span class="badge badge-'+gw+'">'+gw+'</span>':'—'}</td>
      <td style="font-weight:600;color:var(--tx);">\${isPaid?inferAmount(gw):'—'}</td>
      <td>\${u.entry_count||0}</td>
      <td>\${u.report_count||0}</td>
      <td><span class="badge \${isPaid?'badge-paid':'badge-free'}">\${isPaid?'Paid':'Free'}</span></td>
      <td style="color:var(--tx3);">\${u.last_login ? new Date(u.last_login).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+' '+new Date(u.last_login).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}) : '—'}</td>
      <td><button class="toggle-btn \${isPaid?'deact':'act'}" onclick="togglePaid('\${u.user_id}',\${!isPaid})">\${isPaid?'Deactivate':'Activate'}</button></td>
    </tr>\`;
  }).join('');
}

async function togglePaid(userId, isPaid) {
  const res = await fetch('/admin', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({password:PASSWORD, userId, isPaid})
  });
  const data = await res.json();
  if (data.success) { showToast(isPaid?'✓ Activated':'✓ Deactivated'); await loadUsers(); }
  else showToast('Something went wrong');
}

function clearAllFilters() {
  document.getElementById('global-search').value = '';
  activeFilters = {country:[], gateway:[], status:[]};
  document.querySelectorAll('.th-inner').forEach(t=>t.classList.remove('active'));
  initDrops();
  applyAll();
}

function downloadCSV() {
  const headers = ['Email','Country','Signed up','Renewal date','Gateway','Amount','Entries','Playbooks','Status','Last login'];
  const rows = filtered.map(u => [
    u.email||'',
    u.country||'',
    u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN') : '',
    renewalStr(u),
    u.payment_gateway||'',
    u.is_paid ? inferAmount(u.payment_gateway) : '',
    u.entry_count||0,
    u.report_count||0,
    u.is_paid?'Paid':'Free',
    u.last_login ? new Date(u.last_login).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}) : ''
  ]);
  const csv = [headers,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download='yourbragbook-users-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click(); URL.revokeObjectURL(url);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(()=>t.style.display='none', 3000);
}

loadUsers();
</script>
` : `
<div class="login-wrap">
  <div class="login-title">Admin</div>
  <form id="login-form" action="" method="get" onsubmit="return login()">
    <input type="text" name="username" value="admin" autocomplete="username" style="display:none;">
    <input class="input" type="password" id="pwd" name="p" placeholder="Password" autocomplete="current-password">
    <button type="submit" class="btn-primary">Sign in</button>
  </form>
</div>
<script>
function login(){
  const pwd=document.getElementById('pwd').value;
  if(pwd){ window.location.href='/admin?p='+encodeURIComponent(pwd); }
  return false;
}
</script>
`}

</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
