/* =========================================================
   PALOPO INOVATIF — Platform Pelatihan Mandiri
   Bidang Riset dan Inovasi Daerah Bapperida Kota Palopo
   ========================================================= */

/* ---------- DATA LAYER ---------- */
const STORE_KEY = 'palopoInovatif_v1';

const SEED = {
  users: [
    { id:'u1', nama:'Administrator Bapperida', email:'admin@palopo.go.id', password:'admin123',
      nip:'197001011990031001', opd:'Bapperida', role:'admin', wallet:999, progress:{}, certificates:[] },
    { id:'u2', nama:'Andi Muhammad Yusuf', email:'asn@palopo.go.id', password:'user123',
      nip:'198505102010011002', opd:'Bapperida', role:'user', wallet:120, progress:{}, certificates:[] }
  ],
  courses: [
    { id:'c1', judul:'Metodologi Riset Terapan untuk Kebijakan Publik', kategori:'Riset', jp:8, level:'Menengah',
      ikon:'🔬', instruktur:'Dr. Ir. Ahmad Syarif, M.Si',
      deskripsi:'Mempelajari dasar-dasar metodologi penelitian terapan untuk menghasilkan rekomendasi kebijakan berbasis bukti di lingkup Pemerintah Kota Palopo.',
      materi:[
        {judul:'Pengantar Riset Terapan', durasi:25},
        {judul:'Merumuskan Masalah & Tujuan Riset', durasi:30},
        {judul:'Metode Pengumpulan Data', durasi:35},
        {judul:'Analisis Data & Interpretasi', durasi:40},
        {judul:'Penulisan Policy Brief', durasi:30}
      ]},
    { id:'c2', judul:'Design Thinking untuk Pelayanan Publik', kategori:'Inovasi', jp:6, level:'Dasar',
      ikon:'💡', instruktur:'Ir. Nurul Hidayah, M.T.',
      deskripsi:'Pendekatan human-centered design untuk merancang inovasi pelayanan publik yang solutif dan berdampak nyata bagi masyarakat Kota Palopo.',
      materi:[
        {judul:'Prinsip Design Thinking', durasi:20},
        {judul:'Empathize & Define', durasi:30},
        {judul:'Ideate & Prototype', durasi:35},
        {judul:'Testing & Implementasi', durasi:25}
      ]},
    { id:'c3', judul:'Literasi Data & Statistik Daerah', kategori:'Data', jp:10, level:'Menengah',
      ikon:'📊', instruktur:'Dr. Siti Rahmawati, S.Si., M.Stat.',
      deskripsi:'Meningkatkan kemampuan membaca, mengolah, dan memvisualisasikan data statistik daerah untuk mendukung perencanaan pembangunan.',
      materi:[
        {judul:'Sumber Data Statistik Daerah', durasi:25},
        {judul:'Teknik Visualisasi Data', durasi:35},
        {judul:'Analisis Tren & Proyeksi', durasi:40},
        {judul:'Data Storytelling', durasi:30},
        {judul:'Studi Kasus Data Kota Palopo', durasi:45}
      ]},
    { id:'c4', judul:'Penulisan Proposal Inovasi IGA', kategori:'Inovasi', jp:8, level:'Dasar',
      ikon:'🏆', instruktur:'Hendra Gunawan, S.Kom., M.M.',
      deskripsi:'Panduan praktis menyusun proposal inovasi daerah yang memenuhi indikator Indeks Inovasi Daerah (IGA) dari Kemendagri.',
      materi:[
        {judul:'Memahami Indikator IGA', durasi:30},
        {judul:'Struktur Proposal Inovasi', durasi:35},
        {judul:'Menulis Kebaruan (Novelty)', durasi:25},
        {judul:'Dokumentasi & Bukti Dukung', durasi:30}
      ]},
    { id:'c5', judul:'Hilirisasi Riset menjadi Kebijakan', kategori:'Riset', jp:6, level:'Lanjutan',
      ikon:'🚀', instruktur:'Prof. Dr. Abdul Rahman, M.Si.',
      deskripsi:'Strategi mengubah hasil riset dan kajian menjadi produk kebijakan atau inovasi yang diadopsi oleh perangkat daerah.',
      materi:[
        {judul:'Dari Riset ke Kebijakan', durasi:25},
        {judul:'Advokasi & Komunikasi Kebijakan', durasi:30},
        {judul:'Kolaborasi Multipihak', durasi:30},
        {judul:'Monitoring Implementasi', durasi:25}
      ]},
    { id:'c6', judul:'Manajemen Inovasi Daerah', kategori:'Manajemen', jp:10, level:'Menengah',
      ikon:'⚙️', instruktur:'Drs. Muhammad Idris, M.AP.',
      deskripsi:'Mengelola siklus inovasi daerah dari ideasi, uji coba, implementasi, hingga evaluasi berkelanjutan.',
      materi:[
        {judul:'Ekosistem Inovasi Daerah', durasi:30},
        {judul:'Siklus Manajemen Inovasi', durasi:35},
        {judul:'Pengelolaan SDM Inovasi', durasi:30},
        {judul:'Evaluasi & Keberlanjutan', durasi:35}
      ]}
  ],
  researches: [
    { id:'r1', judul:'Kajian Manajemen Parkir Berbasis GIS Kota Palopo', penulis:'Bapperida × UM Palopo', tahun:2024, kategori:'Tata Ruang',
      abstrak:'Kajian penataan sistem parkir kota dengan pendekatan Sistem Informasi Geografis untuk optimalisasi retribusi dan ketertiban.' },
    { id:'r2', judul:'Penyusunan Indeks Inovasi Daerah (IGA) Kota Palopo', penulis:'Bidang Riset & Inovasi Bapperida', tahun:2024, kategori:'Inovasi',
      abstrak:'Dokumen pemetaan dan pengukuran capaian inovasi daerah berdasarkan 5 dimensi indikator Kemendagri.' },
    { id:'r3', judul:'Studi Kelayakan Kawasan Wisata Tanjung Ringgit', penulis:'Bapperida × IAIN Palopo', tahun:2023, kategori:'Pariwisata',
      abstrak:'Analisis kelayakan pengembangan kawasan wisata dengan pendekatan daya dukung lingkungan dan potensi ekonomi.' },
    { id:'r4', judul:'Pemetaan Potensi UMKM Berbasis Data Terpadu', penulis:'Bapperida Kota Palopo', tahun:2024, kategori:'Ekonomi',
      abstrak:'Identifikasi sebaran, kategori, dan potensi pengembangan UMKM Kota Palopo berbasis integrasi data lintas OPD.' }
  ],
  forum: [
    { id:'f1', userId:'u2', nama:'Andi Muhammad Yusuf', topik:'Diskusi: Indikator IGA apa yang paling sulit dipenuhi?',
      pesan:'Menurut teman-teman, dari 5 dimensi IGA, mana yang paling menantang untuk dipenuhi di OPD masing-masing?',
      tanggal:'2024-11-20', replies:[
        { nama:'Administrator Bapperida', pesan:'Biasanya dimensi "Kebaruan" yang paling menantang. Perlu dokumentasi bukti sejak awal perencanaan.' }
      ]}
  ]
};

