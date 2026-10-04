/* =========================================================
   PALOPO INOVATIF
   Firebase Auth (Google + Email/Password) + Firestore + Cloudinary
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCbhlJfrg-WZYBEFMgubDr_fRwl4VmeZfQ",
  authDomain: "palopo-inovatif.firebaseapp.com",
  projectId: "palopo-inovatif",
  storageBucket: "palopo-inovatif.firebasestorage.app",
  messagingSenderId: "571252856868",
  appId: "1:571252856868:web:a6b4dce49c83ee6b4fa0b1",
  measurementId: "G-MDYDCPZDR3"
};

const CLOUDINARY_CLOUD  = "kmvhvhct";
const CLOUDINARY_PRESET = "palopo_inovatif_unsigned";

// Email admin — ganti/tambah sesuai kebutuhan
const ADMIN_EMAILS = ["admin@palopo.go.id"];

/* -------- IMPORT FIREBASE -------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

/* -------- STATE -------- */
let currentUser = null;
let courses = [];
let reviewsCache = {};
let progressCache = {};
let certificatesCache = [];
let allUsers = [];
let currentView = "dashboard";
let activeCourseId = null;
let currentRating = 0;

/* -------- UTIL -------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (d) => {
  if(!d) return "-";
  const dt = d.seconds ? new Date(d.seconds*1000) : new Date(d);
  return dt.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
};
const initial = (n) => n ? n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "?";

function toast(msg, type=""){
  const t = $("#toast");
  t.textContent = msg;
  t.className = type;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove("show"), 2800);
}

/* -------- MODAL (FIXED) -------- */
function _escModalHandler(e){ if (e.key === "Escape") closeModal(); }

function openModal(html){
  const content = document.getElementById("modalContent");
  if (content) content.innerHTML = html;
  else document.getElementById("modalBox").innerHTML = html;
  document.getElementById("modal").classList.add("open");
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", _escModalHandler);
}
function closeModal(){
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", _escModalHandler);
}
function toggleSidebar(){
  $("#sidebar").classList.toggle("open");
  $("#overlay").classList.toggle("show");
}
function showLoading(b){ $("#loading").classList.toggle("hidden", !b); }

/* -------- IKON SVG -------- */
const ICONS = {
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  katalog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  kursus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  sertifikat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>',
  profil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  kelola:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  laporan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
};

/* =========================================================
   AUTH — Google + Email/Password
   ========================================================= */
window.switchAuth = (mode) => {
  document.getElementById("tabLogin").classList.toggle("active", mode === "login");
  document.getElementById("tabReg").classList.toggle("active", mode === "reg");
  document.getElementById("loginForm").classList.toggle("hidden", mode !== "login");
  document.getElementById("regForm").classList.toggle("hidden", mode !== "reg");
};

window.loginWithGoogle = async () => {
  const btn = document.querySelector(".btn-google");
  if (btn) btn.disabled = true;
  showLoading(true);
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const role = ADMIN_EMAILS.includes(user.email) ? "admin" : "user";
    await setDoc(doc(db, "users", user.uid), {
      nama: user.displayName || "",
      email: user.email,
      foto: user.photoURL || "",
      role: role,
      lastLogin: serverTimestamp()
    }, { merge: true });
    toast("Selamat datang, " + (user.displayName || "User").split(" ")[0] + "!", "success");
  } catch (e) {
    console.error(e);
    let msg = "Gagal login Google";
    if (e.code === "auth/popup-blocked") msg = "Popup diblokir browser. Izinkan popup lalu coba lagi";
    else if (e.code === "auth/popup-closed-by-user") msg = "Login dibatalkan";
    else if (e.code === "auth/unauthorized-domain") msg = "Domain belum diizinkan di Firebase Console";
    else if (e.code === "auth/network-request-failed") msg = "Koneksi internet bermasalah";
    else msg = e.message;
    toast(msg, "error");
  } finally {
    if (btn) btn.disabled = false;
    showLoading(false);
  }
};

window.doLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass  = document.getElementById("loginPass").value;
  showLoading(true);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const role = ADMIN_EMAILS.includes(user.email) ? "admin" : "user";
    await setDoc(doc(db, "users", user.uid), {
      role: role,
      lastLogin: serverTimestamp()
    }, { merge: true });
    toast("Selamat datang, " + (user.displayName || user.email.split("@")[0]).split(" ")[0] + "!", "success");
  } catch (err) {
    console.error(err);
    let msg = "Gagal login";
    if (err.code === "auth/user-not-found") msg = "Email belum terdaftar";
    else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Email atau password salah";
    else if (err.code === "auth/invalid-email") msg = "Format email tidak valid";
    else if (err.code === "auth/too-many-requests") msg = "Terlalu banyak percobaan, coba lagi nanti";
    else if (err.code === "auth/network-request-failed") msg = "Koneksi internet bermasalah";
    else msg = err.message;
    toast(msg, "error");
  } finally {
    showLoading(false);
  }
};

