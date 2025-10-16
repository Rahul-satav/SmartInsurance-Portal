/* Simple hash router + auth + utilities */
const $ = (sel, ctx=document)=>ctx.querySelector(sel);
const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

const apiBase = ()=> window.SIP_CONFIG.API_BASE;
let state = { user: null, token: localStorage.getItem('sip_token') };

const headers = ()=> state.token ? { 'Content-Type':'application/json', 'Authorization':'Bearer '+state.token } : { 'Content-Type':'application/json' };

const navigate = (path)=>{ location.hash = path; };

const routes = {
  '/home': renderHome,
  '/login': renderLogin,
  '/register': renderRegister,
  '/calculator': renderCalculator,
  '/dashboard': renderDashboard,
  '/policies': renderPolicies,
  '/verify': renderVerify
};

function setAuthUI(){
  const loginNav = $('#loginNav');
  const logoutBtn = $('#logoutBtn');
  if(state.token){
    loginNav.style.display='none';
    logoutBtn.style.display='inline-block';
  }else{
    loginNav.style.display='inline-block';
    logoutBtn.style.display='none';
  }
}
document.addEventListener('click', e=>{
  if(e.target.id==='logoutBtn'){
    localStorage.removeItem('sip_token');
    state.token=null;
    setAuthUI();
    navigate('/login');
  }
});

async function api(path, options={}){
  const url = apiBase()+path;
  try{
    const res = await fetch(url, Object.assign({ headers: headers() }, options));
    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt || ('HTTP '+res.status));
    }
    const contentType = res.headers.get('content-type')||'';
    if(contentType.includes('application/json')) return await res.json();
    return await res.text();
  }catch(err){
    console.error('API error', err);
    throw err;
  }
}

function render(html){ $('#app').innerHTML = html; }

function router(){
  const hash = location.hash.replace('#','') || '/home';
  const [path, queryString] = hash.split('?');
  (routes[path]||renderNotFound)(new URLSearchParams(queryString||''));
  setAuthUI();
}
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

/* Views */
function renderHome(){
  render(`
    <div class="card center">
      <h1>Welcome to <span class="badge">${window.SIP_CONFIG.APP_NAME}</span></h1>
      <p>Quote, buy, and verify vehicle insurance policies online.</p>
      <div style="margin-top:14px">
        <a class="btn primary" href="#/calculator">Get Quote</a>
        <a class="btn outline" href="#/login">Login</a>
      </div>
    </div>
    <div class="grid">
      <div class="col-4"><div class="card kpi"><span class="label">Live Backend</span><span class="value">ONLINE</span></div></div>
      <div class="col-4"><div class="card kpi"><span class="label">Security</span><span class="value">JWT</span></div></div>
      <div class="col-4"><div class="card kpi"><span class="label">PDF + QR</span><span class="value">Enabled</span></div></div>
    </div>
  `);
}

function renderLogin(){
  render(`
    <div class="card">
      <h2>Login</h2>
      <div class="form-row">
        <div style="flex:1">
          <label class="label">Email</label>
          <input id="loginEmail" class="input" placeholder="user@demo.com" value="user@demo.com"/>
        </div>
        <div style="flex:1">
          <label class="label">Password</label>
          <input id="loginPass" type="password" class="input" placeholder="••••••••" value="User@1234"/>
        </div>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px">
        <button class="btn primary" id="loginBtn">Login</button>
        <a class="btn outline" href="#/register">Create account</a>
      </div>
      <div id="loginMsg" class="label" style="margin-top:10px;"></div>
    </div>
  `);
  $('#loginBtn').onclick = async ()=>{
    $('#loginMsg').textContent = 'Signing in...';
    try{
      const data = await api('/auth/login', { method:'POST', body: JSON.stringify({ email: $('#loginEmail').value, password: $('#loginPass').value }) });
      state.token = data.accessToken || data.token || data.jwt || null;
      if(!state.token) throw new Error('Token missing in response');
      localStorage.setItem('sip_token', state.token);
      $('#loginMsg').textContent = 'Success. Redirecting...';
      setTimeout(()=>navigate('/dashboard'), 600);
    }catch(e){
      $('#loginMsg').textContent = 'Login failed: '+e.message;
    }
  };
}