function loadDB(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw){ localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return JSON.parse(JSON.stringify(SEED)); }
    return JSON.parse(raw);
  }catch(e){ return JSON.parse(JSON.stringify(SEED)); }
}
function saveDB(){ localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }

let DB = loadDB();
let currentUser = null;
let currentView = 'dashboard';
let activeCourseId = null;

/* ---------- UTIL ---------- */
function $(s){ return document.querySelector(s); }
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtDate(d){ return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}); }
function init(name){ return name ? name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : '?'; }
function today(){ return new Date().toISOString().slice(0,10); }

function toast(msg, type=''){
  const t = $('#toast');
  t.textContent = msg;
  t.className = type ? type : '';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 2600);
}
function openModal(html){ $('#modalBox').innerHTML = html; $('#modal').classList.add('open'); }
function closeModal(){ $('#modal').classList.remove('open'); }
function toggleSidebar(){
  $('#sidebar').classList.toggle('open');
  $('#overlay').classList.toggle('show');
}

/* ---------- AUTH ---------- */
function switchAuth(mode){
  $('#tabLogin').classList.toggle('active', mode==='login');
  $('#tabReg').classList.toggle('active', mode==='reg');
  $('#loginForm').classList.toggle('hidden', mode!=='login');
  $('#regForm').classList.toggle('hidden', mode!=='reg');
}
function fillDemo(role){
  if(role==='admin'){ $('#loginEmail').value='admin@palopo.go.id'; $('#loginPass').value='admin123'; }
  else { $('#loginEmail').value='asn@palopo.go.id'; $('#loginPass').value='user123'; }
  toast('Kredensial demo terisi', 'success');
}
function doLogin(e){
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase();
  const pass = $('#loginPass').value;
  const u = DB.users.find(x=>x.email.toLowerCase()===email && x.password===pass);
  if(!u){ toast('Email atau password salah', 'error'); return; }
  currentUser = u;
  localStorage.setItem('palopoInovatif_active', u.id);
  enterApp();
  toast('Selamat datang, ' + u.nama.split(' ')[0] + '!', 'success');
}
function doRegister(e){
  e.preventDefault();
  const email = $('#regEmail').value.trim().toLowerCase();
  if(DB.users.some(u=>u.email.toLowerCase()===email)){ toast('Email sudah terdaftar', 'error'); return; }
  const user = {
    id:'u'+Date.now(), nama:$('#regName').value.trim(), email,
    password:$('#regPass').value, nip:$('#regNip').value.trim(),
    opd:$('#regOpd').value.trim(), role:'user', wallet:100, progress:{}, certificates:[]
  };
  DB.users.push(user); saveDB();
  currentUser = user;
  localStorage.setItem('palopoInovatif_active', user.id);
  enterApp();
  toast('Registrasi berhasil! Wallet awal 100 JP', 'success');
}
function logout(){
  localStorage.removeItem('palopoInovatif_active');
  currentUser = null;
  $('#app').classList.add('hidden');
  $('#loginScreen').classList.remove('hidden');
  switchAuth('login');
  toast('Anda telah keluar');
}

/* ---------- APP ENTRY ---------- */
function enterApp(){
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderNav();
  renderTopbar();
  navigate(currentUser.role==='admin' ? 'admin-dashboard' : 'dashboard');
}

function renderTopbar(){
  $('#topAvatar').textContent = init(currentUser.nama);
  $('#topName').textContent = currentUser.nama;
  $('#topRole').textContent = currentUser.role==='admin' ? '👑 Administrator' : currentUser.opd;
}

function renderNav(){
  const isAdmin = currentUser.role==='admin';
  const menu = isAdmin ? [
    { sec:'Administrator' },
    { id:'admin-dashboard', ico:'📊', label:'Dashboard' },
    { id:'admin-kursus',    ico:'📚', label:'Kelola Kursus' },
    { id:'admin-pengguna',  ico:'👥', label:'Kelola Pengguna' },
    { id:'admin-laporan',   ico:'📈', label:'Laporan & Statistik' },
    { sec:'Konten Publik' },
    { id:'repositori',      ico:'🗂️', label:'Repositori Riset' },
    { id:'forum',           ico:'💬', label:'Forum Diskusi' },
    { sec:'Akun' },
    { id:'profil',          ico:'⚙️', label:'Profil Saya' },
    { id:'logout',          ico:'🚪', label:'Keluar' }
  ] : [
    { sec:'Menu Utama' },
    { id:'dashboard',     ico:'🏠', label:'Dashboard' },
    { id:'katalog',       ico:'🛒', label:'Katalog Kursus' },
    { id:'kursus-saya',   ico:'📖', label:'Kursus Saya' },
    { id:'wallet',        ico:'👛', label:'Learning Wallet' },
    { sec:'Pengetahuan' },
    { id:'repositori',    ico:'🗂️', label:'Repositori Riset' },
    { id:'forum',         ico:'💬', label:'Forum Diskusi' },
    { sec:'Pencapaian' },
    { id:'sertifikat',    ico:'🏅', label:'Sertifikat Saya' },
    { id:'profil',        ico:'⚙️', label:'Profil Saya' },
    { id:'logout',        ico:'🚪', label:'Keluar' }
  ];
  $('#navMenu').innerHTML = menu.map(m => {
    if(m.sec) return `<div class="nav-section">${m.sec}</div>`;
    return `<div class="nav-item" data-view="${m.id}" onclick="navClick('${m.id}')">
      <span class="ico">${m.ico}</span>${m.label}</div>`;
  }).join('');
}
function navClick(id){
  if(id==='logout'){ logout(); return; }
  navigate(id);
  if(window.innerWidth<=900) toggleSidebar();
}