window.doRegister = async (e) => {
  e.preventDefault();
  const nama = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const nip  = document.getElementById("regNip").value.trim();
  const opd  = document.getElementById("regOpd").value.trim();
  const pass = document.getElementById("regPass").value;

  showLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    await updateProfile(user, { displayName: nama });
    const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";
    await setDoc(doc(db, "users", user.uid), {
      nama, email, nip, opd, role,
      foto: "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    toast("Registrasi berhasil! Selamat datang, " + nama.split(" ")[0], "success");
  } catch (err) {
    console.error(err);
    let msg = "Gagal mendaftar";
    if (err.code === "auth/email-already-in-use") msg = "Email sudah terdaftar";
    else if (err.code === "auth/weak-password") msg = "Password minimal 6 karakter";
    else if (err.code === "auth/invalid-email") msg = "Format email tidak valid";
    else if (err.code === "auth/network-request-failed") msg = "Koneksi internet bermasalah";
    else msg = err.message;
    toast(msg, "error");
  } finally {
    showLoading(false);
  }
};

window.logout = async () => {
  await signOut(auth);
  toast("Anda telah keluar");
};

onAuthStateChanged(auth, async (user) => {
  showLoading(true);
  try {
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      currentUser = {
        uid: user.uid,
        nama: user.displayName || data.nama || (user.email ? user.email.split("@")[0] : "User"),
        email: user.email || "",
        foto: user.photoURL || data.foto || "",
        role: ADMIN_EMAILS.includes(user.email) ? "admin" : (data.role || "user"),
        nip: data.nip || "",
        opd: data.opd || ""
      };
      await loadAll();
      enterApp();
    } else {
      currentUser = null;
      $("#app").classList.add("hidden");
      $("#loginScreen").classList.remove("hidden");
      const lf = document.getElementById("loginForm");
      const rf = document.getElementById("regForm");
      if (lf) lf.reset();
      if (rf) rf.reset();
      if (typeof window.switchAuth === "function") window.switchAuth("login");
    }
  } catch (e) {
    console.error(e);
    toast("Gagal memuat data: " + e.message, "error");
  } finally {
    showLoading(false);
  }
});

/* =========================================================
   LOAD DATA
   ========================================================= */
async function loadAll(){
  await loadCourses();
  if (currentUser.role === "admin") {
    await loadAllUsers();
  } else {
    await loadUserData();
  }
}

async function loadCourses(){
  const snap = await getDocs(collection(db, "courses"));
  courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rSnap = await getDocs(collection(db, "reviews"));
  reviewsCache = {};
  rSnap.docs.forEach(d => {
    const r = { id: d.id, ...d.data() };
    if (!reviewsCache[r.courseId]) reviewsCache[r.courseId] = [];
    reviewsCache[r.courseId].push(r);
  });
}

async function loadUserData(){
  const pSnap = await getDocs(query(collection(db, "progress"), where("userId","==",currentUser.uid)));
  progressCache = {};
  pSnap.docs.forEach(d => {
    const p = d.data();
    progressCache[p.courseId] = p.materi || [];
  });
  const cSnap = await getDocs(query(collection(db, "certificates"), where("userId","==",currentUser.uid)));
  certificatesCache = cSnap.docs.map(d => d.data().courseId);
}

async function loadAllUsers(){
  const snap = await getDocs(collection(db, "users"));
  allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* =========================================================
   HELPERS
   ========================================================= */
function avgRating(courseId){
  const list = reviewsCache[courseId] || [];
  if (!list.length) return 0;
  return list.reduce((s,r)=>s+r.rating,0) / list.length;
}
function reviewCount(courseId){ return (reviewsCache[courseId] || []).length; }
function progressPct(courseId){
  const c = courses.find(x=>x.id===courseId); if(!c) return 0;
  const done = (progressCache[courseId] || []).length;
  return Math.round(done / c.materi.length * 100);
}
function starsHTML(avg, size=13){
  const rounded = Math.round(avg);
  let s = `<span class="stars" style="font-size:${size}px">`;
  for (let i=1;i<=5;i++) s += `<span class="${i<=rounded?'':'empty'}">★</span>`;
  return s + "</span>";
}

/* =========================================================
   NAV
   ========================================================= */
function renderNav(){
  const isAdmin = currentUser.role === "admin";
  const menu = isAdmin ? [
    { sec:"Administrator" },
    { id:"admin-dashboard", ico:ICONS.dashboard, label:"Dashboard" },
    { id:"admin-kursus", ico:ICONS.kelola, label:"Kelola Kursus" },
    { id:"admin-pengguna", ico:ICONS.users, label:"Pengguna" },
    { id:"admin-laporan", ico:ICONS.laporan, label:"Laporan" },
    { sec:"Akun" },
    { id:"profil", ico:ICONS.profil, label:"Profil" },
    { id:"logout", ico:ICONS.logout, label:"Keluar" }
  ] : [
    { sec:"Menu Utama" },
    { id:"dashboard", ico:ICONS.dashboard, label:"Dashboard" },
    { id:"katalog", ico:ICONS.katalog, label:"Katalog Kursus" },
    { id:"kursus-saya", ico:ICONS.kursus, label:"Kursus Saya" },
    { sec:"Pencapaian" },
    { id:"sertifikat", ico:ICONS.sertifikat, label:"Sertifikat Saya" },
    { id:"profil", ico:ICONS.profil, label:"Profil" },
    { id:"logout", ico:ICONS.logout, label:"Keluar" }
  ];
  $("#navMenu").innerHTML = menu.map(m => m.sec
    ? `<div class="nav-section">${m.sec}</div>`
    : `<div class="nav-item" data-view="${m.id}" onclick="navClick('${m.id}')">${m.ico}<span>${m.label}</span></div>`
  ).join("");
}
window.navClick = (id) => {
  if (id === "logout") return logout();
  navigate(id);
  if (window.innerWidth <= 900) toggleSidebar();
};
function setActiveNav(v){ document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === v)); }

const TITLES = {
  dashboard:"Dashboard", katalog:"Katalog Kursus", "kursus-saya":"Kursus Saya",
  sertifikat:"Sertifikat Saya", profil:"Profil", player:"Ruang Belajar",
  "admin-dashboard":"Dashboard Admin", "admin-kursus":"Kelola Kursus",
  "admin-pengguna":"Pengguna", "admin-laporan":"Laporan"
};