function renderRegister(){
  render(`
    <div class="card">
      <h2>Create Account</h2>
      <div class="form-row">
        <div style="flex:1"><label class="label">Name</label><input id="regName" class="input" placeholder="Rahul Satav"></div>
        <div style="flex:1"><label class="label">Email</label><input id="regEmail" class="input" placeholder="you@example.com"></div>
      </div>
      <div class="form-row" style="margin-top:8px">
        <div style="flex:1"><label class="label">Password</label><input id="regPass" type="password" class="input" placeholder="Min 8 chars"></div>
        <div style="flex:1"><label class="label">Role</label>
          <select id="regRole" class="input">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div style="margin-top:14px"><button class="btn primary" id="regBtn">Sign up</button></div>
      <div id="regMsg" class="label" style="margin-top:10px;"></div>
    </div>
  `);
  $('#regBtn').onclick = async ()=>{
    $('#regMsg').textContent = 'Creating account...';
    try{
      const payload = { name: $('#regName').value, email: $('#regEmail').value, password: $('#regPass').value, role: $('#regRole').value };
      const data = await api('/auth/register', { method:'POST', body: JSON.stringify(payload) });
      $('#regMsg').textContent = 'Account created. Please login.';
      setTimeout(()=>navigate('/login'), 900);
    }catch(e){
      $('#regMsg').textContent = 'Register failed: '+e.message;
    }
  };
}

function renderCalculator(){
  render(`
    <div class="card">
      <h2>Premium Calculator</h2>
      <div class="grid">
        <div class="col-6">
          <label class="label">Vehicle Type</label>
          <select id="vType" class="input">
            <option value="BIKE">Bike</option>
            <option value="CAR">Car</option>
            <option value="SUV">SUV</option>
          </select>
        </div>
        <div class="col-6">
          <label class="label">Vehicle Age (years)</label>
          <input id="vAge" type="number" class="input" value="3" min="0" max="20">
        </div>
        <div class="col-6">
          <label class="label">City Tier</label>
          <select id="city" class="input">
            <option value="TIER1">Tier 1</option>
            <option value="TIER2">Tier 2</option>
            <option value="TIER3">Tier 3</option>
          </select>
        </div>
        <div class="col-6">
          <label class="label">Liability Coverage</label>
          <select id="liability" class="input">
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        <div class="col-6">
          <label class="label">No Claim Bonus (years)</label>
          <input id="ncb" type="number" class="input" value="0" min="0" max="5">
        </div>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px">
        <button class="btn primary" id="quoteBtn">Get Quote</button>
        <button class="btn outline" id="buyBtn" disabled>Buy Policy</button>
      </div>
      <div id="quoteArea" class="card" style="display:none;margin-top:14px"></div>
    </div>
  `);
  $('#quoteBtn').onclick = onGetQuote;
  $('#buyBtn').onclick = onBuyPolicy;
}

async function onGetQuote(){
  const payload = {
    vehicleType: $('#vType').value,
    vehicleAge: parseInt($('#vAge').value,10),
    cityTier: $('#city').value,
    liability: $('#liability').value==='YES',
    ncbYears: parseInt($('#ncb').value,10)
  };
  const qa = $('#quoteArea');
  qa.style.display='block'; qa.textContent='Calculating...';
  try{
    const data = await api('/policy/quote', { method:'POST', body: JSON.stringify(payload) });
    qa.innerHTML = `
      <h3>Quote</h3>
      <table class="table">
        <tr><th>Vehicle Premium</th><td>₹ ${Number(data.vehiclePremium||0).toFixed(2)}</td></tr>
        <tr><th>Liability Premium</th><td>₹ ${Number(data.liabilityPremium||0).toFixed(2)}</td></tr>
        <tr><th>GST (18%)</th><td>₹ ${Number(data.gst||0).toFixed(2)}</td></tr>
        <tr><th><b>Total</b></th><td><b>₹ ${Number(data.total||0).toFixed(2)}</b></td></tr>
      </table>
    `;
    $('#buyBtn').disabled = false;
    // store lastQuote in memory
    window.__lastQuote = data;
  }catch(e){
    qa.textContent = 'Failed: '+e.message;
  }
}