function setActiveNav(view){
  document.querySelectorAll('.nav-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.view===view);
  });
}

function navigate(view){
  currentView = view;
  setActiveNav(view);
  const titles = {
    'dashboard':'Dashboard','katalog':'Katalog Kursus','kursus-saya':'Kursus Saya',
    'wallet':'Learning Wallet','repositori':'Repositori Riset','forum':'Forum Diskusi',
    'sertifikat':'Sertifikat Saya','profil':'Profil Saya','player':'Ruang Belajar',
    'admin-dashboard':'Dashboard Admin','admin-kursus':'Kelola Kursus',
    'admin-pengguna':'Kelola Pengguna','admin-laporan':'Laporan & Statistik'
  };
  $('#pageTitle').textContent = titles[view] || 'Palopo Inovatif';
  const render = {
    'dashboard': viewDashboard, 'katalog': viewKatalog, 'kursus-saya': viewKursusSaya,
    'wallet': viewWallet, 'repositori': viewRepositori, 'forum': viewForum,
    'sertifikat': viewSertifikat, 'profil': viewProfil, 'player': viewPlayer,
    'admin-dashboard': viewAdminDash, 'admin-kursus': viewAdminKursus,
    'admin-pengguna': viewAdminPengguna, 'admin-laporan': viewAdminLaporan
  }[view];
  $('#viewContainer').innerHTML = render ? render() : '<div class="empty">Halaman tidak ditemukan</div>';
  window.scrollTo(0,0);
}

/* ---------- HELPERS ---------- */
function getCourse(id){ return DB.courses.find(c=>c.id===id); }
function progressPct(courseId){
  const c = getCourse(courseId); if(!c) return 0;
  const done = (currentUser.progress[courseId]||[]).length;
  return Math.round(done / c.materi.length * 100);
}
function isEnrolled(courseId){ return currentUser.progress[courseId] !== undefined; }
function courseIcon(c){ return c.ikon || '📘'; }

/* ---------- VIEWS — USER ---------- */
function viewDashboard(){
  const enrolled = Object.keys(currentUser.progress);
  const done = enrolled.filter(id => progressPct(id)===100).length;
  const totalJP = enrolled.reduce((s,id)=>{ const c=getCourse(id); return s + (c?c.jp:0); },0);

  const recent = enrolled.slice(-3).reverse().map(id=>{
    const c = getCourse(id); if(!c) return '';
    const pct = progressPct(id);
    return `<div class="course-card">
      <div class="course-thumb">${courseIcon(c)}<span class="badge-lvl">${c.level}</span></div>
      <div class="course-body">
        <div class="cat">${c.kategori}</div>
        <h4>${esc(c.judul)}</h4>
        <div class="progress-bar"><div style="width:${pct}%"></div></div>
        <div class="course-meta"><span>📈 ${pct}% selesai</span><span>${c.jp} JP</span></div>
        <button class="btn btn-primary btn-sm" onclick="openCourse('${c.id}')">Lanjutkan</button>
      </div></div>`;
  }).join('') || '<div class="empty"><div class="ico">📚</div><h4>Belum ada kursus</h4><p>Mulai belajar dengan mengikuti kursus pertama Anda.</p></div>';

  return `
    <div class="grid grid-4">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${enrolled.length}</div><div class="lbl">Kursus Diikuti</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">✅</div><div><div class="num">${done}</div><div class="lbl">Kursus Selesai</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">👛</div><div><div class="num">${currentUser.wallet}</div><div class="lbl">Saldo JP</div></div></div>
      <div class="card stat-card"><div class="ic ic-red">🏅</div><div><div class="num">${currentUser.certificates.length}</div><div class="lbl">Sertifikat</div></div></div>
    </div>

    <div class="section-title">⚡ Lanjutkan Belajar <small>${totalJP} JP total diikuti</small></div>
    <div class="grid grid-3">${recent}</div>

    <div class="section-title">🎯 Rekomendasi Kursus</div>
    <div class="grid grid-3">${DB.courses.slice(0,3).map(c=>courseCardHTML(c)).join('')}</div>
  `;
}

function courseCardHTML(c){
  const enrolled = isEnrolled(c.id);
  const pct = enrolled ? progressPct(c.id) : 0;
  return `<div class="course-card">
    <div class="course-thumb">${courseIcon(c)}<span class="badge-lvl">${c.level}</span></div>
    <div class="course-body">
      <div class="cat">${c.kategori}</div>
      <h4>${esc(c.judul)}</h4>
      <p>${esc(c.deskripsi).slice(0,90)}...</p>
      ${enrolled ? `<div class="progress-bar"><div style="width:${pct}%"></div></div>` : ''}
      <div class="course-meta">
        <span>👨‍🏫 ${esc(c.instruktur.split(',')[0])}</span>
        <span>💰 ${c.jp} JP</span>
      </div>
      ${enrolled
        ? `<button class="btn btn-primary btn-sm" onclick="openCourse('${c.id}')">▶ Lanjutkan (${pct}%)</button>`
        : `<button class="btn btn-gold btn-sm" onclick="enroll('${c.id}')">🛒 Ikuti Kursus</button>`}
    </div>
  </div>`;
}