window.navigate = (view) => {
  currentView = view;
  setActiveNav(view);
  $("#pageTitle").textContent = TITLES[view] || "Palopo Inovatif";
  const R = {
    dashboard: viewDashboard, katalog: viewKatalog, "kursus-saya": viewKursusSaya,
    sertifikat: viewSertifikat, profil: viewProfil, player: viewPlayer,
    "admin-dashboard": viewAdminDash, "admin-kursus": viewAdminKursus,
    "admin-pengguna": viewAdminPengguna, "admin-laporan": viewAdminLaporan
  }[view];
  $("#viewContainer").innerHTML = R ? R() : '<div class="empty">Halaman tidak ditemukan</div>';
  window.scrollTo(0,0);
};

function enterApp(){
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#topAvatar").innerHTML = currentUser.foto
    ? `<img src="${currentUser.foto}" alt="">`
    : initial(currentUser.nama);
  $("#topName").textContent = currentUser.nama;
  $("#topRole").textContent = currentUser.role === "admin" ? "Administrator" : "Peserta";
  renderNav();
  navigate(currentUser.role === "admin" ? "admin-dashboard" : "dashboard");
}

/* =========================================================
   VIEWS — USER
   ========================================================= */
function courseCardHTML(c){
  const thumb = c.cover
    ? `<img src="${c.cover}" alt="">`
    : `<span class="placeholder">${c.ikon || "📘"}</span>`;
  const avg = avgRating(c.id);
  const cnt = reviewCount(c.id);
  const enrolled = progressCache[c.id] !== undefined;
  const pct = enrolled ? progressPct(c.id) : 0;
  return `<div class="course-card">
    <div class="course-thumb">${thumb}<span class="badge-lvl">${esc(c.level)}</span></div>
    <div class="course-body">
      <div class="cat">${esc(c.kategori)}</div>
      <h4>${esc(c.judul)}</h4>
      <p>${esc(c.deskripsi).slice(0,95)}...</p>
      <div class="course-meta">
        <span>${c.materi.length} materi • ${c.jp} JP</span>
        <span class="rating-inline">${starsHTML(avg)} ${cnt?`(${cnt})`:""}</span>
      </div>
      ${enrolled ? `<div class="progress-bar"><div style="width:${pct}%"></div></div>` : ""}
      <button class="btn btn-primary btn-sm" onclick="openCourse('${c.id}')">
        ${enrolled ? `▶ Lanjutkan (${pct}%)` : "Lihat Kursus"}
      </button>
    </div>
  </div>`;
}

function viewDashboard(){
  const enrolled = Object.keys(progressCache);
  const done = enrolled.filter(id => progressPct(id)===100).length;
  const latest = [...courses].slice(-3).reverse();
  return `
    <div class="grid grid-4">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${courses.length}</div><div class="lbl">Kursus Tersedia</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">✅</div><div><div class="num">${enrolled.length}</div><div class="lbl">Kursus Diikuti</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">🏅</div><div><div class="num">${certificatesCache.length}</div><div class="lbl">Sertifikat</div></div></div>
      <div class="card stat-card"><div class="ic ic-red">🎓</div><div><div class="num">${done}</div><div class="lbl">Kursus Selesai</div></div></div>
    </div>
    <div class="section-title">🎯 Kursus Terbaru</div>
    <div class="grid grid-3">${latest.length ? latest.map(courseCardHTML).join("") : '<div class="empty" style="grid-column:1/-1"><div class="ico">📚</div><h4>Belum ada kursus</h4><p>Admin belum menambahkan kursus.</p></div>'}</div>
  `;
}