async function onBuyPolicy(){
  if(!state.token){ alert('Please login first.'); navigate('/login'); return; }
  const qa = $('#quoteArea');
  qa.innerHTML += '<p>Issuing policy...</p>';
  try{
    const data = await api('/policy/issue', { method:'POST', body: JSON.stringify({ quote: window.__lastQuote||{} }) });
    qa.innerHTML += `
      <div class="card">
        <p>Policy issued: <b>${data.policyId||'N/A'}</b></p>
        <a class="btn outline" href="${apiBase()}/document/policy/${data.policyId||'LATEST'}.pdf" target="_blank">Download PDF</a>
        <a class="btn primary" href="#/verify?id=${data.policyId||'LATEST'}">Verify</a>
      </div>
    `;
  }catch(e){
    qa.innerHTML += '<p>Issue failed: '+e.message+'</p>';
  }
}

function renderDashboard(){
  if(!state.token){ navigate('/login'); return; }
  render(`
    <div class="grid">
      <div class="col-4"><div class="card kpi"><span class="label">Total Users</span><span class="value" id="kUsers">—</span></div></div>
      <div class="col-4"><div class="card kpi"><span class="label">Total Policies</span><span class="value" id="kPolicies">—</span></div></div>
      <div class="col-4"><div class="card kpi"><span class="label">Total Premium</span><span class="value" id="kPremium">—</span></div></div>
    </div>
    <div class="card"><canvas id="chart"></canvas></div>
  `);
  loadDashboard();
}

async function loadDashboard(){
  try{
    const data = await api('/admin/metrics');
    $('#kUsers').textContent = data.totalUsers??'—';
    $('#kPolicies').textContent = data.totalPolicies??'—';
    $('#kPremium').textContent = '₹ '+Number(data.totalPremium||0).toFixed(2);
    const ctx = $('#chart').getContext('2d');
    new Chart(ctx, {
      type:'bar',
      data:{ labels:['Bike','Car','SUV'], datasets:[{ label:'Policies by Type', data:data.byType||[5,8,3] }] }
    });
  }catch(e){
    $('#app').insertAdjacentHTML('beforeend', '<div class="card">Dashboard failed to load: '+e.message+'</div>');
  }
}

function renderPolicies(){
  if(!state.token){ navigate('/login'); return; }
  render(`<div class="card"><h2>Your Policies</h2><div id="polArea">Loading...</div></div>`);
  api('/policy/my').then(list=>{
    const area = $('#polArea');
    if(!Array.isArray(list) || !list.length){ area.textContent='No policies yet.'; return; }
    const rows = list.map(p=>`
      <tr>
        <td>${p.policyId}</td>
        <td>${p.vehicleType}</td>
        <td>₹ ${Number(p.total||0).toFixed(2)}</td>
        <td><a href="${apiBase()}/document/policy/${p.policyId}.pdf" target="_blank">PDF</a></td>
        <td><a class="btn outline" href="#/verify?id=${p.policyId}">Verify</a></td>
      </tr>`).join('');
    area.innerHTML = `<table class="table"><tr><th>ID</th><th>Type</th><th>Total</th><th>Doc</th><th></th></tr>${rows}</table>`;
  }).catch(err=>$('#polArea').textContent='Failed: '+err.message);
}

function renderVerify(q){
  const id = q.get('id')||'';
  render(`<div class="card"><h2>Verify Policy</h2>
    <label class="label">Policy ID</label>
    <input id="verId" class="input" placeholder="Enter policy id" value="${id}"/>
    <div style="margin-top:12px"><button class="btn primary" id="verBtn">Verify</button></div>
    <div id="verArea" class="card" style="display:none;margin-top:14px"></div>
  </div>`);
  $('#verBtn').onclick = async ()=>{
    const pid = $('#verId').value.trim();
    if(!pid) return;
    const area = $('#verArea'); area.style.display='block'; area.textContent='Checking...';
    try{
      const data = await api('/policy/verify/'+encodeURIComponent(pid));
      area.innerHTML = `
        <p>Status: <span class="badge">${data.valid?'VALID':'INVALID'}</span></p>
        <p>Holder: ${data.name||'—'} • Type: ${data.vehicleType||'—'} • Total: ₹ ${Number(data.total||0).toFixed(2)}</p>
      `;
    }catch(e){
      area.textContent = 'Failed: '+e.message;
    }
  };
}

function renderNotFound(){
  render('<div class="card"><h2>Not Found</h2><p>Page does not exist.</p></div>');
}