function viewKatalog(){
  return `
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <input type="text" id="searchCourse" placeholder="🔍 Cari kursus..." oninput="filterKatalog()" style="flex:1;min-width:180px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px" />
        <select id="filterCat" onchange="filterKatalog()" style="padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;background:#fff">
          <option value="">Semua Kategori</option>
          ${[...new Set(DB.courses.map(c=>c.kategori))].map(k=>`<option>${k}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="grid grid-3" id="katalogGrid">${DB.courses.map(c=>courseCardHTML(c)).join('')}</div>
  `;
}
function filterKatalog(){
  const q = ($('#searchCourse')?.value||'').toLowerCase();
  const cat = $('#filterCat')?.value||'';
  const list = DB.courses.filter(c=>
    (!q || c.judul.toLowerCase().includes(q) || c.deskripsi.toLowerCase().includes(q)) &&
    (!cat || c.kategori===cat)
  );
  $('#katalogGrid').innerHTML = list.length
    ? list.map(c=>courseCardHTML(c)).join('')
    : '<div class="empty" style="grid-column:1/-1"><div class="ico">🔍</div><h4>Tidak ditemukan</h4><p>Coba kata kunci lain.</p></div>';
}

function viewKursusSaya(){
  const ids = Object.keys(currentUser.progress);
  if(!ids.length) return `<div class="empty"><div class="ico">📖</div><h4>Belum ada kursus</h4><p>Kunjungi katalog untuk memulai pembelajaran.</p><br><button class="btn btn-primary" onclick="navigate('katalog')" style="display:inline-flex">🛒 Buka Katalog</button></div>`;
  return `<div class="grid grid-3">${ids.map(id=>{ const c=getCourse(id); return c?courseCardHTML(c):''; }).join('')}</div>`;
}

function enroll(courseId){
  const c = getCourse(courseId);
  if(!c) return;
  if(currentUser.wallet < c.jp){ toast('Saldo JP tidak cukup. Saldo Anda: '+currentUser.wallet+' JP', 'error'); return; }
  openModal(`
    <h3>🛒 Konfirmasi Pendaftaran</h3>
    <p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin-bottom:14px">
      Anda akan mendaftar kursus <b>${esc(c.judul)}</b>.<br>
      Biaya: <b style="color:var(--gold)">${c.jp} JP</b><br>
      Saldo saat ini: <b>${currentUser.wallet} JP</b><br>
      Setelah mendaftar: <b>${currentUser.wallet - c.jp} JP</b>
    </p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="confirmEnroll('${courseId}')">✅ Konfirmasi</button>
    </div>
  `);
}
function confirmEnroll(courseId){
  const c = getCourse(courseId);
  currentUser.wallet -= c.jp;
  currentUser.progress[courseId] = [];
  saveDB();
  closeModal();
  toast('Berhasil mendaftar kursus!', 'success');
  openCourse(courseId);
}

function openCourse(courseId){
  activeCourseId = courseId;
  navigate('player');
}

function viewPlayer(){
  const c = getCourse(activeCourseId);
  if(!c) return '<div class="empty">Kursus tidak ditemukan</div>';
  const done = currentUser.progress[c.id] || [];
  const pct = progressPct(c.id);
  const isAdmin = currentUser.role==='admin';

  const materiList = c.materi.map((m,i)=>{
    const completed = done.includes(i);
    return `<div class="material-item ${completed?'done':''}" onclick="toggleMateri('${c.id}',${i})">
      <div class="idx">${completed?'✓':i+1}</div>
      <div style="flex:1">
        <div class="t">${esc(m.judul)}</div>
        <div class="d">⏱️ ${m.durasi} menit</div>
      </div>
      <div style="font-size:18px">${completed?'✅':'⭕'}</div>
    </div>`;
  }).join('');

  const certReady = pct===100;
  const certExist = currentUser.certificates.includes(c.id);

  return `
    <button class="btn btn-ghost btn-sm" onclick="navigate('kursus-saya')" style="margin-bottom:14px">← Kembali</button>
    <div class="player-layout">
      <div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
            <div style="width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,var(--navy-700),var(--blue-500));display:flex;align-items:center;justify-content:center;font-size:28px">${courseIcon(c)}</div>
            <div style="flex:1">
              <div style="font-size:11px;color:var(--blue-500);font-weight:700;text-transform:uppercase">${c.kategori} • ${c.level}</div>
              <h3 style="font-size:18px;color:var(--navy-800);margin-top:3px">${esc(c.judul)}</h3>
              <div style="font-size:12px;color:var(--muted);margin-top:3px">👨‍🏫 ${esc(c.instruktur)}</div>
            </div>
          </div>
          <p style="font-size:13.5px;color:var(--muted);line-height:1.7;margin-bottom:16px">${esc(c.deskripsi)}</p>

          <div style="background:var(--bg);padding:14px;border-radius:10px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <b style="font-size:13px;color:var(--navy-800)">Progress Belajar</b>
              <b style="font-size:13px;color:var(--blue-500)">${pct}%</b>
            </div>
            <div class="progress-bar" style="height:10px"><div style="width:${pct}%"></div></div>
            <div style="font-size:11.5px;color:var(--muted);margin-top:8px">${done.length} dari ${c.materi.length} materi diselesaikan</div>
          </div>

          ${certReady ? (certExist
            ? `<div class="card" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:none;text-align:center;margin-bottom:16px">
                <div style="font-size:36px">🏅</div>
                <b style="color:#92400e">Selamat! Anda telah menyelesaikan kursus ini.</b><br>
                <button class="btn btn-gold btn-sm" style="margin-top:10px" onclick="navigate('sertifikat')">Lihat Sertifikat</button>
              </div>`
            : `<div class="card" style="background:#f0fdf4;border:1.5px solid #86efac;text-align:center;margin-bottom:16px">
                <div style="font-size:32px">🎉</div>
                <b style="color:#166534">Kursus selesai! Ambil sertifikat Anda sekarang.</b><br>
                <button class="btn btn-success btn-sm" style="margin-top:10px" onclick="issueCert('${c.id}')">🏅 Terbitkan Sertifikat</button>
              </div>`) : ''}
        </div>

        <div class="section-title">📚 Daftar Materi</div>
        ${materiList}
      </div>

      <div>
        <div class="card" style="position:sticky;top:90px">
          <b style="font-size:13.5px;color:var(--navy-800);display:block;margin-bottom:12px">📋 Informasi Kursus</b>
          <div style="font-size:12.5px;color:var(--muted);line-height:2">
            <div>📂 Kategori: <b style="color:var(--navy-700)">${c.kategori}</b></div>
            <div>📊 Level: <b style="color:var(--navy-700)">${c.level}</b></div>
            <div>💰 Biaya: <b style="color:var(--navy-700)">${c.jp} JP</b></div>
            <div>📖 Materi: <b style="color:var(--navy-700)">${c.materi.length} modul</b></div>
            <div>⏱️ Durasi: <b style="color:var(--navy-700)">${c.materi.reduce((s,m)=>s+m.durasi,0)} menit</b></div>
          </div>
        </div>
        ${isAdmin ? `<div class="card" style="margin-top:14px;background:#fef3c7;border:none">
          <b style="font-size:12.5px;color:#92400e">👑 Mode Admin</b>
          <p style="font-size:12px;color:#92400e;margin-top:6px;line-height:1.5">Anda melihat kursus ini sebagai administrator.</p>
        </div>` : ''}
      </div>
    </div>
  `;
}

function toggleMateri(courseId, idx){
  if(currentUser.role==='admin'){ toast('Admin tidak perlu menandai materi'); return; }
  const arr = currentUser.progress[courseId] || [];
  const pos = arr.indexOf(idx);
  if(pos>=0) arr.splice(pos,1); else arr.push(idx);
  currentUser.progress[courseId] = arr;
  saveDB();
  navigate('player');
}

function issueCert(courseId){
  if(!currentUser.certificates.includes(courseId)){
    currentUser.certificates.push(courseId);
    saveDB();
    toast('🎉 Sertifikat berhasil diterbitkan!', 'success');
  }
  navigate('sertifikat');
}

function viewWallet(){
  const tx = Object.keys(currentUser.progress).map(id=>{
    const c = getCourse(id); if(!c) return '';
    return `<tr>
      <td><b>${esc(c.judul)}</b></td>
      <td><span class="tag tag-blue">${c.kategori}</span></td>
      <td style="color:var(--danger);font-weight:700">-${c.jp} JP</td>
      <td>${isEnrolled(id)?(progressPct(id)===100?'<span class="tag tag-green">Selesai</span>':'<span class="tag tag-gold">Proses</span>'):''}</td>
    </tr>`;
  }).join('');
  const totalSpent = Object.keys(currentUser.progress).reduce((s,id)=>{ const c=getCourse(id); return s + (c?c.jp:0); },0);

  return `
    <div class="card" style="background:linear-gradient(135deg,var(--navy-800),var(--blue-500));color:#fff;padding:26px;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-30px;top:-30px;font-size:150px;opacity:.08">👛</div>
      <div style="position:relative">
        <div style="font-size:12px;opacity:.8;text-transform:uppercase;letter-spacing:1px">Saldo Learning Wallet</div>
        <div style="font-size:42px;font-weight:800;margin:6px 0">${currentUser.wallet} <span style="font-size:16px;opacity:.8">JP</span></div>
        <div style="font-size:12.5px;opacity:.85">Jam Pelajaran tersedia untuk mengikuti kursus</div>
        <div style="display:flex;gap:20px;margin-top:16px;font-size:12px;opacity:.9">
          <div>💸 Terpakai: <b>${totalSpent} JP</b></div>
          <div>📚 Kursus: <b>${Object.keys(currentUser.progress).length}</b></div>
        </div>
      </div>
    </div>

    <div class="section-title">📊 Riwayat Penggunaan</div>
    ${tx ? `<div class="card" style="overflow-x:auto;padding:0"><table>
      <thead><tr><th>Kursus</th><th>Kategori</th><th>Biaya</th><th>Status</th></tr></thead>
      <tbody>${tx}</tbody>
    </table></div>` : '<div class="empty"><div class="ico">👛</div><h4>Belum ada transaksi</h4><p>Ikuti kursus untuk menggunakan JP Anda.</p></div>'}

    <div class="section-title">💡 Cara Kerja Learning Wallet</div>
    <div class="grid grid-3">
      <div class="card"><div style="font-size:26px">1️⃣</div><b style="display:block;margin:8px 0 4px;color:var(--navy-800)">Dapatkan JP</b><p style="font-size:12.5px;color:var(--muted);line-height:1.6">Setiap ASN mendapat alokasi Jam Pelajaran untuk pengembangan kompetensi.</p></div>
      <div class="card"><div style="font-size:26px">2️⃣</div><b style="display:block;margin:8px 0 4px;color:var(--navy-800)">Pilih Kursus</b><p style="font-size:12.5px;color:var(--muted);line-height:1.6">Gunakan JP untuk mendaftar kursus sesuai kebutuhan kompetensi Anda.</p></div>
      <div class="card"><div style="font-size:26px">3️⃣</div><b style="display:block;margin:8px 0 4px;color:var(--navy-800)">Belajar & Sertifikasi</b><p style="font-size:12.5px;color:var(--muted);line-height:1.6">Selesaikan materi dan dapatkan sertifikat digital yang diakui.</p></div>
    </div>
  `;
}

function viewRepositori(){
  const list = DB.researches.map(r=>`
    <div class="repo-card" onclick="openRepo('${r.id}')">
      <div class="ic">📄</div>
      <div style="flex:1">
        <h4>${esc(r.judul)}</h4>
        <p>${esc(r.abstrak).slice(0,110)}...</p>
        <div class="meta">👤 ${esc(r.penulis)} • 📅 ${r.tahun} • <span class="tag tag-blue">${r.kategori}</span></div>
      </div>
    </div>
  `).join('');
  return `
    <div class="card" style="background:linear-gradient(135deg,var(--navy-800),var(--navy-600));color:#fff;margin-bottom:18px;padding:22px">
      <div style="font-size:32px;margin-bottom:6px">🗂️</div>
      <b style="font-size:16px">Repositori Riset & Inovasi Daerah</b>
      <p style="font-size:13px;opacity:.85;margin-top:6px;line-height:1.6">Bank pengetahuan hasil kajian dan riset Bapperida Kota Palopo beserta mitra akademisi.</p>
    </div>
    <div class="grid grid-2">${list}</div>
  `;
}
function openRepo(id){
  const r = DB.researches.find(x=>x.id===id);
  openModal(`
    <h3>📄 ${esc(r.judul)}</h3>
    <div style="font-size:12px;color:var(--blue-500);margin-bottom:12px">👤 ${esc(r.penulis)} • 📅 ${r.tahun} • <span class="tag tag-blue">${r.kategori}</span></div>
    <p style="font-size:13.5px;color:var(--text);line-height:1.7;margin-bottom:14px">${esc(r.abstrak)}</p>
    <div style="background:var(--bg);padding:12px;border-radius:10px;font-size:12px;color:var(--muted)">
      💡 Dokumen lengkap dapat diminta melalui Bidang Riset dan Inovasi Daerah Bapperida Kota Palopo.
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Tutup</button>
    </div>
  `);
}

function viewForum(){
  const posts = DB.forum.map(f=>`
    <div class="forum-post">
      <div class="head">
        <div class="avatar">${init(f.nama)}</div>
        <div class="meta" style="flex:1">
          <b>${esc(f.nama)}</b>
          <span>📅 ${fmtDate(f.tanggal)}</span>
        </div>
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--navy-800);margin-bottom:6px">${esc(f.topik)}</div>
      <div class="body">${esc(f.pesan)}</div>
      ${f.replies.map(r=>`<div class="reply"><b>${esc(r.nama)}:</b> ${esc(r.pesan)}</div>`).join('')}
      <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="replyForum('${f.id}')">💬 Balas</button>
    </div>
  `).join('');
  return `
    <div class="card" style="margin-bottom:16px">
      <b style="display:block;margin-bottom:10px;color:var(--navy-800);font-size:14px">✍️ Mulai Diskusi Baru</b>
      <div class="field"><input type="text" id="forumTopik" placeholder="Judul topik diskusi" /></div>
      <div class="field"><textarea id="forumPesan" rows="3" placeholder="Tuliskan pertanyaan atau pendapat Anda..."></textarea></div>
      <button class="btn btn-primary btn-sm" onclick="addForum()">📤 Kirim Diskusi</button>
    </div>
    ${posts || '<div class="empty"><div class="ico">💬</div><h4>Belum ada diskusi</h4><p>Mulai diskusi pertama!</p></div>'}
  `;
}
function addForum(){
  const topik = $('#forumTopik').value.trim();
  const pesan = $('#forumPesan').value.trim();
  if(!topik || !pesan){ toast('Lengkapi topik dan pesan', 'error'); return; }
  DB.forum.unshift({
    id:'f'+Date.now(), userId:currentUser.id, nama:currentUser.nama,
    topik, pesan, tanggal:today(), replies:[]
  });
  saveDB(); navigate('forum');
  toast('Diskusi berhasil diposting!', 'success');
}
function replyForum(id){
  openModal(`
    <h3>💬 Balas Diskusi</h3>
    <div class="field"><textarea id="replyText" rows="4" placeholder="Tulis balasan Anda..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="submitReply('${id}')">Kirim Balasan</button>
    </div>
  `);
}
function submitReply(id){
  const text = $('#replyText').value.trim();
  if(!text){ toast('Balasan tidak boleh kosong', 'error'); return; }
  const f = DB.forum.find(x=>x.id===id);
  f.replies.push({nama:currentUser.nama, pesan:text});
  saveDB(); closeModal(); navigate('forum');
  toast('Balasan terkirim!', 'success');
}

function viewSertifikat(){
  if(!currentUser.certificates.length){
    return `<div class="empty"><div class="ico">🏅</div><h4>Belum ada sertifikat</h4><p>Selesaikan kursus 100% untuk mendapatkan sertifikat digital.</p><br><button class="btn btn-primary" onclick="navigate('katalog')" style="display:inline-flex">📚 Mulai Belajar</button></div>`;
  }
  return `<div class="grid grid-2">${currentUser.certificates.map(id=>{
    const c = getCourse(id); if(!c) return '';
    return `<div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;text-align:center;padding:24px">
      <div style="font-size:50px">🏅</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;font-weight:700;margin-top:8px">Sertifikat Kelulusan</div>
      <h3 style="font-size:15px;color:var(--navy-800);margin:10px 0">${esc(c.judul)}</h3>
      <div style="font-size:12px;color:var(--muted)">Diberikan kepada</div>
      <b style="font-size:15px;color:var(--navy-800);display:block;margin:4px 0">${esc(currentUser.nama)}</b>
      <div style="font-size:11.5px;color:var(--muted);margin:8px 0">${c.jp} JP • ${c.kategori} • ${c.level}</div>
      <div style="font-size:10px;color:#92400e;margin-bottom:12px">No: PI/${c.id.toUpperCase()}/${new Date().getFullYear()}/${currentUser.id.slice(-4)}</div>
      <button class="btn btn-gold btn-sm" onclick="printCert('${c.id}')">🖨️ Cetak / Simpan PDF</button>
    </div>`;
  }).join('')}</div>`;
}
function printCert(id){
  const c = getCourse(id);
  const w = window.open('', '', 'width=900,height=650');
  w.document.write(`
    <html><head><title>Sertifikat - ${c.judul}</title>
    <style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}
      .cert{border:14px double #0f2140;padding:50px 60px;text-align:center;background:#fff;max-width:760px;box-shadow:0 20px 50px rgba(0,0,0,.15)}
      h1{color:#0f2140;font-size:34px;letter-spacing:2px;margin:0}
      .sub{color:#f59e0b;letter-spacing:6px;font-size:12px;margin:6px 0 22px;font-weight:700}
      h2{font-size:24px;color:#2563eb;margin:18px 0}
      .name{font-size:30px;color:#0f2140;font-weight:700;border-bottom:3px solid #f59e0b;display:inline-block;padding:0 20px 8px;margin:16px 0}
      p{font-size:14px;color:#475569;line-height:1.8;margin:14px 0}
      .foot{margin-top:36px;display:flex;justify-content:space-between;font-size:12px;color:#64748b}
    </style></head><body>
    <div class="cert">
      <h1>PALOPO INOVATIF</h1>
      <div class="sub">SERTIFIKAT KELULUSAN</div>
      <p>Diberikan kepada:</p>
      <div class="name">${esc(currentUser.nama)}</div>
      <p>Telah menyelesaikan kursus pelatihan mandiri:</p>
      <h2>${esc(c.judul)}</h2>
      <p>Dengan beban ${c.jp} Jam Pelajaran (JP) kategori ${c.kategori} tingkat ${c.level}.<br>
      Diselenggarakan oleh Bidang Riset dan Inovasi Daerah<br>Bapperida Kota Palopo.</p>
      <div class="foot">
        <div>No: PI/${c.id.toUpperCase()}/${new Date().getFullYear()}/${currentUser.id.slice(-4)}</div>
        <div>Palopo, ${fmtDate(today())}</div>
      </div>
    </div>
    <script>setTimeout(()=>window.print(),400)<\/script>
    </body></html>
  `);
  w.document.close();
}

function viewProfil(){
  return `
    <div class="card" style="text-align:center;padding:26px;background:linear-gradient(135deg,var(--navy-800),var(--navy-600));color:#fff;margin-bottom:18px">
      <div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;margin:0 auto 12px;border:3px solid rgba(255,255,255,.3)">${init(currentUser.nama)}</div>
      <h3 style="font-size:18px">${esc(currentUser.nama)}</h3>
      <div style="font-size:12.5px;opacity:.85;margin-top:4px">${esc(currentUser.email)}</div>
      <div style="display:inline-block;margin-top:10px;padding:4px 12px;border-radius:20px;background:rgba(245,158,11,.9);font-size:11px;font-weight:700">${currentUser.role==='admin'?'👑 Administrator':'👤 Peserta'}</div>
    </div>

    <div class="card">
      <b style="display:block;margin-bottom:14px;color:var(--navy-800)">📋 Data Kepegawaian</b>
      <table>
        <tr><td style="color:var(--muted);width:150px">Nama Lengkap</td><td><b>${esc(currentUser.nama)}</b></td></tr>
        <tr><td style="color:var(--muted)">Email</td><td>${esc(currentUser.email)}</td></tr>
        <tr><td style="color:var(--muted)">NIP</td><td>${esc(currentUser.nip||'-')}</td></tr>
        <tr><td style="color:var(--muted)">OPD</td><td>${esc(currentUser.opd||'-')}</td></tr>
        <tr><td style="color:var(--muted)">Saldo JP</td><td><b style="color:var(--gold)">${currentUser.wallet} JP</b></td></tr>
        <tr><td style="color:var(--muted)">Kursus Diikuti</td><td>${Object.keys(currentUser.progress).length}</td></tr>
        <tr><td style="color:var(--muted)">Sertifikat</td><td>${currentUser.certificates.length}</td></tr>
      </table>
    </div>

    <div class="card" style="margin-top:16px">
      <b style="display:block;margin-bottom:12px;color:var(--navy-800)">🔒 Keamanan</b>
      <button class="btn btn-ghost btn-sm" onclick="changePass()">🔑 Ubah Password</button>
      <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="logout()">🚪 Keluar</button>
    </div>
  `;
}
function changePass(){
  openModal(`
    <h3>🔑 Ubah Password</h3>
    <div class="field"><label>Password Lama</label><input type="password" id="oldPass" /></div>
    <div class="field"><label>Password Baru</label><input type="password" id="newPass" /></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="savePass()">Simpan</button>
    </div>
  `);
}
function savePass(){
  const o = $('#oldPass').value, n = $('#newPass').value;
  if(o !== currentUser.password){ toast('Password lama salah', 'error'); return; }
  if(n.length < 4){ toast('Password minimal 4 karakter', 'error'); return; }
  const u = DB.users.find(x=>x.id===currentUser.id);
  u.password = n; currentUser.password = n;
  saveDB(); closeModal();
  toast('Password berhasil diubah!', 'success');
}

/* ---------- VIEWS — ADMIN ---------- */
function viewAdminDash(){
  const totalUsers = DB.users.filter(u=>u.role==='user').length;
  const totalEnroll = DB.users.reduce((s,u)=>s+Object.keys(u.progress).length,0);
  const totalCert = DB.users.reduce((s,u)=>s+u.certificates.length,0);
  const totalJP = DB.users.reduce((s,u)=>s+Object.keys(u.progress).reduce((a,id)=>{ const c=getCourse(id); return a+(c?c.jp:0); },0),0);

  const topCourses = DB.courses.map(c=>{
    const enrolls = DB.users.filter(u=>u.progress[c.id]!==undefined).length;
    return { c, enrolls };
  }).sort((a,b)=>b.enrolls-a.enrolls).slice(0,5);

  return `
    <div class="grid grid-4">
      <div class="card stat-card"><div class="ic ic-blue">👥</div><div><div class="num">${totalUsers}</div><div class="lbl">Total Peserta</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">📚</div><div><div class="num">${DB.courses.length}</div><div class="lbl">Total Kursus</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">✅</div><div><div class="num">${totalEnroll}</div><div class="lbl">Total Pendaftaran</div></div></div>
      <div class="card stat-card"><div class="ic ic-red">🏅</div><div><div class="num">${totalCert}</div><div class="lbl">Sertifikat Terbit</div></div></div>
    </div>

    <div class="section-title">📊 Kursus Terpopuler</div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Peserta</th><th>JP</th></tr></thead>
        <tbody>${topCourses.map(t=>`<tr>
          <td><b>${t.c.ikon} ${esc(t.c.judul)}</b></td>
          <td><span class="tag tag-blue">${t.c.kategori}</span></td>
          <td>${t.enrolls} peserta</td>
          <td>${t.c.jp} JP</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="grid grid-2" style="margin-top:20px">
      <div class="card" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border:none">
        <div style="font-size:30px">💰</div>
        <b style="font-size:16px;color:var(--navy-800);display:block;margin:8px 0 4px">Total JP Terpakai</b>
        <div style="font-size:28px;font-weight:800;color:var(--blue-500)">${totalJP} JP</div>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:none">
        <div style="font-size:30px">📈</div>
        <b style="font-size:16px;color:#92400e;display:block;margin:8px 0 4px">Rata-rata Kursus/Peserta</b>
        <div style="font-size:28px;font-weight:800;color:#b45309">${totalUsers?(totalEnroll/totalUsers).toFixed(1):0}</div>
      </div>
    </div>

    <div class="section-title">⚡ Aksi Cepat</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="formCourse()">➕ Tambah Kursus</button>
      <button class="btn btn-ghost" onclick="navigate('admin-pengguna')">👥 Kelola Pengguna</button>
      <button class="btn btn-ghost" onclick="navigate('admin-laporan')">📈 Lihat Laporan</button>
    </div>
  `;
}

function viewAdminKursus(){
  return `
    <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-primary" onclick="formCourse()">➕ Tambah Kursus Baru</button>
    </div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Level</th><th>JP</th><th>Materi</th><th>Peserta</th><th>Aksi</th></tr></thead>
        <tbody>${DB.courses.map(c=>{
          const enrolls = DB.users.filter(u=>u.progress[c.id]!==undefined).length;
          return `<tr>
            <td><b>${c.ikon} ${esc(c.judul)}</b></td>
            <td><span class="tag tag-blue">${c.kategori}</span></td>
            <td>${c.level}</td>
            <td>${c.jp}</td>
            <td>${c.materi.length}</td>
            <td>${enrolls}</td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="formCourse('${c.id}')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="delCourse('${c.id}')">🗑️</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  `;
}
function formCourse(id){
  const c = id ? getCourse(id) : null;
  const materiText = c ? c.materi.map(m=>`${m.judul}|${m.durasi}`).join('\n') : '';
  openModal(`
    <h3>${c?'✏️ Edit Kursus':'➕ Tambah Kursus'}</h3>
    <div class="field"><label>Judul Kursus</label><input type="text" id="fcJudul" value="${c?esc(c.judul):''}" /></div>
    <div class="field"><label>Deskripsi</label><textarea id="fcDesk" rows="3">${c?esc(c.deskripsi):''}</textarea></div>
    <div class="grid grid-2" style="gap:10px">
      <div class="field"><label>Kategori</label>
        <select id="fcKat">${['Riset','Inovasi','Data','Manajemen','Lainnya'].map(k=>`<option ${c&&c.kategori===k?'selected':''}>${k}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Level</label>
        <select id="fcLvl">${['Dasar','Menengah','Lanjutan'].map(k=>`<option ${c&&c.level===k?'selected':''}>${k}</option>`).join('')}</select>
      </div>
      <div class="field"><label>JP (Jam Pelajaran)</label><input type="number" id="fcJP" min="1" value="${c?c.jp:6}" /></div>
      <div class="field"><label>Ikon (emoji)</label><input type="text" id="fcIkon" value="${c?c.ikon:'📘'}" maxlength="4" /></div>
    </div>
    <div class="field"><label>Instruktur</label><input type="text" id="fcInstruktur" value="${c?esc(c.instruktur):''}" /></div>
    <div class="field"><label>Daftar Materi <small style="color:var(--muted);font-weight:400">(Format: Judul|Durasi, satu per baris)</small></label>
      <textarea id="fcMateri" rows="5" placeholder="Contoh:\nPengantar|25\nMetode Riset|30">${materiText}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveCourse('${id||''}')">💾 Simpan</button>
    </div>
  `);
}
function saveCourse(id){
  const judul = $('#fcJudul').value.trim();
  if(!judul){ toast('Judul wajib diisi', 'error'); return; }
  const materiRaw = $('#fcMateri').value.trim().split('\n').filter(l=>l.trim());
  const materi = materiRaw.map(l=>{
    const parts = l.split('|');
    return { judul: parts[0].trim(), durasi: parseInt(parts[1])||20 };
  });
  const data = {
    judul, deskripsi:$('#fcDesk').value.trim(), kategori:$('#fcKat').value,
    level:$('#fcLvl').value, jp:parseInt($('#fcJP').value)||6, ikon:$('#fcIkon').value||'📘',
    instruktur:$('#fcInstruktur').value.trim()||'Bapperida', materi
  };
  if(id){
    const c = getCourse(id);
    Object.assign(c, data);
  } else {
    DB.courses.push({ id:'c'+Date.now(), ...data });
  }
  saveDB(); closeModal(); navigate('admin-kursus');
  toast(id?'Kursus diperbarui!':'Kursus ditambahkan!', 'success');
}
function delCourse(id){
  openModal(`
    <h3>🗑️ Hapus Kursus</h3>
    <p style="font-size:13.5px;color:var(--muted);line-height:1.6;margin-bottom:14px">Kursus akan dihapus permanen. Yakin?</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-danger" onclick="doDelCourse('${id}')">Ya, Hapus</button>
    </div>
  `);
}
function doDelCourse(id){
  DB.courses = DB.courses.filter(c=>c.id!==id);
  saveDB(); closeModal(); navigate('admin-kursus');
  toast('Kursus dihapus', 'success');
}

function viewAdminPengguna(){
  return `
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Nama</th><th>Email</th><th>NIP</th><th>OPD</th><th>Role</th><th>JP</th><th>Kursus</th><th>Sertifikat</th></tr></thead>
        <tbody>${DB.users.map(u=>`<tr>
          <td><b>${esc(u.nama)}</b></td>
          <td>${esc(u.email)}</td>
          <td>${esc(u.nip||'-')}</td>
          <td>${esc(u.opd||'-')}</td>
          <td>${u.role==='admin'?'<span class="tag tag-gold">Admin</span>':'<span class="tag tag-blue">Peserta</span>'}</td>
          <td>${u.wallet}</td>
          <td>${Object.keys(u.progress).length}</td>
          <td>${u.certificates.length}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

function viewAdminLaporan(){
  const perOPD = {};
  DB.users.filter(u=>u.role==='user').forEach(u=>{
    const opd = u.opd||'Lainnya';
    if(!perOPD[opd]) perOPD[opd] = { user:0, kursus:0, cert:0 };
    perOPD[opd].user++;
    perOPD[opd].kursus += Object.keys(u.progress).length;
    perOPD[opd].cert += u.certificates.length;
  });

  const perKategori = {};
  DB.courses.forEach(c=>{
    const enrolled = DB.users.filter(u=>u.progress[c.id]!==undefined).length;
    if(!perKategori[c.kategori]) perKategori[c.kategori] = 0;
    perKategori[c.kategori] += enrolled;
  });

  return `
    <div class="section-title">📊 Laporan Peserta per OPD</div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>OPD</th><th>Jumlah Peserta</th><th>Total Kursus Diikuti</th><th>Sertifikat</th></tr></thead>
        <tbody>${Object.entries(perOPD).map(([k,v])=>`<tr>
          <td><b>${esc(k)}</b></td><td>${v.user}</td><td>${v.kursus}</td><td>${v.cert}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="section-title">📈 Distribusi Peserta per Kategori Kursus</div>
    <div class="grid grid-3">
      ${Object.entries(perKategori).map(([k,v])=>{
        const total = Object.values(perKategori).reduce((a,b)=>a+b,0)||1;
        const pct = Math.round(v/total*100);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <b style="font-size:13.5px;color:var(--navy-800)">${k}</b>
            <span class="tag tag-blue">${v} peserta</span>
          </div>
          <div class="progress-bar"><div style="width:${pct}%"></div></div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:6px">${pct}% dari total pendaftaran</div>
        </div>`;
      }).join('')}
    </div>

    <div class="section-title">📥 Ekspor Data</div>
    <div class="card">
      <p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:14px">Unduh data laporan untuk keperluan pelaporan ke pimpinan atau integrasi dengan IGA.</p>
      <button class="btn btn-primary btn-sm" onclick="exportCSV()">📊 Ekspor CSV</button>
      <button class="btn btn-ghost btn-sm" style="margin-left:8px" onclick="window.print()">🖨️ Cetak</button>
    </div>
  `;
}
function exportCSV(){
  const rows = [['Nama','Email','NIP','OPD','Kursus Diikuti','Sertifikat','Saldo JP']];
  DB.users.forEach(u=>{
    rows.push([u.nama, u.email, u.nip||'', u.opd||'', Object.keys(u.progress).length, u.certificates.length, u.wallet]);
  });
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'laporan-palopo-inovatif-'+today()+'.csv';
  a.click();
  toast('Data berhasil diekspor!', 'success');
}

/* ---------- BOOT ---------- */
(function boot(){
  const active = localStorage.getItem('palopoInovatif_active');
  if(active){
    const u = DB.users.find(x=>x.id===active);
    if(u){ currentUser = u; enterApp(); return; }
  }
  $('#loginScreen').classList.remove('hidden');
  $('#app').classList.add('hidden');
})();