function viewKatalog(){
  return `
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <input type="text" id="searchCourse" placeholder="🔍 Cari kursus..." oninput="filterKatalog()" style="flex:1;min-width:180px;padding:12px 14px;border:1.5px solid var(--border);border-radius:11px;font-size:14px;background:#fafbfd" />
        <select id="filterCat" onchange="filterKatalog()" style="padding:12px 14px;border:1.5px solid var(--border);border-radius:11px;font-size:14px;background:#fafbfd">
          <option value="">Semua Kategori</option>
          ${[...new Set(courses.map(c=>c.kategori))].map(k=>`<option>${esc(k)}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="grid grid-3" id="katalogGrid">${courses.length ? courses.map(courseCardHTML).join("") : '<div class="empty" style="grid-column:1/-1"><div class="ico">🔍</div><h4>Belum ada kursus</h4></div>'}</div>
  `;
}
window.filterKatalog = () => {
  const q = ($("#searchCourse")?.value || "").toLowerCase();
  const cat = $("#filterCat")?.value || "";
  const list = courses.filter(c =>
    (!q || c.judul.toLowerCase().includes(q) || c.deskripsi.toLowerCase().includes(q)) &&
    (!cat || c.kategori === cat)
  );
  $("#katalogGrid").innerHTML = list.length
    ? list.map(courseCardHTML).join("")
    : '<div class="empty" style="grid-column:1/-1"><div class="ico">🔍</div><h4>Tidak ditemukan</h4></div>';
};

function viewKursusSaya(){
  const ids = Object.keys(progressCache);
  if (!ids.length) return '<div class="empty"><div class="ico">📖</div><h4>Belum ada kursus diikuti</h4><p>Buka katalog untuk mulai belajar.</p><br><button class="btn btn-primary" onclick="navigate(\'katalog\')">Buka Katalog</button></div>';
  const list = ids.map(id => courses.find(c=>c.id===id)).filter(Boolean);
  return `<div class="grid grid-3">${list.map(courseCardHTML).join("")}</div>`;
}

window.openCourse = async (id) => {
  activeCourseId = id;
  showLoading(true);
  if (progressCache[id] === undefined) {
    progressCache[id] = [];
    await setDoc(doc(db, "progress", `${currentUser.uid}_${id}`), {
      userId: currentUser.uid, courseId: id, materi: [], updatedAt: serverTimestamp()
    });
  }
  showLoading(false);
  navigate("player");
};

function viewPlayer(){
  const c = courses.find(x => x.id === activeCourseId);
  if (!c) return '<div class="empty">Kursus tidak ditemukan</div>';
  const done = progressCache[c.id] || [];
  const pct = progressPct(c.id);
  const avg = avgRating(c.id);
  const cnt = reviewCount(c.id);
  const certIssued = certificatesCache.includes(c.id);
  const allDone = pct === 100;
  const userReview = (reviewsCache[c.id]||[]).find(r => r.userId === currentUser.uid);

  const thumb = c.cover ? `<img src="${c.cover}" style="width:64px;height:64px;object-fit:cover;border-radius:14px">` : `<div style="width:64px;height:64px;border-radius:14px;background:var(--blue-100);display:flex;align-items:center;justify-content:center;font-size:30px">${c.ikon||"📘"}</div>`;

  return `
    <button class="btn btn-ghost btn-sm" onclick="navigate('kursus-saya')" style="margin-bottom:16px">← Kembali</button>
    <div class="player-layout">
      <div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
            ${thumb}
            <div style="flex:1">
              <div style="font-size:11px;color:var(--blue-600);font-weight:700;text-transform:uppercase">${esc(c.kategori)} • ${esc(c.level)}</div>
              <h3 style="font-size:19px;color:var(--navy-800);margin-top:4px">${esc(c.judul)}</h3>
              <div style="font-size:12px;color:var(--muted);margin-top:4px">👨‍🏫 ${esc(c.instruktur)}</div>
              <div style="margin-top:6px;display:flex;align-items:center;gap:8px">${starsHTML(avg,14)} <span style="font-size:12px;color:var(--muted)">${avg?avg.toFixed(1):"0.0"} • ${cnt} ulasan</span></div>
            </div>
          </div>
          <p style="font-size:13.5px;color:var(--muted);line-height:1.7;margin-bottom:18px">${esc(c.deskripsi)}</p>
          <div style="background:var(--blue-50);padding:16px;border-radius:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <b style="font-size:13px;color:var(--navy-800)">Progress Belajar</b>
              <b style="font-size:13px;color:var(--blue-600)">${pct}%</b>
            </div>
            <div class="progress-bar" style="height:10px"><div style="width:${pct}%"></div></div>
            <div style="font-size:11.5px;color:var(--muted);margin-top:8px">${done.length} dari ${c.materi.length} materi diselesaikan</div>
          </div>
          ${allDone && !certIssued ? `
            <div class="card" style="background:#f0fdf4;border:1.5px solid #86efac;text-align:center;margin-top:16px">
              <div style="font-size:32px">🎉</div>
              <b style="color:#166534">Selamat! Anda menyelesaikan kursus ini.</b><br>
              <button class="btn btn-success btn-sm" style="margin-top:10px" onclick="issueCert('${c.id}')">🏅 Terbitkan Sertifikat</button>
            </div>` : ""}
          ${allDone && certIssued ? `
            <div class="card" style="background:var(--gold-light);text-align:center;margin-top:16px;border:none">
              <div style="font-size:32px">🏅</div>
              <b style="color:#92400e">Sertifikat sudah diterbitkan.</b><br>
              <button class="btn btn-gold btn-sm" style="margin-top:10px" onclick="navigate('sertifikat')">Lihat Sertifikat</button>
            </div>` : ""}
        </div>

        <div class="section-title">📚 Daftar Materi</div>
        ${c.materi.map((m,i)=>{
          const completed = done.includes(i);
          const tipeLabel = m.tipe === "video" ? "🎬 Video" : m.tipe === "dokumen" ? "📄 Dokumen" : "🔗 Materi";
          return `<div class="material-item ${completed?'done':''}" onclick="toggleMateri('${c.id}',${i})">
            <div class="idx">${completed?'✓':i+1}</div>
            <div style="flex:1;min-width:0">
              <div class="t">${esc(m.judul)}</div>
              <div class="d">⏱️ ${m.durasi} menit • ${tipeLabel}</div>
              ${m.deskripsi ? `<div class="d" style="margin-top:4px;color:var(--text)">${esc(m.deskripsi)}</div>` : ""}
              ${(m.videoUrl || m.modulUrl) ? `
                <div class="material-links" onclick="event.stopPropagation()">
                  ${m.videoUrl ? `<a class="video" href="${esc(m.videoUrl)}" target="_blank" rel="noopener">▶ Buka Video</a>` : ""}
                  ${m.modulUrl ? `<a class="modul" href="${esc(m.modulUrl)}" target="_blank" rel="noopener">📄 Buka Modul</a>` : ""}
                </div>` : ""}
            </div>
            <div style="font-size:22px;flex-shrink:0">${completed?'✅':'⭕'}</div>
          </div>`;
        }).join("")}

        <div class="section-title">💬 Ulasan Peserta <small>${cnt} ulasan</small></div>
        ${allDone ? (userReview ? `
          <div class="card" style="background:var(--blue-50);border-color:var(--blue-100);margin-bottom:14px">
            <b style="font-size:13px;color:var(--navy-800)">Ulasan Anda</b>
            <div style="margin-top:6px">${starsHTML(userReview.rating,16)}</div>
            <p style="font-size:13px;color:var(--text);line-height:1.6;margin-top:6px">${esc(userReview.komentar)}</p>
            <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="openReviewModal('${c.id}')">✏️ Ubah Ulasan</button>
          </div>` : `
          <div class="card" style="background:var(--gold-light);border:none;margin-bottom:14px;text-align:center">
            <b style="color:#92400e">Bagikan pengalaman Anda!</b>
            <p style="font-size:12.5px;color:#92400e;margin:6px 0 12px">Beri rating & komentar untuk kursus ini.</p>
            <button class="btn btn-gold btn-sm" onclick="openReviewModal('${c.id}')">⭐ Tulis Ulasan</button>
          </div>`) : `
          <div class="card" style="background:var(--bg);border:none;text-align:center;padding:22px">
            <p style="font-size:12.5px;color:var(--muted)">🔒 Selesaikan semua materi untuk menulis ulasan.</p>
          </div>`}
        ${renderReviewList(c.id)}
      </div>

      <div>
        <div class="card" style="position:sticky;top:90px">
          <b style="font-size:13.5px;color:var(--navy-800);display:block;margin-bottom:12px">📋 Info Kursus</b>
          <div style="font-size:12.5px;color:var(--muted);line-height:2">
            <div>📂 Kategori: <b style="color:var(--navy-700)">${esc(c.kategori)}</b></div>
            <div>📊 Level: <b style="color:var(--navy-700)">${esc(c.level)}</b></div>
            <div>📖 Materi: <b style="color:var(--navy-700)">${c.materi.length} modul</b></div>
            <div>⏱️ Durasi: <b style="color:var(--navy-700)">${c.materi.reduce((s,m)=>s+m.durasi,0)} menit</b></div>
            <div>💰 JP: <b style="color:var(--navy-700)">${c.jp}</b></div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderReviewList(courseId){
  const list = (reviewsCache[courseId] || []).slice().sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  if (!list.length) return '<div class="empty" style="padding:30px"><div class="ico">💬</div><h4>Belum ada ulasan</h4><p>Jadilah yang pertama memberi ulasan.</p></div>';
  const avg = avgRating(courseId);
  return `
    <div class="review-summary">
      <div style="text-align:center">
        <div class="big">${avg.toFixed(1)}</div>
        <div class="big-sub">dari 5.0</div>
      </div>
      <div>
        ${starsHTML(avg,20)}
        <div style="font-size:12px;color:var(--muted);margin-top:6px">Berdasarkan ${list.length} ulasan</div>
      </div>
    </div>
    ${list.map(r=>`
      <div class="review-item">
        <div class="head">
          <div class="avatar">${r.foto?`<img src="${r.foto}">`:initial(r.nama)}</div>
          <div style="flex:1">
            <b>${esc(r.nama)}</b>
            <span>${fmtDate(r.createdAt)}</span>
          </div>
          ${starsHTML(r.rating,14)}
        </div>
        <p>${esc(r.komentar)}</p>
      </div>
    `).join("")}
  `;
}

window.toggleMateri = async (courseId, idx) => {
  const arr = progressCache[courseId] ? [...progressCache[courseId]] : [];
  const pos = arr.indexOf(idx);
  if (pos >= 0) arr.splice(pos,1); else arr.push(idx);
  progressCache[courseId] = arr;
  await setDoc(doc(db, "progress", `${currentUser.uid}_${courseId}`), {
    userId: currentUser.uid, courseId, materi: arr, updatedAt: serverTimestamp()
  });
  navigate("player");
};

window.issueCert = async (courseId) => {
  if (certificatesCache.includes(courseId)) return;
  await setDoc(doc(db, "certificates", `${currentUser.uid}_${courseId}`), {
    userId: currentUser.uid,
    courseId,
    nama: currentUser.nama,
    issuedAt: serverTimestamp()
  });
  certificatesCache.push(courseId);
  toast("🎉 Sertifikat berhasil diterbitkan!", "success");
  navigate("sertifikat");
};

window.openReviewModal = (courseId) => {
  const existing = (reviewsCache[courseId]||[]).find(r=>r.userId===currentUser.uid);
  currentRating = existing ? existing.rating : 0;
  openModal(`
    <h3>${existing ? "✏️ Ubah Ulasan" : "⭐ Tulis Ulasan"}</h3>
    <div class="field">
      <label>Rating</label>
      <div class="star-input" id="starInput">
        ${[1,2,3,4,5].map(i=>`<span data-v="${i}" onclick="setRating(${i})" onmouseover="hoverStar(${i})" onmouseout="hoverStar(0)">★</span>`).join("")}
      </div>
    </div>
    <div class="field">
      <label>Komentar</label>
      <textarea id="reviewKomentar" rows="4" placeholder="Bagikan pengalaman Anda tentang kursus ini...">${existing ? esc(existing.komentar) : ""}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="submitReview('${courseId}')">Kirim</button>
    </div>
  `);
  paintStars(currentRating);
};
window.setRating = (v) => { currentRating = v; paintStars(v); };
window.hoverStar = (v) => { paintStars(v || currentRating); };
function paintStars(v){
  document.querySelectorAll("#starInput span").forEach(el=>{
    el.classList.toggle("active", parseInt(el.dataset.v) <= v);
  });
}
window.submitReview = async (courseId) => {
  const komentar = $("#reviewKomentar").value.trim();
  if (!currentRating) return toast("Pilih rating bintang dulu", "error");
  if (!komentar) return toast("Komentar tidak boleh kosong", "error");
  const id = `${currentUser.uid}_${courseId}`;
  const data = {
    userId: currentUser.uid,
    courseId,
    nama: currentUser.nama,
    foto: currentUser.foto,
    rating: currentRating,
    komentar,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, "reviews", id), data);
  reviewsCache[courseId] = (reviewsCache[courseId]||[]).filter(r=>r.userId!==currentUser.uid);
  reviewsCache[courseId].push({ id, ...data });
  closeModal();
  toast("Ulasan terkirim. Terima kasih!", "success");
  navigate("player");
};

function viewSertifikat(){
  if (!certificatesCache.length) {
    return '<div class="empty"><div class="ico">🏅</div><h4>Belum ada sertifikat</h4><p>Selesaikan kursus 100% untuk mendapatkan sertifikat digital.</p><br><button class="btn btn-primary" onclick="navigate(\'katalog\')">Mulai Belajar</button></div>';
  }
  return `<div class="grid grid-2">${certificatesCache.map(id=>{
    const c = courses.find(x=>x.id===id); if(!c) return "";
    return `<div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;text-align:center;padding:26px">
      <div style="font-size:50px">🏅</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;font-weight:700;margin-top:8px">Sertifikat Kelulusan</div>
      <h3 style="font-size:15px;color:var(--navy-800);margin:10px 0">${esc(c.judul)}</h3>
      <div style="font-size:12px;color:var(--muted)">Diberikan kepada</div>
      <b style="font-size:15px;color:var(--navy-800);display:block;margin:4px 0">${esc(currentUser.nama)}</b>
      <div style="font-size:11.5px;color:var(--muted);margin:8px 0">${c.jp} JP • ${esc(c.kategori)} • ${esc(c.level)}</div>
      <div style="font-size:10px;color:#92400e;margin-bottom:12px">No: PI/${c.id.slice(-6).toUpperCase()}/${new Date().getFullYear()}</div>
      <button class="btn btn-gold btn-sm" onclick="printCert('${c.id}')">🖨️ Cetak / PDF</button>
    </div>`;
  }).join("")}</div>`;
}
window.printCert = (id) => {
  const c = courses.find(x=>x.id===id); if(!c) return;
  const w = window.open("", "", "width=900,height=650");
  w.document.write(`
    <html><head><title>Sertifikat - ${esc(c.judul)}</title>
    <style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}
      .cert{border:14px double #132c4f;padding:50px 60px;text-align:center;background:#fff;max-width:760px;box-shadow:0 20px 50px rgba(0,0,0,.15)}
      h1{color:#132c4f;font-size:34px;letter-spacing:2px;margin:0}
      .sub{color:#f59e0b;letter-spacing:6px;font-size:12px;margin:6px 0 22px;font-weight:700}
      h2{font-size:24px;color:#2563eb;margin:18px 0}
      .name{font-size:30px;color:#132c4f;font-weight:700;border-bottom:3px solid #f59e0b;display:inline-block;padding:0 20px 8px;margin:16px 0}
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
      <p>Dengan beban ${c.jp} Jam Pelajaran (JP) kategori ${esc(c.kategori)} tingkat ${esc(c.level)}.<br>
      Diselenggarakan oleh Bidang Riset dan Inovasi Daerah<br>Bapperida Kota Palopo.</p>
      <div class="foot">
        <div>No: PI/${c.id.slice(-6).toUpperCase()}/${new Date().getFullYear()}</div>
        <div>Palopo, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
    </div>
    <script>setTimeout(()=>window.print(),400)<\/script>
    </body></html>
  `);
  w.document.close();
};

function viewProfil(){
  return `
    <div class="card" style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--blue-50),#fff);border:1px solid var(--blue-100);margin-bottom:18px">
      <div class="avatar" style="width:80px;height:80px;font-size:30px;margin:0 auto 14px">${currentUser.foto?`<img src="${currentUser.foto}">`:initial(currentUser.nama)}</div>
      <h3 style="font-size:19px;color:var(--navy-800)">${esc(currentUser.nama)}</h3>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(currentUser.email)}</div>
      <div style="display:inline-block;margin-top:12px;padding:5px 14px;border-radius:20px;background:${currentUser.role==="admin"?"var(--gold)":"var(--blue-600)"};color:#fff;font-size:11px;font-weight:700">${currentUser.role==="admin"?"👑 Administrator":"👤 Peserta"}</div>
    </div>
    <div class="card">
      <b style="display:block;margin-bottom:14px;color:var(--navy-800)">📋 Informasi Akun</b>
      <table>
        <tr><td style="color:var(--muted);width:150px">Nama</td><td><b>${esc(currentUser.nama)}</b></td></tr>
        <tr><td style="color:var(--muted)">Email</td><td>${esc(currentUser.email)}</td></tr>
        ${currentUser.nip?`<tr><td style="color:var(--muted)">NIP</td><td>${esc(currentUser.nip)}</td></tr>`:""}
        ${currentUser.opd?`<tr><td style="color:var(--muted)">OPD</td><td>${esc(currentUser.opd)}</td></tr>`:""}
        <tr><td style="color:var(--muted)">Role</td><td>${currentUser.role}</td></tr>
        <tr><td style="color:var(--muted)">UID</td><td style="font-size:11px;font-family:monospace">${esc(currentUser.uid)}</td></tr>
      </table>
    </div>
    <div class="card" style="margin-top:16px">
      <button class="btn btn-danger btn-sm" onclick="logout()">🚪 Keluar</button>
    </div>`;
}

/* =========================================================
   VIEWS — ADMIN
   ========================================================= */
function viewAdminDash(){
  const totalCourses = courses.length;
  const totalMateri = courses.reduce((s,c)=>s+c.materi.length,0);
  const totalReviews = Object.values(reviewsCache).reduce((s,l)=>s+l.length,0);
  return `
    <div class="grid grid-4">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${totalCourses}</div><div class="lbl">Total Kursus</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">📖</div><div><div class="num">${totalMateri}</div><div class="lbl">Total Materi</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">💬</div><div><div class="num">${totalReviews}</div><div class="lbl">Total Ulasan</div></div></div>
      <div class="card stat-card"><div class="ic ic-red">👥</div><div><div class="num">${allUsers.length}</div><div class="lbl">Total Pengguna</div></div></div>
    </div>
    <div class="section-title">⚡ Aksi Cepat</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="formCourse()">➕ Tambah Kursus</button>
      <button class="btn btn-ghost" onclick="navigate('admin-pengguna')">👥 Pengguna</button>
      <button class="btn btn-ghost" onclick="navigate('admin-laporan')">📈 Laporan</button>
    </div>
    <div class="section-title">📋 Kursus Terbaru</div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Level</th><th>JP</th><th>Materi</th><th>Rating</th><th>Aksi</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${c.ikon} ${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${esc(c.level)}</td><td>${c.jp}</td><td>${c.materi.length}</td>
          <td>${starsHTML(avgRating(c.id),12)} <small style="color:var(--muted)">${reviewCount(c.id)}</small></td>
          <td><button class="btn btn-ghost btn-sm" onclick="formCourse('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="delCourse('${c.id}')">🗑️</button></td>
        </tr>`).join("") : '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--muted)">Belum ada kursus</td></tr>'}</tbody>
      </table>
    </div>`;
}

function viewAdminKursus(){
  return `
    <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-primary" onclick="formCourse()">➕ Tambah Kursus Baru</button>
    </div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Level</th><th>JP</th><th>Materi</th><th>Rating</th><th>Aksi</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${c.ikon} ${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${esc(c.level)}</td><td>${c.jp}</td><td>${c.materi.length}</td>
          <td>${starsHTML(avgRating(c.id),12)} <small style="color:var(--muted)">${reviewCount(c.id)}</small></td>
          <td><button class="btn btn-ghost btn-sm" onclick="formCourse('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="delCourse('${c.id}')">🗑️</button></td>
        </tr>`).join("") : '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--muted)">Belum ada kursus. Klik "Tambah Kursus Baru".</td></tr>'}</tbody>
      </table>
    </div>`;
}

/* ---------- FORM KURSUS BARU (detail + link YouTube/Drive) ---------- */
window.formCourse = (id) => {
  const c = id ? courses.find(x=>x.id===id) : null;
  openModal(`
    <h3>${c?"✏️ Edit Kursus":"➕ Tambah Kursus Baru"}</h3>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">1</span> Informasi Kursus</div>
      <div class="field"><label>Judul Kursus *</label><input type="text" id="fcJudul" value="${c?esc(c.judul):""}" placeholder="Contoh: Design Thinking untuk Pelayanan Publik" /></div>
      <div class="field"><label>Deskripsi *</label><textarea id="fcDesk" rows="3" placeholder="Jelaskan singkat isi & tujuan kursus ini...">${c?esc(c.deskripsi):""}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>Kategori *</label>
          <select id="fcKat">${["Riset","Inovasi","Data","Manajemen","Lainnya"].map(k=>`<option ${c&&c.kategori===k?"selected":""}>${k}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Level *</label>
          <select id="fcLvl">${["Dasar","Menengah","Lanjutan"].map(k=>`<option ${c&&c.level===k?"selected":""}>${k}</option>`).join("")}</select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>Jam Pelajaran (JP) *</label><input type="number" id="fcJP" min="1" value="${c?c.jp:6}" /></div>
        <div class="field"><label>Ikon (emoji)</label><input type="text" id="fcIkon" value="${c?c.ikon:"📘"}" maxlength="4" placeholder="📘" /></div>
      </div>
      <div class="field"><label>Instruktur / Narasumber</label><input type="text" id="fcInstruktur" value="${c?esc(c.instruktur):""}" placeholder="Nama & gelar" /></div>
    </div>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">2</span> Cover Kursus (Opsional)</div>
      <div class="field">
        <input type="file" accept="image/*" onchange="uploadCover(this)" />
        <input type="hidden" id="fcCover" value="${c?c.cover||"":""}" />
        <div id="coverPreview">${c&&c.cover?`<img src="${c.cover}" style="width:100%;border-radius:10px;margin-top:8px">`:""}</div>
        <span class="hint">Format JPG/PNG, maks 5MB. Akan diupload ke Cloudinary.</span>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">3</span> Daftar Materi</div>
      <div id="materiList"></div>
      <button type="button" class="btn-add-materi" onclick="addMateriRow()">＋ Tambah Materi</button>
    </div>

    <div class="modal-actions">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button type="button" class="btn btn-primary" onclick="saveCourse('${id||""}')">💾 Simpan Kursus</button>
    </div>
  `);

  const list = document.getElementById("materiList");
  if (c && c.materi && c.materi.length) {
    c.materi.forEach(m => addMateriRow(m));
  } else {
    addMateriRow();
  }
};

window.addMateriRow = (data = {}) => {
  const list = document.getElementById("materiList");
  if (!list) return;
  const row = document.createElement("div");
  row.className = "materi-row";
  const num = list.children.length + 1;
  row.innerHTML = `
    <div class="materi-row-head">
      <span class="num">${num}</span>
      <div class="actions">
        <button type="button" onclick="this.closest('.materi-row').remove(); renumberMateri()" title="Hapus materi">✕</button>
      </div>
    </div>
    <input class="m-judul" placeholder="Judul materi * (contoh: Pengantar Design Thinking)" value="${esc(data.judul||"")}" />
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input class="m-durasi" type="number" min="1" placeholder="Durasi (menit)" value="${data.durasi||20}" />
      <select class="m-tipe">
        <option value="video" ${data.tipe==="video"?"selected":""}>🎬 Video</option>
        <option value="dokumen" ${data.tipe==="dokumen"?"selected":""}>📄 Dokumen</option>
        <option value="link" ${data.tipe==="link"?"selected":""}>🔗 Lainnya</option>
      </select>
    </div>
    <textarea class="m-deskripsi" rows="2" placeholder="Deskripsi singkat materi (opsional)">${esc(data.deskripsi||"")}</textarea>
    <input class="m-video" placeholder="🔗 Link YouTube — contoh: https://youtu.be/xxxxx" value="${esc(data.videoUrl||"")}" />
    <input class="m-modul" placeholder="🔗 Link Google Drive — contoh: https://drive.google.com/file/d/xxxxx" value="${esc(data.modulUrl||"")}" />
  `;
  list.appendChild(row);
};

window.renumberMateri = () => {
  document.querySelectorAll("#materiList .materi-row .num").forEach((el, i) => {
    el.textContent = i + 1;
  });
};

window.delCourse = (id) => {
  openModal(`<h3>🗑️ Hapus Kursus</h3><p style="color:var(--muted);margin-bottom:14px">Yakin ingin menghapus kursus ini? Tindakan ini tidak bisa dibatalkan.</p>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
    <button class="btn btn-danger" onclick="doDelCourse('${id}')">Ya, Hapus</button></div>`);
};

window.uploadCover = async (input) => {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  showLoading(true);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: "POST", body: fd
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    $("#fcCover").value = data.secure_url;
    $("#coverPreview").innerHTML = `<img src="${data.secure_url}" style="width:100%;border-radius:10px;margin-top:8px">`;
    toast("Gambar berhasil diupload!", "success");
  } catch (e) {
    toast("Upload gagal: " + e.message, "error");
  } finally {
    showLoading(false);
  }
};

window.saveCourse = async (id) => {
  const judul = document.getElementById("fcJudul").value.trim();
  const deskripsi = document.getElementById("fcDesk").value.trim();
  if (!judul) return toast("Judul wajib diisi", "error");
  if (!deskripsi) return toast("Deskripsi wajib diisi", "error");

  const rows = [...document.querySelectorAll("#materiList .materi-row")];
  const materi = rows.map(row => ({
    judul:     row.querySelector(".m-judul").value.trim(),
    durasi:    parseInt(row.querySelector(".m-durasi").value) || 20,
    tipe:      row.querySelector(".m-tipe").value,
    deskripsi: row.querySelector(".m-deskripsi").value.trim(),
    videoUrl:  row.querySelector(".m-video").value.trim(),
    modulUrl:  row.querySelector(".m-modul").value.trim()
  })).filter(m => m.judul);

  if (!materi.length) return toast("Minimal 1 materi harus diisi judulnya", "error");

  const data = {
    judul,
    deskripsi,
    kategori:   document.getElementById("fcKat").value,
    level:      document.getElementById("fcLvl").value,
    jp:         parseInt(document.getElementById("fcJP").value) || 6,
    ikon:       document.getElementById("fcIkon").value || "📘",
    instruktur: document.getElementById("fcInstruktur").value.trim() || "Bapperida",
    cover:      document.getElementById("fcCover")?.value || "",
    materi,
    updatedAt:  serverTimestamp()
  };

  showLoading(true);
  try {
    if (id) {
      await updateDoc(doc(db, "courses", id), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "courses"), data);
    }
    await loadCourses();
    closeModal();
    navigate("admin-kursus");
    toast(id ? "✅ Kursus diperbarui!" : "✅ Kursus ditambahkan!", "success");
  } catch (e) {
    console.error(e);
    toast("Gagal simpan: " + e.message, "error");
  } finally {
    showLoading(false);
  }
};

window.doDelCourse = async (id) => {
  showLoading(true);
  try {
    await deleteDoc(doc(db, "courses", id));
    await loadCourses();
    closeModal();
    navigate("admin-kursus");
    toast("Kursus dihapus", "success");
  } catch (e) {
    toast("Gagal hapus: " + e.message, "error");
  } finally {
    showLoading(false);
  }
};

function viewAdminPengguna(){
  return `
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Nama</th><th>Email</th><th>NIP</th><th>OPD</th><th>Role</th><th>Login Terakhir</th></tr></thead>
        <tbody>${allUsers.length ? allUsers.map(u=>`<tr>
          <td><b>${esc(u.nama||"-")}</b></td>
          <td>${esc(u.email||"-")}</td>
          <td>${esc(u.nip||"-")}</td>
          <td>${esc(u.opd||"-")}</td>
          <td>${u.role==="admin"?'<span class="tag tag-gold">Admin</span>':'<span class="tag tag-blue">Peserta</span>'}</td>
          <td>${fmtDate(u.lastLogin)}</td>
        </tr>`).join("") : '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted)">Belum ada pengguna</td></tr>'}</tbody>
      </table>
    </div>`;
}

function viewAdminLaporan(){
  const totalReviews = Object.values(reviewsCache).reduce((s,l)=>s+l.length,0);
  const avgAll = totalReviews
    ? (Object.values(reviewsCache).flat().reduce((s,r)=>s+r.rating,0) / totalReviews).toFixed(1)
    : "0.0";
  return `
    <div class="grid grid-3">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${courses.length}</div><div class="lbl">Kursus</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">💬</div><div><div class="num">${totalReviews}</div><div class="lbl">Ulasan</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">⭐</div><div><div class="num">${avgAll}</div><div class="lbl">Rating Rata-rata</div></div></div>
    </div>
    <div class="section-title">📊 Rating per Kursus</div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Rating</th><th>Jumlah Ulasan</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${starsHTML(avgRating(c.id),14)} <small style="color:var(--muted)">${avgRating(c.id)?avgRating(c.id).toFixed(1):"-"}</small></td>
          <td>${reviewCount(c.id)}</td>
        </tr>`).join("") : '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--muted)">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>`;
}

/* =========================================================
   EXPOSE FUNGSI KE WINDOW (WAJIB untuk onclick di HTML)
   ========================================================= */
window.closeModal    = closeModal;
window.openModal     = openModal;
window.toggleSidebar = toggleSidebar;
window.showLoading   = showLoading;

/* =========================================================
   BOOT — ditangani onAuthStateChanged
   ========================================================= */