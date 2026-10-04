/* =========================================================
   PALOPO INOVATIF v2.1
   Firebase (Auth + Firestore) + Cloudinary + SheetJS
   Fitur: SuperAdmin, Kuis, Leaderboard, Notifikasi Realtime,
          Upload Desain Sertifikat, Export/Import Excel, dll.
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

const SUPER_ADMIN_EMAILS = ["superadmin@palopo.go.id"];
const ADMIN_EMAILS       = ["admin@palopo.go.id"];
const ADMIN_WA           = "085696409288";
const QUIZ_PASS_SCORE    = 70;

/* -------- IMPORT FIREBASE -------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, serverTimestamp, onSnapshot,
  orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

/* -------- ROLE HELPERS -------- */
function getUserRole(email, firestoreRole) {
  if (!email) return "user";
  const lower = email.toLowerCase();
  if (SUPER_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(lower)) return "superadmin";
  if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(lower)) return "admin";
  return firestoreRole || "user";
}
function isAdminOrAbove(role){ return role === "admin" || role === "superadmin"; }
function isSuperAdmin(){ return currentUser && currentUser.role === "superadmin"; }

/* -------- STATE -------- */
let currentUser = null;
let courses = [];
let reviewsCache = {};
let progressCache = {};
let certificatesCache = [];
let allUsers = [];
let notifications = [];
let notificationsUnsub = null;
let certificateSettings = { backgroundUrl: "", updatedAt: null, updatedBy: "" };
let currentView = "dashboard";
let activeCourseId = null;
let currentMateriIndex = 0;
let currentRating = 0;
let pendingQuiz = null;

/* -------- UTIL -------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (d) => {
  if(!d) return "-";
  const dt = d.seconds ? new Date(d.seconds*1000) : new Date(d);
  return dt.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
};
const fmtDateTime = (d) => {
  if(!d) return "-";
  const dt = d.seconds ? new Date(d.seconds*1000) : new Date(d);
  return dt.toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
};
const initial = (n) => n ? n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "?";

function toast(msg, type=""){
  const t = $("#toast");
  t.textContent = msg;
  t.className = type;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove("show"), 3000);
}

function isProfileComplete(u){
  if (!u) return false;
  if (u.role === "admin" || u.role === "superadmin") return true;
  return !!(u.nama && u.email && u.nip && u.opd && u.telepon);
}

/* -------- MODAL -------- */
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
function toggleSidebar(){ $("#sidebar").classList.toggle("open"); $("#overlay").classList.toggle("show"); }
function showLoading(b){ $("#loading").classList.toggle("hidden", !b); }

/* -------- IKON -------- */
const ICONS = {
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  katalog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  kursus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  sertifikat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>',
  profil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  kelola:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  laporan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20l2-10 5 5 1-8 1 8 5-5 2 10"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
};

/* =========================================================
   AUTH
   ========================================================= */
window.switchAuth = (mode) => {
  document.getElementById("tabLogin").classList.toggle("active", mode === "login");
  document.getElementById("tabReg").classList.toggle("active", mode === "reg");
  document.getElementById("loginForm").classList.toggle("hidden", mode !== "login");
  document.getElementById("regForm").classList.toggle("hidden", mode !== "reg");
};

window.openForgotPassword = () => {
  const wa = ADMIN_WA.startsWith("0") ? "62" + ADMIN_WA.slice(1) : ADMIN_WA;
  const text = encodeURIComponent("Halo Admin Palopo Inovatif, saya lupa password akun saya. Mohon bantu reset dengan detail berikut:\n\nNama: \nEmail: \nNIP: ");
  openModal(`
    <div class="confirm-head">
      <span class="ico">🔑</span>
      <h3>Lupa Password?</h3>
      <p>Hubungi admin melalui WhatsApp untuk konfirmasi identitas Anda dan meminta password baru.</p>
    </div>
    <div class="field">
      <label>Nomor WhatsApp Admin</label>
      <input type="text" value="${ADMIN_WA}" readonly style="font-weight:700;text-align:center;font-size:16px;letter-spacing:1px" />
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Tutup</button>
      <a class="btn btn-success" href="https://wa.me/${wa}?text=${text}" target="_blank" rel="noopener" style="text-decoration:none">💬 Chat Admin</a>
    </div>
  `);
};

window.loginWithGoogle = async () => {
  const btn = document.querySelector(".btn-google");
  if (btn) btn.disabled = true;
  showLoading(true);
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const role = getUserRole(user.email, "user");
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
    const role = getUserRole(user.email, "user");
    await setDoc(doc(db, "users", user.uid), { role, lastLogin: serverTimestamp() }, { merge: true });
    toast("Selamat datang, " + (user.displayName || user.email.split("@")[0]).split(" ")[0] + "!", "success");
  } catch (err) {
    console.error(err);
    let msg = "Gagal login";
    if (err.code === "auth/user-not-found") msg = "Email belum terdaftar";
    else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Email atau password salah";
    else if (err.code === "auth/invalid-email") msg = "Format email tidak valid";
    else if (err.code === "auth/too-many-requests") msg = "Terlalu banyak percobaan, coba lagi nanti";
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
  const tel  = document.getElementById("regTel")?.value.trim() || "";
  const pass = document.getElementById("regPass").value;

  showLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    await updateProfile(user, { displayName: nama });
    const role = getUserRole(email, "user");
    await setDoc(doc(db, "users", user.uid), {
      nama, email, nip, opd, telepon: tel, role,
      foto: "", pwd: pass,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    await addDoc(collection(db, "notifications"), {
      type: "user_baru",
      title: "Peserta Baru Terdaftar",
      message: `${nama} (${opd}) baru mendaftar ke platform.`,
      email, opd,
      createdAt: serverTimestamp(),
      read: false
    });
    toast("Registrasi berhasil! Selamat datang, " + nama.split(" ")[0], "success");
  } catch (err) {
    console.error(err);
    let msg = "Gagal mendaftar";
    if (err.code === "auth/email-already-in-use") msg = "Email sudah terdaftar";
    else if (err.code === "auth/weak-password") msg = "Password minimal 6 karakter";
    else if (err.code === "auth/invalid-email") msg = "Format email tidak valid";
    else msg = err.message;
    toast(msg, "error");
  } finally {
    showLoading(false);
  }
};

window.logout = async () => {
  if (notificationsUnsub) { notificationsUnsub(); notificationsUnsub = null; }
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
        role: getUserRole(user.email, data.role),
        nip: data.nip || "",
        opd: data.opd || "",
        telepon: data.telepon || "",
        pwd: data.pwd || ""
      };
      if (data.role !== currentUser.role) {
        await setDoc(doc(db, "users", user.uid), { role: currentUser.role }, { merge: true });
      }
      await loadAll();
      setupNotificationsListener();
      enterApp();
    } else {
      currentUser = null;
      if (notificationsUnsub) { notificationsUnsub(); notificationsUnsub = null; }
      $("#app").classList.add("hidden");
      $("#loginScreen").classList.remove("hidden");
      const lf = document.getElementById("loginForm");
      const rf = document.getElementById("regForm");
      if (lf) lf.reset();
      if (rf) rf.reset();
      switchAuth("login");
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
  await loadCertificateSettings();
  if (isAdminOrAbove(currentUser.role)) {
    await loadAllUsers();
    if (currentUser.role === "superadmin") await loadUserData();
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
    progressCache[p.courseId] = p;
  });
  const cSnap = await getDocs(query(collection(db, "certificates"), where("userId","==",currentUser.uid)));
  certificatesCache = cSnap.docs.map(d => d.data().courseId);
}

async function loadAllUsers(){
  const snap = await getDocs(collection(db, "users"));
  allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function loadCertificateSettings(){
  try {
    const snap = await getDoc(doc(db, "settings", "certificate"));
    if (snap.exists()) certificateSettings = { ...certificateSettings, ...snap.data() };
  } catch (e) { console.error("Load settings error:", e); }
}

function setupNotificationsListener(){
  if (notificationsUnsub) { notificationsUnsub(); notificationsUnsub = null; }
  if (!isAdminOrAbove(currentUser.role)) { notifications = []; return; }
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(50));
  notificationsUnsub = onSnapshot(q, (snap) => {
    const prev = notifications.length;
    notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateNotifBadge();
    if (prev > 0 && notifications.length > prev) {
      const newest = notifications[0];
      if (newest && !newest.read) {
        toast("🔔 " + newest.title, "success");
        if (currentView === "admin-notifikasi") navigate("admin-notifikasi");
      }
    }
  }, (err) => console.error("Notif listener:", err));
}

function updateNotifBadge(){
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  const unread = notifications.filter(n => !n.read).length;
  if (unread > 0) {
    badge.textContent = unread > 99 ? "99+" : unread;
    badge.style.display = "flex";
  } else badge.style.display = "none";
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
function isEnrolled(courseId){ return progressCache[courseId] !== undefined; }
function progressPct(courseId){
  const c = courses.find(x=>x.id===courseId); if(!c) return 0;
  const done = progressCache[courseId]?.materi || [];
  return Math.round(done.length / c.materi.length * 100);
}
function hasReviewed(courseId){
  return (reviewsCache[courseId]||[]).some(r => r.userId === currentUser.uid);
}
function quizPassed(courseId){
  return progressCache[courseId]?.quizPassed === true;
}
function starsHTML(avg, size=13){
  const rounded = Math.round(avg);
  let s = `<span class="stars" style="font-size:${size}px">`;
  for (let i=1;i<=5;i++) s += `<span class="${i<=rounded?'':'empty'}">★</span>`;
  return s + "</span>";
}
function extractYoutubeId(url){
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : "";
}
function buildYoutubeEmbed(url){
  const id = extractYoutubeId(url);
  if (!id) return "";
  return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"></iframe></div>`;
}

/* =========================================================
   NAV
   ========================================================= */
function renderNav(){
  const role = currentUser.role;
  const isSA = role === "superadmin";
  const isA = isAdminOrAbove(role);

  const superMenu = [
    { sec:"Super Admin" },
    { id:"admin-dashboard", ico:ICONS.dashboard, label:"Dashboard" },
    { id:"admin-kursus",    ico:ICONS.kelola,    label:"Kelola Kursus" },
    { id:"admin-pengguna",  ico:ICONS.users,     label:"Semua Pengguna" },
    { id:"admin-kelola",    ico:ICONS.crown,     label:"Kelola Admin" },
    { id:"admin-sertifikat",ico:ICONS.sertifikat,label:"Desain Sertifikat" },
    { id:"admin-notifikasi",ico:ICONS.bell,      label:"Notifikasi" },
    { id:"admin-laporan",   ico:ICONS.laporan,   label:"Laporan" },
    { sec:"Akun" },
    { id:"profil", ico:ICONS.profil, label:"Profil" },
    { id:"logout", ico:ICONS.logout, label:"Keluar" }
  ];
  const adminMenu = [
    { sec:"Administrator" },
    { id:"admin-dashboard", ico:ICONS.dashboard, label:"Dashboard" },
    { id:"admin-kursus",    ico:ICONS.kelola,    label:"Kelola Kursus" },
    { id:"admin-pengguna",  ico:ICONS.users,     label:"Pengguna" },
    { id:"admin-sertifikat",ico:ICONS.sertifikat,label:"Desain Sertifikat" },
    { id:"admin-notifikasi",ico:ICONS.bell,      label:"Notifikasi" },
    { id:"admin-laporan",   ico:ICONS.laporan,   label:"Laporan" },
    { sec:"Akun" },
    { id:"profil", ico:ICONS.profil, label:"Profil" },
    { id:"logout", ico:ICONS.logout, label:"Keluar" }
  ];
  const userMenu = [
    { sec:"Menu Utama" },
    { id:"dashboard", ico:ICONS.dashboard, label:"Dashboard" },
    { id:"katalog", ico:ICONS.katalog, label:"Katalog Kursus" },
    { id:"kursus-saya", ico:ICONS.kursus, label:"Kursus Saya" },
    { sec:"Pencapaian" },
    { id:"leaderboard", ico:ICONS.trophy, label:"Papan Peringkat" },
    { id:"sertifikat", ico:ICONS.sertifikat, label:"Sertifikat Saya" },
    { id:"profil", ico:ICONS.profil, label:"Profil" },
    { id:"logout", ico:ICONS.logout, label:"Keluar" }
  ];
  const menu = isSA ? superMenu : (isA ? adminMenu : userMenu);
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
function setActiveNav(v){ $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === v)); }

const TITLES = {
  dashboard:"Dashboard", katalog:"Katalog Kursus", "kursus-saya":"Kursus Saya",
  "detail-kursus":"Detail Kursus", sertifikat:"Sertifikat Saya", profil:"Profil",
  player:"Ruang Belajar", leaderboard:"Papan Peringkat",
  "admin-dashboard":"Dashboard Admin", "admin-kursus":"Kelola Kursus",
  "admin-pengguna":"Pengguna", "admin-laporan":"Laporan",
  "admin-kelola":"Kelola Admin", "admin-notifikasi":"Notifikasi",
  "admin-sertifikat":"Desain Sertifikat"
};

window.navigate = (view) => {
  currentView = view;
  setActiveNav(view);
  $("#pageTitle").textContent = TITLES[view] || "Palopo Inovatif";
  const R = {
    dashboard: viewDashboard, katalog: viewKatalog, "kursus-saya": viewKursusSaya,
    "detail-kursus": viewDetailKursus, sertifikat: viewSertifikat, profil: viewProfil,
    player: viewPlayer, leaderboard: viewLeaderboard,
    "admin-dashboard": viewAdminDash, "admin-kursus": viewAdminKursus,
    "admin-pengguna": viewAdminPengguna, "admin-laporan": viewAdminLaporan,
    "admin-kelola": viewKelolaAdmin, "admin-notifikasi": viewNotifikasi,
    "admin-sertifikat": viewAdminSertifikat
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
  $("#topRole").textContent =
    currentUser.role === "superadmin" ? "👑 Super Admin" :
    currentUser.role === "admin" ? "Administrator" : "Peserta";
  // Bell notif untuk admin
  const right = document.querySelector(".topbar .right");
  if (isAdminOrAbove(currentUser.role)) {
    if (!document.getElementById("notifBell")) {
      const bell = document.createElement("div");
      bell.id = "notifBell";
      bell.className = "notif-bell";
      bell.onclick = () => navigate("admin-notifikasi");
      bell.innerHTML = ICONS.bell + '<span class="badge" id="notifBadge" style="display:none">0</span>';
      right.insertBefore(bell, right.firstChild);
    }
    updateNotifBadge();
  } else {
    const b = document.getElementById("notifBell"); if (b) b.remove();
  }
  renderNav();
  navigate(isAdminOrAbove(currentUser.role) ? "admin-dashboard" : "dashboard");
}

/* =========================================================
   USER VIEWS — Course Card & Dashboard
   ========================================================= */
function courseCardHTML(c){
  const thumb = c.cover
    ? `<img src="${c.cover}" alt="">`
    : `<span class="placeholder">${c.ikon || "📘"}</span>`;
  const avg = avgRating(c.id);
  const cnt = reviewCount(c.id);
  const enrolled = isEnrolled(c.id);
  const pct = enrolled ? progressPct(c.id) : 0;
  const passed = quizPassed(c.id);

  let statusBadge = `<span class="course-status not-enrolled">Belum Diikuti</span>`;
  if (passed) statusBadge = `<span class="course-status done">✓ Selesai</span>`;
  else if (enrolled) statusBadge = `<span class="course-status enrolled">Sedang Diikuti</span>`;

  return `<div class="course-card">
    <div class="course-thumb">${thumb}<span class="badge-lvl">${esc(c.level)}</span></div>
    <div class="course-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div class="cat">${esc(c.kategori)}</div>
        ${statusBadge}
      </div>
      <h4>${esc(c.judul)}</h4>
      <p>${esc(c.deskripsi).slice(0,90)}...</p>
      <div class="course-meta">
        <span>📖 ${c.materi.length} materi</span>
        <span>💰 ${c.jp} JP</span>
      </div>
      <div class="course-meta" style="border-top:1px solid var(--border);padding-top:10px">
        <span class="rating-inline">${starsHTML(avg)} ${avg?avg.toFixed(1):"0.0"} ${cnt?`(${cnt})`:""}</span>
        ${c.quiz && c.quiz.length ? `<span>📝 ${c.quiz.length} soal</span>` : ""}
      </div>
      ${enrolled ? `<div class="progress-bar"><div style="width:${pct}%"></div></div>` : ""}
      <button class="btn btn-primary btn-sm" onclick="openDetailKursus('${c.id}')">
        ${passed ? "✓ Lihat Kursus" : enrolled ? `▶ Lanjutkan (${pct}%)` : "Lihat Detail"}
      </button>
    </div>
  </div>`;
}

function viewDashboard(){
  const enrolled = Object.keys(progressCache);
  const done = enrolled.filter(id => quizPassed(id)).length;
  const latest = [...courses].slice(0, 6).reverse();

  const profileAlert = !isProfileComplete(currentUser) ? `
    <div class="profile-alert">
      <span class="icon">⚠️</span>
      <div class="msg">
        <b>Lengkapi Profil Anda</b>
        <p>Isi NIP, OPD, dan nomor WhatsApp untuk dapat mendaftar kursus.</p>
      </div>
      <button class="btn btn-gold btn-sm" onclick="openEditProfil()">Lengkapi</button>
    </div>` : "";

  return `
    ${profileAlert}
    <div class="grid grid-4">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${courses.length}</div><div class="lbl">Kursus Tersedia</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">✅</div><div><div class="num">${enrolled.length}</div><div class="lbl">Kursus Diikuti</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">🏅</div><div><div class="num">${certificatesCache.length}</div><div class="lbl">Sertifikat</div></div></div>
      <div class="card stat-card"><div class="ic ic-red">🎓</div><div><div class="num">${done}</div><div class="lbl">Kursus Lulus</div></div></div>
    </div>
    <div class="section-title">🎯 Kursus Terbaru</div>
    <div class="course-grid">${latest.length ? latest.map(courseCardHTML).join("") : '<div class="empty" style="grid-column:1/-1"><div class="ico">📚</div><h4>Belum ada kursus</h4></div>'}</div>
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
    <div class="course-grid" id="katalogGrid">${courses.length ? courses.map(courseCardHTML).join("") : '<div class="empty" style="grid-column:1/-1"><div class="ico">🔍</div><h4>Belum ada kursus</h4></div>'}</div>
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
  return `<div class="course-grid">${list.map(courseCardHTML).join("")}</div>`;
}

/* =========================================================
   DETAIL KURSUS
   ========================================================= */
window.openDetailKursus = (id) => { activeCourseId = id; navigate("detail-kursus"); };

function viewDetailKursus(){
  const c = courses.find(x => x.id === activeCourseId);
  if (!c) return '<div class="empty">Kursus tidak ditemukan</div>';
  const avg = avgRating(c.id);
  const cnt = reviewCount(c.id);
  const enrolled = isEnrolled(c.id);
  const passed = quizPassed(c.id);
  const profileOk = isProfileComplete(currentUser);

  const thumb = c.cover
    ? `<img src="${c.cover}" style="width:100%;height:240px;object-fit:cover;border-radius:14px">`
    : `<div style="width:100%;height:240px;border-radius:14px;background:linear-gradient(135deg,var(--blue-100),var(--blue-50));display:flex;align-items:center;justify-content:center;font-size:80px">${c.ikon||"📘"}</div>`;

  return `
    <button class="btn btn-ghost btn-sm" onclick="navigate('katalog')" style="margin-bottom:16px">← Kembali ke Katalog</button>
    <div class="card" style="margin-bottom:18px">
      ${thumb}
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--blue-600);font-weight:700;text-transform:uppercase;letter-spacing:.5px">${esc(c.kategori)} • ${esc(c.level)}</div>
        <h2 style="font-size:22px;color:var(--navy-800);margin:8px 0 10px;font-weight:800">${esc(c.judul)}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:var(--muted);margin-bottom:14px">
          <span>👨‍🏫 <b style="color:var(--navy-700)">${esc(c.instruktur)}</b></span>
          <span>📖 <b style="color:var(--navy-700)">${c.materi.length} materi</b></span>
          <span>💰 <b style="color:var(--navy-700)">${c.jp} JP</b></span>
          ${c.quiz && c.quiz.length ? `<span>📝 <b style="color:var(--navy-700)">${c.quiz.length} soal kuis</b></span>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          ${starsHTML(avg,18)}
          <b style="color:var(--navy-800)">${avg?avg.toFixed(1):"0.0"}</b>
          <span style="color:var(--muted);font-size:13px">• ${cnt} ulasan</span>
        </div>
        <p style="font-size:14px;color:var(--text);line-height:1.8;margin-bottom:20px">${esc(c.deskripsi)}</p>

        ${passed ? `
          <div style="background:#f0fdf4;padding:18px;border-radius:12px;border:1.5px solid #86efac;margin-bottom:16px">
            <b style="color:#166534;font-size:14px">✓ Anda telah menyelesaikan kursus ini</b>
            <p style="color:#166534;font-size:12.5px;margin-top:4px">Ulasan dan sertifikat sudah tersedia</p>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="openCourse('${c.id}')">Lihat Kursus →</button>
        ` : enrolled ? `
          <div style="background:var(--blue-50);padding:18px;border-radius:12px;border:1.5px solid var(--blue-400);margin-bottom:16px">
            <b style="color:var(--blue-600);font-size:14px">📖 Anda sedang mengikuti kursus ini</b>
            <p style="color:var(--blue-600);font-size:12.5px;margin-top:4px">Progress ${progressPct(c.id)}% • ${(progressCache[c.id]?.materi||[]).length} dari ${c.materi.length} materi selesai</p>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="openCourse('${c.id}')">▶ Lanjutkan Belajar</button>
        ` : `
          ${!profileOk ? `
            <div class="profile-alert" style="margin-bottom:14px">
              <span class="icon">⚠️</span>
              <div class="msg"><b>Profil Belum Lengkap</b><p>Lengkapi NIP, OPD, dan nomor WhatsApp terlebih dahulu.</p></div>
              <button class="btn btn-gold btn-sm" onclick="openEditProfil()">Lengkapi</button>
            </div>` : ""}
          <button class="btn btn-gold" style="width:100%;padding:14px;font-size:15px" onclick="daftarKursus('${c.id}')" ${!profileOk?"disabled":""}>
            ${profileOk ? "📝 Daftar Kursus Ini" : "🔒 Lengkapi Profil Dulu"}
          </button>
        `}
      </div>
    </div>

    <div class="section-title">📚 Materi yang Akan Dipelajari</div>
    ${c.materi.map((m,i)=>{
      const completed = (progressCache[c.id]?.materi||[]).includes(i);
      const tipeLabel = m.tipe === "video" ? "🎬 Video" : m.tipe === "dokumen" ? "📄 Dokumen" : "🔗 Materi";
      return `<div class="material-item ${completed?'done':''}" style="cursor:default">
        <div class="idx">${completed?'✓':i+1}</div>
        <div style="flex:1;min-width:0">
          <div class="t">${esc(m.judul)}</div>
          <div class="d">⏱️ ${m.durasi} menit • ${tipeLabel}</div>
        </div>
      </div>`;
    }).join("")}

    ${c.quiz && c.quiz.length ? `
      <div class="section-title">📝 Kuis Akhir</div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:36px">🎯</div>
          <div style="flex:1">
            <b style="color:var(--navy-800);font-size:14px">Kuis Akhir Kursus</b>
            <p style="color:var(--muted);font-size:12.5px;margin-top:4px">${c.quiz.length} soal pilihan ganda • Nilai minimum ${QUIZ_PASS_SCORE} untuk lulus</p>
          </div>
        </div>
      </div>
    ` : ""}
  `;
}

/* =========================================================
   DAFTAR KURSUS
   ========================================================= */
window.daftarKursus = async (courseId) => {
  const c = courses.find(x=>x.id===courseId);
  if (!c) return;
  if (!isProfileComplete(currentUser)) { openEditProfil(); return; }
  openModal(`
    <div class="confirm-head">
      <span class="ico">📝</span>
      <h3>Daftar Kursus?</h3>
      <p>Anda akan mendaftar kursus <b>${esc(c.judul)}</b>.<br>Setelah mendaftar, Anda bisa mengakses semua materi.</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="confirmDaftar('${courseId}')">Ya, Daftar</button>
    </div>
  `);
};

window.confirmDaftar = async (courseId) => {
  showLoading(true);
  try {
    await setDoc(doc(db, "progress", `${currentUser.uid}_${courseId}`), {
      userId: currentUser.uid, courseId,
      materi: [], quizPassed: false, quizScore: 0,
      enrolledAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    progressCache[courseId] = { materi: [], quizPassed: false, quizScore: 0 };
    closeModal();
    toast("✅ Berhasil mendaftar kursus!", "success");
    openCourse(courseId);
  } catch (e) { toast("Gagal daftar: " + e.message, "error"); }
  finally { showLoading(false); }
};

window.openCourse = (id) => {
  activeCourseId = id;
  currentMateriIndex = 0;
  if (progressCache[id] === undefined) { toast("Daftar kursus dulu", "error"); return; }
  navigate("player");
};

/* =========================================================
   PLAYER — Sequential
   ========================================================= */
function viewPlayer(){
  const c = courses.find(x => x.id === activeCourseId);
  if (!c) return '<div class="empty">Kursus tidak ditemukan</div>';

  const p = progressCache[c.id] || { materi: [], quizPassed: false };
  const done = p.materi || [];
  const totalMateri = c.materi.length;
  const completedCount = done.length;
  const allMateriDone = completedCount >= totalMateri;
  const idx = Math.min(currentMateriIndex, totalMateri - 1);
  const m = c.materi[idx];
  const isDone = done.includes(idx);
  const isLast = idx === totalMateri - 1;
  const allBeforeDone = Array.from({length: idx}, (_,i) => done.includes(i)).every(Boolean);

  const avg = avgRating(c.id);
  const cnt = reviewCount(c.id);

  let contentHTML = "";
  if (!allBeforeDone) {
    contentHTML = `<div class="materi-locked-tip"><span class="icon">🔒</span><div><b>Materi Terkunci</b><br>Selesaikan materi sebelumnya terlebih dahulu.</div></div>`;
  } else {
    if (m.videoUrl) contentHTML += buildYoutubeEmbed(m.videoUrl);
    if (m.deskripsi) contentHTML += `<p style="font-size:14px;color:var(--text);line-height:1.8;margin:14px 0">${esc(m.deskripsi)}</p>`;
    if (m.modulUrl) contentHTML += `<a href="${esc(m.modulUrl)}" target="_blank" rel="noopener" class="btn btn-ghost" style="margin-top:8px">📄 Buka Modul Materi</a>`;
    if (!m.videoUrl && !m.modulUrl && !m.deskripsi) {
      contentHTML += `<div class="empty" style="padding:36px 20px"><div class="ico">📄</div><h4>Materi kosong</h4><p>Tandai selesai untuk melanjutkan.</p></div>`;
    }
  }

  return `
    <button class="btn btn-ghost btn-sm" onclick="navigate('kursus-saya')" style="margin-bottom:16px">← Kembali</button>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:56px;height:56px;border-radius:14px;background:var(--blue-100);display:flex;align-items:center;justify-content:center;font-size:26px">${c.ikon||"📘"}</div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--blue-600);font-weight:700;text-transform:uppercase">${esc(c.kategori)} • ${esc(c.level)}</div>
          <h3 style="font-size:17px;color:var(--navy-800);margin-top:4px">${esc(c.judul)}</h3>
        </div>
      </div>
      <div style="margin-top:14px;background:var(--blue-50);padding:12px 16px;border-radius:10px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px">
          <b style="color:var(--navy-800)">Progress</b>
          <b style="color:var(--blue-600)">${completedCount} / ${totalMateri} materi</b>
        </div>
        <div class="progress-bar" style="margin-bottom:0"><div style="width:${Math.round(completedCount/totalMateri*100)}%"></div></div>
      </div>
    </div>

    <div class="player-layout">
      <div>
        <div class="materi-viewer">
          <div class="materi-viewer-head">
            <div>
              <div style="font-size:11px;color:var(--blue-600);font-weight:800;text-transform:uppercase;letter-spacing:.5px">Materi ${idx+1} dari ${totalMateri}</div>
              <h3>${esc(m.judul)}</h3>
            </div>
            ${isDone ? '<span class="tag tag-green">✓ Selesai</span>' : '<span class="tag tag-blue">Sedang Dipelajari</span>'}
          </div>
          <div style="font-size:12.5px;color:var(--muted);margin-bottom:14px">
            ⏱️ ${m.durasi} menit • ${m.tipe==="video"?"🎬 Video":m.tipe==="dokumen"?"📄 Dokumen":"🔗 Materi"}
          </div>
          ${contentHTML}

          <div class="materi-nav">
            <button class="btn btn-ghost" ${idx===0?"disabled":""} onclick="prevMateri()">← Sebelumnya</button>
            ${!isDone && allBeforeDone ? `<button class="btn btn-success" onclick="markMateriSelesai()">✓ Tandai Selesai</button>` : ""}
            ${isDone && !isLast ? `<button class="btn btn-primary" onclick="nextMateri()">Selanjutnya →</button>` : ""}
            ${isLast && isDone ? `<button class="btn btn-gold" onclick="scrollToQuiz()">📝 Kerjakan Kuis →</button>` : ""}
          </div>
        </div>

        ${allMateriDone ? `
          <div class="section-title" id="quizSection">📝 Kuis Akhir Kursus</div>
          ${quizPassed(c.id) ? `
            <div class="card" style="background:#f0fdf4;border:1.5px solid #86efac;text-align:center">
              <div style="font-size:32px">🎉</div>
              <b style="color:#166534;font-size:15px">Anda Lulus Kuis!</b>
              <p style="color:#166534;font-size:13px;margin-top:6px">Skor: ${p.quizScore || 0} / 100</p>
            </div>
          ` : c.quiz && c.quiz.length ? `
            <div class="card" style="text-align:center">
              <div style="font-size:36px">🎯</div>
              <b style="color:var(--navy-800);font-size:15px;display:block;margin:8px 0 4px">Kuis Akhir Kursus</b>
              <p style="color:var(--muted);font-size:13px;margin-bottom:14px">${c.quiz.length} soal • Nilai min ${QUIZ_PASS_SCORE} untuk lulus</p>
              <button class="btn btn-primary" onclick="startQuiz('${c.id}')">▶ Mulai Kuis</button>
            </div>
          ` : `
            <div class="card" style="background:#f0fdf4;border:1.5px solid #86efac;text-align:center">
              <div style="font-size:32px">✓</div>
              <b style="color:#166534;font-size:15px">Semua materi selesai</b>
              <p style="color:#166534;font-size:13px;margin-top:6px">Kursus ini tidak memiliki kuis</p>
            </div>
          `}
        ` : ""}

        <div class="section-title">💬 Ulasan Peserta <small>${cnt} ulasan</small></div>
        ${(quizPassed(c.id) || !c.quiz || !c.quiz.length) && allMateriDone ? (hasReviewed(c.id) ? `
          <div class="card" style="background:var(--blue-50);border-color:var(--blue-100);margin-bottom:14px">
            <b style="font-size:13px;color:var(--navy-800)">✓ Ulasan Anda sudah dikirim</b>
            <div style="margin-top:6px">${starsHTML((reviewsCache[c.id]||[]).find(r=>r.userId===currentUser.uid)?.rating || 0,16)}</div>
            <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="openReviewModal('${c.id}')">✏️ Ubah Ulasan</button>
          </div>` : `
          <div class="card" style="background:var(--gold-light);border:none;margin-bottom:14px;text-align:center">
            <b style="color:#92400e">Bagikan pengalaman Anda!</b>
            <p style="font-size:12.5px;color:#92400e;margin:6px 0 12px">Beri rating untuk dapat mengunduh sertifikat.</p>
            <button class="btn btn-gold btn-sm" onclick="openReviewModal('${c.id}')">⭐ Tulis Ulasan</button>
          </div>`) : `
          <div class="card" style="background:var(--bg);border:none;text-align:center;padding:22px">
            <p style="font-size:12.5px;color:var(--muted)">🔒 Lulus kuis & selesaikan materi untuk menulis ulasan.</p>
          </div>`}
        ${renderReviewList(c.id)}
      </div>

      <div>
        <div class="card" style="position:sticky;top:90px;max-height:calc(100vh - 120px);overflow-y:auto">
          <b style="font-size:13px;color:var(--navy-800);display:block;margin-bottom:12px">📚 Daftar Materi</b>
          ${c.materi.map((mm,i)=>{
            const cd = done.includes(i);
            const locked = !allBeforeDone && i > idx;
            const isActive = i === idx;
            return `<div onclick="${locked ? '' : `jumpMateri(${i})`}" style="padding:9px 11px;border-radius:9px;margin-bottom:6px;cursor:${locked?'not-allowed':'pointer'};background:${isActive?'var(--blue-50)':cd?'#f0fdf4':'#fff'};border:1.5px solid ${isActive?'var(--blue-400)':cd?'#86efac':'var(--border)'};opacity:${locked?.5:1};transition:.15s">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:22px;height:22px;border-radius:50%;background:${cd?'var(--success)':isActive?'var(--blue-600)':'var(--bg)'};color:${cd||isActive?'#fff':'var(--muted)'};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  ${cd?'✓':locked?'🔒':i+1}
                </div>
                <div style="font-size:12px;font-weight:600;color:var(--navy-800);line-height:1.3">${esc(mm.judul).slice(0,40)}${mm.judul.length>40?'...':''}</div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

window.jumpMateri = (i) => { currentMateriIndex = i; navigate("player"); };
window.nextMateri = () => {
  const c = courses.find(x => x.id === activeCourseId);
  if (!c) return;
  if (currentMateriIndex < c.materi.length - 1) {
    currentMateriIndex++;
    navigate("player");
    window.scrollTo({top:0,behavior:"smooth"});
  }
};
window.prevMateri = () => {
  if (currentMateriIndex > 0) {
    currentMateriIndex--;
    navigate("player");
    window.scrollTo({top:0,behavior:"smooth"});
  }
};
window.markMateriSelesai = async () => {
  const courseId = activeCourseId;
  const c = courses.find(x => x.id === courseId);
  if (!c) return;
  const p = progressCache[courseId] || { materi: [] };
  const arr = p.materi ? [...p.materi] : [];
  if (!arr.includes(currentMateriIndex)) arr.push(currentMateriIndex);
  progressCache[courseId] = { ...p, materi: arr };
  await setDoc(doc(db, "progress", `${currentUser.uid}_${courseId}`), {
    userId: currentUser.uid, courseId, materi: arr,
    quizPassed: p.quizPassed || false,
    quizScore: p.quizScore || 0,
    updatedAt: serverTimestamp()
  }, { merge: true });
  toast("✓ Materi ditandai selesai", "success");
  if (currentMateriIndex < c.materi.length - 1) currentMateriIndex++;
  navigate("player");
};
window.scrollToQuiz = () => {
  const el = document.getElementById("quizSection");
  if (el) el.scrollIntoView({behavior:"smooth"});
};

/* =========================================================
   KUIS
   ========================================================= */
window.startQuiz = (courseId) => {
  const c = courses.find(x => x.id === courseId);
  if (!c || !c.quiz || !c.quiz.length) return toast("Kuis belum tersedia", "error");
  pendingQuiz = { courseId, answers: new Array(c.quiz.length).fill(-1), quiz: c.quiz };
  renderQuizPage();
};

function renderQuizPage(){
  if (!pendingQuiz) return;
  const { courseId, answers, quiz } = pendingQuiz;
  const c = courses.find(x => x.id === courseId);
  openModal(`
    <h3>📝 Kuis Akhir: ${esc(c.judul)}</h3>
    <div style="background:var(--blue-50);padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:12.5px;color:var(--blue-600);line-height:1.6">
      <b>${quiz.length} soal</b> • Nilai minimum <b>${QUIZ_PASS_SCORE}</b> untuk lulus.<br>
      Setiap jawaban benar bernilai ${Math.round(100/quiz.length)} poin.
    </div>
    <div id="quizContainer">
      ${quiz.map((q, qi) => `
        <div class="quiz-question">
          <div class="qnum">Soal ${qi+1} dari ${quiz.length}</div>
          <div class="qtext">${esc(q.pertanyaan)}</div>
          ${q.pilihan.map((opt, oi) => `
            <div class="quiz-option" data-q="${qi}" data-o="${oi}" onclick="selectQuizOption(${qi},${oi})">
              <div class="letter">${String.fromCharCode(65+oi)}</div>
              <div>${esc(opt)}</div>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="cancelQuiz()">Batal</button>
      <button class="btn btn-primary" onclick="submitQuiz()">✓ Kirim Jawaban</button>
    </div>
  `);
  answers.forEach((a, qi) => {
    if (a >= 0) {
      const el = document.querySelector(`.quiz-option[data-q="${qi}"][data-o="${a}"]`);
      if (el) el.classList.add("selected");
    }
  });
}
window.selectQuizOption = (qi, oi) => {
  if (!pendingQuiz) return;
  pendingQuiz.answers[qi] = oi;
  document.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(el => el.classList.remove("selected"));
  const el = document.querySelector(`.quiz-option[data-q="${qi}"][data-o="${oi}"]`);
  if (el) el.classList.add("selected");
};
window.cancelQuiz = () => { pendingQuiz = null; closeModal(); };

window.submitQuiz = async () => {
  if (!pendingQuiz) return;
  const { courseId, answers, quiz } = pendingQuiz;
  const unanswered = answers.findIndex(a => a === -1);
  if (unanswered >= 0) return toast(`Soal ${unanswered + 1} belum dijawab`, "error");

  let benar = 0;
  answers.forEach((a, i) => { if (a === quiz[i].jawaban) benar++; });
  const skor = Math.round(benar / quiz.length * 100);
  const lulus = skor >= QUIZ_PASS_SCORE;

  showLoading(true);
  try {
    const p = progressCache[courseId] || {};
    await setDoc(doc(db, "progress", `${currentUser.uid}_${courseId}`), {
      userId: currentUser.uid, courseId,
      materi: p.materi || [],
      quizPassed: lulus || p.quizPassed || false,
      quizScore: Math.max(skor, p.quizScore || 0),
      lastQuizAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    progressCache[courseId] = { ...p, quizPassed: lulus || p.quizPassed || false, quizScore: Math.max(skor, p.quizScore || 0) };

    if (lulus) {
      await addDoc(collection(db, "notifications"), {
        type: "lulus_kursus",
        title: "Peserta Lulus Kursus",
        message: `${currentUser.nama} lulus kursus "${courses.find(x=>x.id===courseId)?.judul}" dengan skor ${skor}.`,
        email: currentUser.email,
        createdAt: serverTimestamp(),
        read: false
      });
    }
    openModal(`
      <div class="quiz-result ${lulus?'pass':'fail'}">
        <div style="font-size:56px;margin-bottom:8px">${lulus?'🎉':'😔'}</div>
        <div class="score">${skor}</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:16px">dari 100</div>
        <h3 style="margin-bottom:8px">${lulus?'Selamat, Anda Lulus!':'Belum Lulus'}</h3>
        <p style="color:var(--muted);font-size:13.5px;line-height:1.7;margin-bottom:20px">
          ${lulus ? 'Anda berhasil menyelesaikan kursus ini.' : `Nilai minimum kelulusan adalah ${QUIZ_PASS_SCORE}. Silakan coba lagi.`}
        </p>
        <div class="modal-actions">
          ${lulus
            ? `<button class="btn btn-ghost" onclick="closeModal();navigate('player')">Lihat Kursus</button>
               <button class="btn btn-primary" onclick="closeModal();navigate('sertifikat')">🏅 Sertifikat</button>`
            : `<button class="btn btn-ghost" onclick="closeModal();navigate('player')">Tutup</button>
               <button class="btn btn-primary" onclick="retryQuiz('${courseId}')">🔄 Coba Lagi</button>`}
        </div>
      </div>
    `);
    pendingQuiz = null;
  } catch (e) { toast("Gagal simpan: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.retryQuiz = (courseId) => { closeModal(); startQuiz(courseId); };

/* =========================================================
   REVIEW
   ========================================================= */
function renderReviewList(courseId){
  const list = (reviewsCache[courseId] || []).slice().sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  if (!list.length) return '<div class="empty" style="padding:30px"><div class="ico">💬</div><h4>Belum ada ulasan</h4></div>';
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
          <div style="flex:1"><b>${esc(r.nama)}</b><span>${fmtDate(r.createdAt)}</span></div>
          ${starsHTML(r.rating,14)}
        </div>
        <p>${esc(r.komentar)}</p>
      </div>
    `).join("")}
  `;
}
window.openReviewModal = (courseId) => {
  const existing = (reviewsCache[courseId]||[]).find(r=>r.userId===currentUser.uid);
  currentRating = existing ? existing.rating : 0;
  openModal(`
    <h3>${existing ? "✏️ Ubah Ulasan" : "⭐ Tulis Ulasan"}</h3>
    <div class="field"><label>Rating</label>
      <div class="star-input" id="starInput">
        ${[1,2,3,4,5].map(i=>`<span data-v="${i}" onclick="setRating(${i})" onmouseover="hoverStar(${i})" onmouseout="hoverStar(0)">★</span>`).join("")}
      </div>
    </div>
    <div class="field"><label>Komentar</label><textarea id="reviewKomentar" rows="4" placeholder="Bagikan pengalaman...">${existing ? esc(existing.komentar) : ""}</textarea></div>
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
  const isNew = !hasReviewed(courseId);
  const id = `${currentUser.uid}_${courseId}`;
  const data = { userId: currentUser.uid, courseId, nama: currentUser.nama, foto: currentUser.foto, rating: currentRating, komentar, createdAt: serverTimestamp() };
  showLoading(true);
  try {
    await setDoc(doc(db, "reviews", id), data);
    reviewsCache[courseId] = (reviewsCache[courseId]||[]).filter(r=>r.userId!==currentUser.uid);
    reviewsCache[courseId].push({ id, ...data });
    if (isNew) {
      await addDoc(collection(db, "notifications"), {
        type: "ulasan_baru",
        title: "Ulasan Baru",
        message: `${currentUser.nama} memberi ${currentRating}⭐ untuk kursus "${courses.find(x=>x.id===courseId)?.judul}".`,
        email: currentUser.email,
        createdAt: serverTimestamp(),
        read: false
      });
    }
    closeModal();
    toast("✓ Ulasan terkirim. Terima kasih!", "success");
    navigate("player");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

/* =========================================================
   SERTIFIKAT
   ========================================================= */
function viewSertifikat(){
  const passed = Object.keys(progressCache).filter(id => quizPassed(id) || (!courses.find(c=>c.id===id)?.quiz?.length && progressPct(id)===100));
  if (!passed.length) return '<div class="empty"><div class="ico">🏅</div><h4>Belum ada sertifikat</h4><p>Selesaikan kursus & lulus kuis untuk mendapat sertifikat.</p><br><button class="btn btn-primary" onclick="navigate(\'katalog\')">Mulai Belajar</button></div>';
  return `<div class="grid grid-2">${passed.map(id=>{
    const c = courses.find(x=>x.id===id); if(!c) return "";
    const hasRev = hasReviewed(id);
    const certIssued = certificatesCache.includes(id);
    return `<div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;text-align:center;padding:26px">
      <div style="font-size:50px">🏅</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;font-weight:700;margin-top:8px">Sertifikat Kelulusan</div>
      <h3 style="font-size:15px;color:var(--navy-800);margin:10px 0">${esc(c.judul)}</h3>
      <b style="font-size:14px;color:var(--navy-800);display:block;margin:4px 0">${esc(currentUser.nama)}</b>
      <div style="font-size:11.5px;color:var(--muted);margin:8px 0">${c.jp} JP • Skor: ${progressCache[id]?.quizScore || 0}/100</div>
      ${!hasRev ? `
        <div style="background:rgba(220,38,38,.1);border:1.5px solid rgba(220,38,38,.3);border-radius:10px;padding:10px;margin:12px 0;font-size:12px;color:#b91c1c">
          ⚠️ Beri ulasan terlebih dahulu untuk mengunduh sertifikat.
        </div>
        <button class="btn btn-gold btn-sm" onclick="openReviewModal('${c.id}')">⭐ Tulis Ulasan</button>
      ` : !certIssued ? `
        <button class="btn btn-success btn-sm" onclick="issueCert('${c.id}')">🏅 Terbitkan Sertifikat</button>
      ` : `
        <button class="btn btn-gold btn-sm" onclick="printCert('${c.id}')">🖨️ Cetak / Simpan PDF</button>
      `}
    </div>`;
  }).join("")}</div>`;
}
window.issueCert = async (courseId) => {
  if (certificatesCache.includes(courseId)) return;
  if (!hasReviewed(courseId)) { toast("Beri ulasan dahulu", "error"); return; }
  await setDoc(doc(db, "certificates", `${currentUser.uid}_${courseId}`), { userId: currentUser.uid, courseId, nama: currentUser.nama, issuedAt: serverTimestamp() });
  certificatesCache.push(courseId);
  toast("🎉 Sertifikat diterbitkan!", "success");
  navigate("sertifikat");
};
window.printCert = (id) => {
  const c = courses.find(x=>x.id===id); if(!c) return;
  if (!hasReviewed(id)) { toast("Beri ulasan terlebih dahulu", "error"); return; }
  openPrintWindow(c, currentUser);
};

function openPrintWindow(course, user){
  const bgUrl = certificateSettings.backgroundUrl || "";
  const bgStyle = bgUrl ? `background-image:url('${bgUrl}');background-size:cover;background-position:center;` : `background:linear-gradient(135deg,#fffbeb,#fef3c7);`;
  const w = window.open("", "", "width=1100,height=800");
  w.document.write(`
    <html><head><title>Sertifikat - ${esc(course.judul)}</title>
    <style>
      @page{size:A4 landscape;margin:0}
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;padding:20px}
      .cert{width:297mm;height:210mm;max-width:100%;${bgStyle}display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.15);overflow:hidden}
      .cert-inner{text-align:center;padding:40px 60px;max-width:80%;position:relative;z-index:2}
      h1{color:#132c4f;font-size:42px;letter-spacing:3px;margin:0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      .sub{color:#f59e0b;letter-spacing:8px;font-size:13px;margin:8px 0 26px;font-weight:700;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      h2{font-size:26px;color:#2563eb;margin:18px 0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      .name{font-size:34px;color:#132c4f;font-weight:700;border-bottom:3px solid #f59e0b;display:inline-block;padding:0 24px 10px;margin:18px 0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      p{font-size:15px;color:#475569;line-height:1.8;margin:14px 0;text-shadow:0 1px 6px rgba(255,255,255,.8)}
      .foot{margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#64748b;text-shadow:0 1px 6px rgba(255,255,255,.8)}
    </style></head><body>
    <div class="cert"><div class="cert-inner">
      <h1>PALOPO INOVATIF</h1>
      <div class="sub">SERTIFIKAT KELULUSAN</div>
      <p>Diberikan kepada:</p>
      <div class="name">${esc(user.nama)}</div>
      <p>Telah menyelesaikan kursus pelatihan mandiri:</p>
      <h2>${esc(course.judul)}</h2>
      <p>Dengan beban ${course.jp} Jam Pelajaran (JP) kategori ${esc(course.kategori)} tingkat ${esc(course.level)}.<br>
      Skor kuis akhir: <b>${progressCache[course.id]?.quizScore || 0}/100</b>.<br>
      Diselenggarakan oleh Bidang Riset dan Inovasi Daerah<br>Bapperida Kota Palopo.</p>
      <div class="foot">
        <div>No: PI/${course.id.slice(-6).toUpperCase()}/${new Date().getFullYear()}</div>
        <div>Palopo, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
    </div></div>
    <script>setTimeout(()=>window.print(),500)<\/script>
    </body></html>
  `);
  w.document.close();
}

/* =========================================================
   PROFIL
   ========================================================= */
function viewProfil(){
  const roleLabel = currentUser.role === "superadmin" ? "👑 Super Admin" : currentUser.role === "admin" ? "🛡️ Administrator" : "👤 Peserta";
  const roleBg = currentUser.role === "superadmin" ? "linear-gradient(135deg,#f59e0b,#dc2626)" : currentUser.role === "admin" ? "var(--gold)" : "var(--blue-600)";
  const complete = isProfileComplete(currentUser);
  return `
    <div class="card" style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--blue-50),#fff);border:1px solid var(--blue-100);margin-bottom:18px">
      <div class="avatar" style="width:80px;height:80px;font-size:30px;margin:0 auto 14px">${currentUser.foto?`<img src="${currentUser.foto}">`:initial(currentUser.nama)}</div>
      <h3 style="font-size:19px;color:var(--navy-800)">${esc(currentUser.nama)}</h3>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(currentUser.email)}</div>
      <div style="display:inline-block;margin-top:12px;padding:5px 14px;border-radius:20px;background:${roleBg};color:#fff;font-size:11px;font-weight:700">${roleLabel}</div>
    </div>
    ${!complete ? `<div class="profile-alert"><span class="icon">⚠️</span><div class="msg"><b>Profil Belum Lengkap</b><p>Lengkapi NIP, OPD, dan nomor WhatsApp.</p></div></div>` : ""}
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <b style="color:var(--navy-800)">📋 Informasi Akun</b>
        <button class="btn btn-primary btn-sm" onclick="openEditProfil()">✏️ Edit Profil</button>
      </div>
      <table>
        <tr><td style="color:var(--muted);width:150px">Nama</td><td><b>${esc(currentUser.nama)}</b></td></tr>
        <tr><td style="color:var(--muted)">Email</td><td>${esc(currentUser.email)}</td></tr>
        <tr><td style="color:var(--muted)">NIP</td><td>${currentUser.nip?esc(currentUser.nip):'<span style="color:var(--danger)">Belum diisi</span>'}</td></tr>
        <tr><td style="color:var(--muted)">OPD</td><td>${currentUser.opd?esc(currentUser.opd):'<span style="color:var(--danger)">Belum diisi</span>'}</td></tr>
        <tr><td style="color:var(--muted)">WhatsApp</td><td>${currentUser.telepon?esc(currentUser.telepon):'<span style="color:var(--danger)">Belum diisi</span>'}</td></tr>
        <tr><td style="color:var(--muted)">Role</td><td>${currentUser.role}</td></tr>
      </table>
    </div>
    <div class="card" style="margin-top:16px">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="openChangePassword()">🔑 Ubah Password</button>
        <button class="btn btn-danger btn-sm" onclick="logout()">🚪 Keluar</button>
      </div>
    </div>`;
}

window.openEditProfil = () => {
  openModal(`
    <h3>✏️ Edit Profil</h3>
    <div class="field"><label>Nama Lengkap *</label><input type="text" id="epNama" value="${esc(currentUser.nama)}" required /></div>
    <div class="field"><label>NIP *</label><input type="text" id="epNip" value="${esc(currentUser.nip)}" required /></div>
    <div class="field"><label>OPD / Instansi *</label><input type="text" id="epOpd" value="${esc(currentUser.opd)}" required /></div>
    <div class="field"><label>Nomor WhatsApp *</label><input type="tel" id="epTel" value="${esc(currentUser.telepon)}" required /></div>
    <div class="field"><label>Email (tidak dapat diubah)</label><input type="email" value="${esc(currentUser.email)}" disabled style="background:#f1f5f9;cursor:not-allowed" /></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveProfil()">💾 Simpan</button>
    </div>
  `);
};
window.saveProfil = async () => {
  const nama = document.getElementById("epNama").value.trim();
  const nip = document.getElementById("epNip").value.trim();
  const opd = document.getElementById("epOpd").value.trim();
  const tel = document.getElementById("epTel").value.trim();
  if (!nama || !nip || !opd || !tel) return toast("Semua field wajib diisi", "error");
  showLoading(true);
  try {
    await updateDoc(doc(db, "users", currentUser.uid), { nama, nip, opd, telepon: tel, updatedAt: serverTimestamp() });
    currentUser.nama = nama; currentUser.nip = nip; currentUser.opd = opd; currentUser.telepon = tel;
    try { await updateProfile(auth.currentUser, { displayName: nama }); } catch(e){}
    closeModal();
    toast("✓ Profil berhasil disimpan", "success");
    navigate(currentView);
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

window.openChangePassword = () => {
  openModal(`
    <h3>🔑 Ubah Password</h3>
    <div class="field"><label>Password Lama</label><input type="password" id="oldPwd" /></div>
    <div class="field"><label>Password Baru (min. 6 karakter)</label><input type="password" id="newPwd" minlength="6" /></div>
    <div class="field"><label>Konfirmasi Password Baru</label><input type="password" id="newPwd2" /></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveNewPassword()">Simpan</button>
    </div>
  `);
};
window.saveNewPassword = async () => {
  const oldP = document.getElementById("oldPwd").value;
  const np = document.getElementById("newPwd").value;
  const np2 = document.getElementById("newPwd2").value;
  if (!oldP || !np || !np2) return toast("Lengkapi semua field", "error");
  if (np.length < 6) return toast("Password min. 6 karakter", "error");
  if (np !== np2) return toast("Konfirmasi password tidak cocok", "error");
  showLoading(true);
  try {
    const cred = EmailAuthProvider.credential(currentUser.email, oldP);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, np);
    await updateDoc(doc(db, "users", currentUser.uid), { pwd: np });
    currentUser.pwd = np;
    closeModal();
    toast("✓ Password berhasil diubah", "success");
  } catch (e) {
    let msg = "Gagal ubah password";
    if (e.code === "auth/wrong-password") msg = "Password lama salah";
    else if (e.code === "auth/requires-recent-login") msg = "Silakan login ulang";
    else msg = e.message;
    toast(msg, "error");
  } finally { showLoading(false); }
};

/* =========================================================
   LEADERBOARD
   ========================================================= */
function viewLeaderboard(){
  const list = [];
  const ratingCount = {};
  Object.values(reviewsCache).flat().forEach(r => {
    if (!ratingCount[r.userId]) ratingCount[r.userId] = { count: 0, sum: 0, nama: r.nama, foto: r.foto };
    ratingCount[r.userId].count++;
    ratingCount[r.userId].sum += r.rating;
  });

  Object.entries(ratingCount).forEach(([uid, rc]) => {
    list.push({
      uid, nama: rc.nama || "Peserta", opd: "-", foto: rc.foto || "",
      reviews: rc.count, avgRating: rc.sum / rc.count, points: rc.count * 20
    });
  });
  // Tambah diri sendiri jika belum ada
  if (!list.find(x => x.uid === currentUser.uid)) {
    const myReviews = Object.values(reviewsCache).flat().filter(r => r.userId === currentUser.uid);
    list.push({
      uid: currentUser.uid, nama: currentUser.nama, opd: currentUser.opd,
      foto: currentUser.foto, reviews: myReviews.length,
      avgRating: myReviews.length ? myReviews.reduce((s,r)=>s+r.rating,0)/myReviews.length : 0,
      points: certificatesCache.length * 100 + myReviews.length * 20
    });
  } else {
    const me = list.find(x => x.uid === currentUser.uid);
    me.points += certificatesCache.length * 100;
    me.opd = currentUser.opd;
  }

  const topActive = [...list].sort((a,b) => b.points - a.points).slice(0, 10);
  const topRated = [...list].filter(x => x.reviews > 0).sort((a,b) => b.avgRating - a.avgRating).slice(0, 10);

  const renderRow = (x, i, mode) => {
    const rankCls = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i+1);
    return `<div class="lb-row ${rankCls}">
      <div class="lb-rank">${medal}</div>
      <div class="avatar" style="width:38px;height:38px;font-size:13px">${x.foto?`<img src="${x.foto}">`:initial(x.nama)}</div>
      <div class="lb-info"><b>${esc(x.nama)}</b><span>${esc(x.opd||"-")}</span></div>
      <div class="lb-score">${mode === "rating" ? (x.avgRating ? x.avgRating.toFixed(1) : "0.0") : x.points}<small>${mode === "rating" ? `${x.reviews} ulasan` : "poin"}</small></div>
    </div>`;
  };

  return `
    <div class="card" style="background:linear-gradient(135deg,var(--navy-800),var(--blue-600));color:#fff;margin-bottom:18px;padding:24px;text-align:center">
      <div style="font-size:44px;margin-bottom:6px">🏆</div>
      <b style="font-size:18px">Papan Peringkat</b>
      <p style="font-size:13px;opacity:.9;margin-top:6px;line-height:1.6">Peserta paling aktif & rating tertinggi</p>
    </div>
    <div class="section-title">🔥 Paling Aktif</div>
    ${topActive.length ? topActive.map((x,i)=>renderRow(x,i,"points")).join("") : '<div class="empty"><div class="ico">👥</div><h4>Belum ada data</h4></div>'}
    <div class="section-title">⭐ Rating Tertinggi</div>
    ${topRated.length ? topRated.map((x,i)=>renderRow(x,i,"rating")).join("") : '<div class="empty"><div class="ico">⭐</div><h4>Belum ada ulasan</h4></div>'}
  `;
}

/* =========================================================
   ADMIN VIEWS
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
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Level</th><th>JP</th><th>Materi</th><th>Kuis</th><th>Rating</th><th>Aksi</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${c.ikon} ${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${esc(c.level)}</td><td>${c.jp}</td><td>${c.materi.length}</td>
          <td>${c.quiz && c.quiz.length ? c.quiz.length : "—"}</td>
          <td>${starsHTML(avgRating(c.id),12)} <small style="color:var(--muted)">${reviewCount(c.id)}</small></td>
          <td><button class="btn btn-ghost btn-sm" onclick="formCourse('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="delCourse('${c.id}')">🗑️</button></td>
        </tr>`).join("") : '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--muted)">Belum ada kursus</td></tr>'}</tbody>
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
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Level</th><th>JP</th><th>Materi</th><th>Kuis</th><th>Rating</th><th>Aksi</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${c.ikon} ${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${esc(c.level)}</td><td>${c.jp}</td><td>${c.materi.length}</td>
          <td>${c.quiz && c.quiz.length ? `<span class="tag tag-green">${c.quiz.length} soal</span>` : '<span class="tag" style="background:#f1f5f9;color:#64748b">—</span>'}</td>
          <td>${starsHTML(avgRating(c.id),12)} <small style="color:var(--muted)">${reviewCount(c.id)}</small></td>
          <td><button class="btn btn-ghost btn-sm" onclick="formCourse('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="delCourse('${c.id}')">🗑️</button></td>
        </tr>`).join("") : '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--muted)">Belum ada kursus</td></tr>'}</tbody>
      </table>
    </div>`;
}

window.formCourse = (id) => {
  const c = id ? courses.find(x=>x.id===id) : null;
  openModal(`
    <h3>${c?"✏️ Edit Kursus":"➕ Tambah Kursus Baru"}</h3>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">1</span> Informasi Kursus</div>
      <div class="field"><label>Judul Kursus *</label><input type="text" id="fcJudul" value="${c?esc(c.judul):""}" /></div>
      <div class="field"><label>Deskripsi *</label><textarea id="fcDesk" rows="3">${c?esc(c.deskripsi):""}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>Kategori *</label><select id="fcKat">${["Riset","Inovasi","Data","Manajemen","Lainnya"].map(k=>`<option ${c&&c.kategori===k?"selected":""}>${k}</option>`).join("")}</select></div>
        <div class="field"><label>Level *</label><select id="fcLvl">${["Dasar","Menengah","Lanjutan"].map(k=>`<option ${c&&c.level===k?"selected":""}>${k}</option>`).join("")}</select></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>JP *</label><input type="number" id="fcJP" min="1" value="${c?c.jp:6}" /></div>
        <div class="field"><label>Ikon</label><input type="text" id="fcIkon" value="${c?c.ikon:"📘"}" maxlength="4" /></div>
      </div>
      <div class="field"><label>Instruktur</label><input type="text" id="fcInstruktur" value="${c?esc(c.instruktur):""}" /></div>
    </div>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">2</span> Cover (Opsional)</div>
      <div class="field">
        <input type="file" accept="image/*" onchange="uploadCover(this)" />
        <input type="hidden" id="fcCover" value="${c?c.cover||"":""}" />
        <div id="coverPreview">${c&&c.cover?`<img src="${c.cover}" style="width:100%;border-radius:10px;margin-top:8px">`:""}</div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">3</span> Daftar Materi</div>
      <div id="materiList"></div>
      <button type="button" class="btn-add-materi" onclick="addMateriRow()">＋ Tambah Materi</button>
    </div>

    <div class="form-section">
      <div class="form-section-title"><span class="badge">4</span> Kuis Akhir (Opsional)</div>
      <div id="quizList"></div>
      <button type="button" class="btn-add-materi" onclick="addQuizRow()">＋ Tambah Soal Kuis</button>
      <p style="font-size:11.5px;color:var(--muted);margin-top:8px">Kuis opsional. Jika diisi, peserta harus lulus (skor ≥ ${QUIZ_PASS_SCORE}) untuk sertifikat.</p>
    </div>

    <div class="modal-actions">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button type="button" class="btn btn-primary" onclick="saveCourse('${id||""}')">💾 Simpan</button>
    </div>
  `);

  const list = document.getElementById("materiList");
  if (c && c.materi && c.materi.length) c.materi.forEach(m => addMateriRow(m));
  else addMateriRow();

  const qList = document.getElementById("quizList");
  if (c && c.quiz && c.quiz.length) c.quiz.forEach(q => addQuizRow(q));
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
      <div class="actions"><button type="button" onclick="this.closest('.materi-row').remove(); renumberMateri()">✕</button></div>
    </div>
    <input class="m-judul" placeholder="Judul materi *" value="${esc(data.judul||"")}" />
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input class="m-durasi" type="number" min="1" placeholder="Durasi (menit)" value="${data.durasi||20}" />
      <select class="m-tipe">
        <option value="video" ${data.tipe==="video"?"selected":""}>🎬 Video</option>
        <option value="dokumen" ${data.tipe==="dokumen"?"selected":""}>📄 Dokumen</option>
        <option value="link" ${data.tipe==="link"?"selected":""}>🔗 Lainnya</option>
      </select>
    </div>
    <textarea class="m-deskripsi" rows="2" placeholder="Deskripsi singkat (opsional)">${esc(data.deskripsi||"")}</textarea>
    <input class="m-video" placeholder="🔗 Link YouTube" value="${esc(data.videoUrl||"")}" />
    <input class="m-modul" placeholder="🔗 Link Google Drive" value="${esc(data.modulUrl||"")}" />
  `;
  list.appendChild(row);
};
window.renumberMateri = () => { document.querySelectorAll("#materiList .materi-row .num").forEach((el, i) => el.textContent = i + 1); };

window.addQuizRow = (data = {}) => {
  const list = document.getElementById("quizList");
  if (!list) return;
  const row = document.createElement("div");
  row.className = "materi-row";
  const num = list.children.length + 1;
  const pilihan = data.pilihan || ["", "", "", ""];
  const jawaban = data.jawaban !== undefined ? data.jawaban : 0;
  row.innerHTML = `
    <div class="materi-row-head">
      <span class="num">${num}</span>
      <div class="actions"><button type="button" onclick="this.closest('.materi-row').remove(); renumberQuiz()">✕</button></div>
    </div>
    <input class="q-pertanyaan" placeholder="Pertanyaan *" value="${esc(data.pertanyaan||"")}" />
    ${pilihan.map((p,i)=>`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <input type="radio" name="q${num}_jwb" value="${i}" ${i===jawaban?"checked":""} class="q-jawaban" style="width:auto;flex-shrink:0" />
        <input class="q-opt" data-opt="${i}" placeholder="Pilihan ${String.fromCharCode(65+i)}" value="${esc(p)}" />
      </div>
    `).join("")}
    <small style="font-size:10.5px;color:var(--muted)">Pilih radio button untuk jawaban benar</small>
  `;
  list.appendChild(row);
};
window.renumberQuiz = () => { document.querySelectorAll("#quizList .materi-row").forEach((el, i) => { el.querySelector(".num").textContent = i + 1; }); };

window.delCourse = (id) => {
  openModal(`<div class="confirm-head"><span class="ico">🗑️</span><h3>Hapus Kursus?</h3><p>Tindakan ini tidak bisa dibatalkan.</p></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
    <button class="btn btn-danger" onclick="doDelCourse('${id}')">Ya, Hapus</button></div>`);
};
window.uploadCover = async (input) => {
  const file = input.files[0]; if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  showLoading(true);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    $("#fcCover").value = data.secure_url;
    $("#coverPreview").innerHTML = `<img src="${data.secure_url}" style="width:100%;border-radius:10px;margin-top:8px">`;
    toast("Gambar diupload!", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.saveCourse = async (id) => {
  const judul = document.getElementById("fcJudul").value.trim();
  const deskripsi = document.getElementById("fcDesk").value.trim();
  if (!judul || !deskripsi) return toast("Judul & deskripsi wajib", "error");

  const rows = [...document.querySelectorAll("#materiList .materi-row")];
  const materi = rows.map(row => ({
    judul: row.querySelector(".m-judul").value.trim(),
    durasi: parseInt(row.querySelector(".m-durasi").value) || 20,
    tipe: row.querySelector(".m-tipe").value,
    deskripsi: row.querySelector(".m-deskripsi").value.trim(),
    videoUrl: row.querySelector(".m-video").value.trim(),
    modulUrl: row.querySelector(".m-modul").value.trim()
  })).filter(m => m.judul);
  if (!materi.length) return toast("Minimal 1 materi", "error");

  const qRows = [...document.querySelectorAll("#quizList .materi-row")];
  const quiz = qRows.map(row => {
    const pertanyaan = row.querySelector(".q-pertanyaan").value.trim();
    const opts = [...row.querySelectorAll(".q-opt")].map(el => el.value.trim());
    const jawabanEl = row.querySelector(".q-jawaban:checked");
    const jawaban = jawabanEl ? parseInt(jawabanEl.value) : 0;
    return { pertanyaan, pilihan: opts, jawaban };
  }).filter(q => q.pertanyaan && q.pilihan.filter(Boolean).length >= 2);

  const data = {
    judul, deskripsi,
    kategori: document.getElementById("fcKat").value,
    level: document.getElementById("fcLvl").value,
    jp: parseInt(document.getElementById("fcJP").value) || 6,
    ikon: document.getElementById("fcIkon").value || "📘",
    instruktur: document.getElementById("fcInstruktur").value.trim() || "Bapperida",
    cover: document.getElementById("fcCover")?.value || "",
    materi, quiz,
    updatedAt: serverTimestamp()
  };

  showLoading(true);
  try {
    if (id) await updateDoc(doc(db, "courses", id), data);
    else { data.createdAt = serverTimestamp(); await addDoc(collection(db, "courses"), data); }
    await loadCourses();
    closeModal(); navigate("admin-kursus");
    toast(id ? "✅ Kursus diperbarui!" : "✅ Kursus ditambahkan!", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.doDelCourse = async (id) => {
  showLoading(true);
  try {
    await deleteDoc(doc(db, "courses", id));
    await loadCourses();
    closeModal(); navigate("admin-kursus");
    toast("Kursus dihapus", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

function viewAdminPengguna(){
  const canManage = isSuperAdmin();
  return `
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr>
          <th>Nama</th><th>Email</th><th>NIP</th><th>OPD</th><th>Role</th>
          ${canManage ? "<th>Password</th>" : ""}
          <th>Login</th>
          ${canManage ? "<th>Aksi</th>" : ""}
        </tr></thead>
        <tbody>${allUsers.length ? allUsers.map(u=>{
          const sa = SUPER_ADMIN_EMAILS.map(e=>e.toLowerCase()).includes((u.email||"").toLowerCase());
          const tag = sa ? '<span class="tag tag-super">👑 Super Admin</span>'
            : u.role==="admin" ? '<span class="tag tag-gold">Admin</span>'
            : '<span class="tag tag-blue">Peserta</span>';
          const pwdCell = canManage ? `<td>${u.pwd ? `<span class="pwd-cell" onclick="showPwd('${u.id}')">👁️ <span class="pwd-hidden">••••••</span></span>` : '<span style="color:var(--muted);font-size:11px">—</span>'}</td>` : "";
          const aksiCell = canManage ? `<td>
            <button class="btn btn-ghost btn-sm" onclick="openEditUser('${u.id}')">✏️</button>
            ${!sa ? `<button class="btn btn-danger btn-sm" onclick="delUser('${u.id}')">🗑️</button>` : ""}
          </td>` : "";
          return `<tr>
            <td><b>${esc(u.nama||"-")}</b></td>
            <td>${esc(u.email||"-")}</td>
            <td>${esc(u.nip||"-")}</td>
            <td>${esc(u.opd||"-")}</td>
            <td>${tag}</td>
            ${pwdCell}
            <td>${fmtDate(u.lastLogin)}</td>
            ${aksiCell}
          </tr>`;
        }).join("") : `<tr><td colspan="${canManage?8:6}" style="text-align:center;padding:30px;color:var(--muted)">Belum ada pengguna</td></tr>`}</tbody>
      </table>
    </div>`;
}

window.showPwd = (uid) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  openModal(`
    <div class="confirm-head"><span class="ico">🔑</span><h3>Password Pengguna</h3><p>Password tersimpan dari registrasi email/password.</p></div>
    <div class="field"><label>Nama</label><input value="${esc(u.nama||"")}" readonly /></div>
    <div class="field"><label>Email</label><input value="${esc(u.email||"")}" readonly /></div>
    <div class="field"><label>Password</label><input value="${esc(u.pwd||"(tidak tersedia — login via Google)")}" readonly style="font-family:monospace;font-size:16px;text-align:center" /></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Tutup</button>
      <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${esc(u.pwd||"")}');toast('✓ Dicopy','success')">📋 Copy</button>
    </div>
  `);
};

window.openEditUser = (uid) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  openModal(`
    <h3>✏️ Edit Pengguna</h3>
    <div class="field"><label>Nama</label><input id="euNama" value="${esc(u.nama||"")}" /></div>
    <div class="field"><label>NIP</label><input id="euNip" value="${esc(u.nip||"")}" /></div>
    <div class="field"><label>OPD</label><input id="euOpd" value="${esc(u.opd||"")}" /></div>
    <div class="field"><label>Telepon</label><input id="euTel" value="${esc(u.telepon||"")}" /></div>
    <div class="field"><label>Role</label>
      <select id="euRole">
        <option value="user" ${u.role==="user"?"selected":""}>Peserta</option>
        <option value="admin" ${u.role==="admin"?"selected":""}>Admin</option>
      </select>
    </div>
    <div class="field"><label>Password (kosongkan jika tidak diubah)</label><input id="euPwd" placeholder="Password baru" /></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveEditUser('${uid}')">💾 Simpan</button>
    </div>
  `);
};
window.saveEditUser = async (uid) => {
  if (!isSuperAdmin()) return;
  const data = {
    nama: document.getElementById("euNama").value.trim(),
    nip: document.getElementById("euNip").value.trim(),
    opd: document.getElementById("euOpd").value.trim(),
    telepon: document.getElementById("euTel").value.trim(),
    role: document.getElementById("euRole").value
  };
  const newPwd = document.getElementById("euPwd").value.trim();
  if (newPwd) data.pwd = newPwd;
  showLoading(true);
  try {
    await updateDoc(doc(db, "users", uid), data);
    await loadAllUsers();
    closeModal();
    toast("✓ Data pengguna diperbarui", "success");
    if (currentView === "admin-pengguna") navigate("admin-pengguna");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.delUser = (uid) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  openModal(`
    <div class="confirm-head"><span class="ico">⚠️</span><h3>Hapus Pengguna?</h3>
    <p>Pengguna <b>${esc(u.nama)}</b> (${esc(u.email)}) akan dihapus dari Firestore.</p></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-danger" onclick="confirmDelUser('${uid}')">Ya, Hapus</button>
    </div>
  `);
};
window.confirmDelUser = async (uid) => {
  showLoading(true);
  try {
    await deleteDoc(doc(db, "users", uid));
    await loadAllUsers();
    closeModal(); navigate("admin-pengguna");
    toast("Pengguna dihapus", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

/* =========================================================
   KELOLA ADMIN
   ========================================================= */
function viewKelolaAdmin(){
  if (!isSuperAdmin()) return '<div class="empty"><div class="ico">🔒</div><h4>Akses Terbatas</h4></div>';
  const admins = allUsers.filter(u => u.role === "admin" || SUPER_ADMIN_EMAILS.map(e=>e.toLowerCase()).includes((u.email||"").toLowerCase()));
  const peserta = allUsers.filter(u => u.role === "user" && !SUPER_ADMIN_EMAILS.map(e=>e.toLowerCase()).includes((u.email||"").toLowerCase()));

  const renderRow = (u) => {
    const sa = SUPER_ADMIN_EMAILS.map(e=>e.toLowerCase()).includes((u.email||"").toLowerCase());
    const tag = sa ? '<span class="tag tag-super">👑 Super Admin</span>'
      : u.role === "admin" ? '<span class="tag tag-gold">Admin</span>'
      : '<span class="tag tag-blue">Peserta</span>';
    const act = sa ? '<span style="font-size:11px;color:var(--muted)">—</span>'
      : u.role === "admin" ? `<button class="btn btn-danger btn-sm" onclick="demoteUser('${u.id}','${esc(u.email)}')">⬇ Turunkan</button>`
      : `<button class="btn btn-primary btn-sm" onclick="promoteUser('${u.id}','${esc(u.email)}')">⬆ Jadikan Admin</button>`;
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:34px;height:34px;font-size:12px">${u.foto?`<img src="${u.foto}">`:initial(u.nama||"?")}</div>
        <b>${esc(u.nama||"-")}</b>
      </div></td>
      <td>${esc(u.email||"-")}</td>
      <td>${esc(u.opd||"-")}</td>
      <td>${tag}</td>
      <td>${act}</td>
    </tr>`;
  };

  return `
    <div class="sa-panel">
      <div class="sa-title">👑 Panel Super Admin</div>
      <div class="sa-desc">Kelola role admin & peserta.</div>
    </div>
    <div class="section-title">🛡️ Admin & Super Admin <small>${admins.length} akun</small></div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table><thead><tr><th>Nama</th><th>Email</th><th>OPD</th><th>Role</th><th>Aksi</th></tr></thead>
        <tbody>${admins.map(renderRow).join("") || '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--muted)">Belum ada admin</td></tr>'}</tbody>
      </table>
    </div>
    <div class="section-title">👤 Peserta <small>${peserta.length} akun</small></div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table><thead><tr><th>Nama</th><th>Email</th><th>OPD</th><th>Role</th><th>Aksi</th></tr></thead>
        <tbody>${peserta.map(renderRow).join("") || '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--muted)">Belum ada peserta</td></tr>'}</tbody>
      </table>
    </div>
  `;
}
window.promoteUser = (uid, email) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  openModal(`<div class="confirm-head"><span class="ico">⬆</span><h3>Jadikan Admin?</h3><p>User <b>${esc(email)}</b> akan mendapat akses admin.</p></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
    <button class="btn btn-primary" onclick="doSetRole('${uid}','admin')">Ya, Angkat</button></div>`);
};
window.demoteUser = (uid, email) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  openModal(`<div class="confirm-head"><span class="ico">⬇</span><h3>Turunkan Jadi Peserta?</h3><p>Admin <b>${esc(email)}</b> akan kehilangan akses admin.</p></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
    <button class="btn btn-danger" onclick="doSetRole('${uid}','user')">Ya, Turunkan</button></div>`);
};
window.doSetRole = async (uid, newRole) => {
  if (!isSuperAdmin()) return;
  showLoading(true);
  try {
    await updateDoc(doc(db, "users", uid), { role: newRole, roleUpdatedAt: serverTimestamp() });
    await loadAllUsers();
    closeModal(); navigate("admin-kelola");
    toast(`✓ Role diubah menjadi ${newRole}`, "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

/* =========================================================
   DESAIN SERTIFIKAT (Admin)
   ========================================================= */
function viewAdminSertifikat(){
  if (!isAdminOrAbove(currentUser.role)) return '<div class="empty"><div class="ico">🔒</div><h4>Akses Terbatas</h4></div>';
  const hasBg = !!certificateSettings.backgroundUrl;
  return `
    <div class="card" style="background:linear-gradient(135deg,var(--navy-800),var(--blue-600));color:#fff;margin-bottom:18px;padding:24px">
      <div style="font-size:32px;margin-bottom:6px">🏅</div>
      <b style="font-size:17px">Desain Sertifikat Pelatihan</b>
      <p style="font-size:13px;opacity:.9;margin-top:6px;line-height:1.6">
        Upload gambar background yang akan dipakai di semua sertifikat peserta.
      </p>
    </div>
    <div class="section-title">🖼️ Background Saat Ini</div>
    <div class="card">
      <div class="cert-preview ${hasBg?"":"no-bg"}">
        ${hasBg ? `<div style="position:absolute;inset:0;background-image:url('${esc(certificateSettings.backgroundUrl)}');background-size:cover;background-position:center;opacity:0.85"></div>` : ""}
        <div class="overlay-text">
          <h1>PALOPO INOVATIF</h1>
          <div class="sub">SERTIFIKAT KELULUSAN</div>
          <p>Diberikan kepada:</p>
          <div class="name">Nama Peserta</div>
          <p>Telah menyelesaikan kursus pelatihan mandiri<br>Bapperida Kota Palopo</p>
        </div>
        ${!hasBg ? '<div style="position:absolute;bottom:12px;left:0;right:0;text-align:center;font-size:11px;color:var(--muted)">⚠️ Belum ada background — menggunakan default</div>' : ''}
      </div>
      ${hasBg ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
        <span class="tag tag-green">✓ Background Aktif</span>
        <span style="font-size:11.5px;color:var(--muted);align-self:center">
          Diperbarui: ${certificateSettings.updatedAt ? fmtDateTime(certificateSettings.updatedAt) : "-"}
          ${certificateSettings.updatedBy ? `oleh ${esc(certificateSettings.updatedBy)}` : ""}
        </span>
      </div>` : ""}
    </div>
    <div class="section-title">⬆️ Upload Background Baru</div>
    <div class="card">
      <div class="cert-upload-box" onclick="document.getElementById('certBgFile').click()">
        <div class="ico">🖼️</div>
        <b>Klik untuk Upload Gambar</b>
        <p>Format JPG/PNG • A4 Landscape (1.414 : 1) • Maks 5MB</p>
        <input type="file" id="certBgFile" accept="image/*" style="display:none" onchange="uploadCertBg(this)" />
      </div>
      <div class="cert-info-box">
        <b>💡 Tips Desain:</b><br>
        • Resolusi minimal <b>2480 × 1754 px</b> (A4 landscape 300 DPI)<br>
        • Sertakan area kosong di tengah untuk nama peserta<br>
        • Hindari elemen penting di tepi (bisa terpotong saat print)
      </div>
      ${hasBg ? `<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-danger btn-sm" onclick="removeCertBg()">🗑️ Hapus Background</button>
        <button class="btn btn-ghost btn-sm" onclick="printCertPreview()">👁️ Preview Sertifikat Asli</button>
      </div>` : ""}
    </div>
  `;
}
window.uploadCertBg = async (input) => {
  if (!isAdminOrAbove(currentUser.role)) return toast("Akses terbatas", "error");
  const file = input.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast("Maks 5MB", "error");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", "palopo-inovatif/certificates");
  showLoading(true);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    await setDoc(doc(db, "settings", "certificate"), {
      backgroundUrl: data.secure_url,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.nama
    }, { merge: true });
    certificateSettings.backgroundUrl = data.secure_url;
    certificateSettings.updatedAt = { seconds: Date.now()/1000 };
    certificateSettings.updatedBy = currentUser.nama;
    toast("✓ Background berhasil diupload!", "success");
    navigate("admin-sertifikat");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); input.value = ""; }
};
window.removeCertBg = () => {
  if (!isAdminOrAbove(currentUser.role)) return;
  openModal(`<div class="confirm-head"><span class="ico">🗑️</span><h3>Hapus Background?</h3><p>Sertifikat kembali ke default (warna emas).</p></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
    <button class="btn btn-danger" onclick="confirmRemoveCertBg()">Ya, Hapus</button></div>`);
};
window.confirmRemoveCertBg = async () => {
  showLoading(true);
  try {
    await setDoc(doc(db, "settings", "certificate"), { backgroundUrl: "", updatedAt: serverTimestamp(), updatedBy: currentUser.nama }, { merge: true });
    certificateSettings.backgroundUrl = "";
    closeModal();
    toast("✓ Background dihapus", "success");
    navigate("admin-sertifikat");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.printCertPreview = () => {
  if (!isAdminOrAbove(currentUser.role)) return;
  const bgUrl = certificateSettings.backgroundUrl || "";
  const bgStyle = bgUrl ? `background-image:url('${bgUrl}');background-size:cover;background-position:center;` : `background:linear-gradient(135deg,#fffbeb,#fef3c7);`;
  const w = window.open("", "", "width=1100,height=800");
  w.document.write(`
    <html><head><title>Preview Sertifikat</title>
    <style>
      @page{size:A4 landscape;margin:0}
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;padding:20px}
      .cert{width:297mm;height:210mm;max-width:100%;${bgStyle}display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.15);overflow:hidden}
      .cert-inner{text-align:center;padding:40px 60px;max-width:80%;position:relative;z-index:2}
      h1{color:#132c4f;font-size:42px;letter-spacing:3px;margin:0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      .sub{color:#f59e0b;letter-spacing:8px;font-size:13px;margin:8px 0 26px;font-weight:700;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      h2{font-size:26px;color:#2563eb;margin:18px 0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      .name{font-size:34px;color:#132c4f;font-weight:700;border-bottom:3px solid #f59e0b;display:inline-block;padding:0 24px 10px;margin:18px 0;text-shadow:0 2px 8px rgba(255,255,255,.7)}
      p{font-size:15px;color:#475569;line-height:1.8;margin:14px 0;text-shadow:0 1px 6px rgba(255,255,255,.8)}
      .foot{margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#64748b;text-shadow:0 1px 6px rgba(255,255,255,.8)}
      .preview-badge{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px}
    </style></head><body>
    <div class="preview-badge">📋 PREVIEW — BUKAN SERTIFIKAT ASLI</div>
    <div class="cert"><div class="cert-inner">
      <h1>PALOPO INOVATIF</h1>
      <div class="sub">SERTIFIKAT KELULUSAN</div>
      <p>Diberikan kepada:</p>
      <div class="name">Nama Peserta Contoh</div>
      <p>Telah menyelesaikan kursus pelatihan mandiri:</p>
      <h2>Contoh Judul Kursus Pelatihan</h2>
      <p>Dengan beban 8 Jam Pelajaran (JP) kategori Inovasi tingkat Menengah.<br>
      Skor kuis akhir: <b>85/100</b>.<br>
      Diselenggarakan oleh Bidang Riset dan Inovasi Daerah<br>Bapperida Kota Palopo.</p>
      <div class="foot"><div>No: PI/PREVIEW/${new Date().getFullYear()}</div><div>Palopo, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div></div>
    </div></div>
    </body></html>
  `);
  w.document.close();
};

/* =========================================================
   NOTIFIKASI
   ========================================================= */
function viewNotifikasi(){
  if (!isAdminOrAbove(currentUser.role)) return '<div class="empty">Akses terbatas</div>';
  return `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
      <button class="btn btn-ghost btn-sm" onclick="markAllNotifRead()">✓ Tandai Semua Dibaca</button>
      <button class="btn btn-danger btn-sm" onclick="clearAllNotif()">🗑️ Hapus Semua</button>
    </div>
    ${notifications.length ? notifications.map(n => `
      <div class="notif-item ${n.read?"":"unread"}">
        <div class="ic">${n.type === "user_baru" ? "👤" : n.type === "ulasan_baru" ? "💬" : "🎓"}</div>
        <div class="body">
          <b>${esc(n.title)}</b>
          <p>${esc(n.message)}</p>
          <span>📅 ${fmtDateTime(n.createdAt)}</span>
        </div>
      </div>
    `).join("") : '<div class="empty"><div class="ico">🔔</div><h4>Belum ada notifikasi</h4></div>'}
  `;
}
window.markAllNotifRead = async () => {
  showLoading(true);
  try {
    for (const n of notifications.filter(n => !n.read)) await updateDoc(doc(db, "notifications", n.id), { read: true });
    toast("✓ Ditandai sudah dibaca", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};
window.clearAllNotif = async () => {
  if (!confirm("Hapus semua notifikasi?")) return;
  showLoading(true);
  try {
    for (const n of notifications) await deleteDoc(doc(db, "notifications", n.id));
    toast("✓ Dihapus", "success");
  } catch (e) { toast("Gagal: " + e.message, "error"); }
  finally { showLoading(false); }
};

/* =========================================================
   LAPORAN + EXPORT/IMPORT
   ========================================================= */
function viewAdminLaporan(){
  const totalReviews = Object.values(reviewsCache).reduce((s,l)=>s+l.length,0);
  const avgAll = totalReviews ? (Object.values(reviewsCache).flat().reduce((s,r)=>s+r.rating,0) / totalReviews).toFixed(1) : "0.0";
  return `
    <div class="grid grid-3">
      <div class="card stat-card"><div class="ic ic-blue">📚</div><div><div class="num">${courses.length}</div><div class="lbl">Kursus</div></div></div>
      <div class="card stat-card"><div class="ic ic-gold">💬</div><div><div class="num">${totalReviews}</div><div class="lbl">Ulasan</div></div></div>
      <div class="card stat-card"><div class="ic ic-green">⭐</div><div><div class="num">${avgAll}</div><div class="lbl">Rating Rata-rata</div></div></div>
    </div>
    <div class="section-title">📥 Export & Import</div>
    <div class="io-panel">
      <button class="btn btn-primary" onclick="exportUsersExcel()">📊 Export Pengguna</button>
      <button class="btn btn-success" onclick="exportCoursesExcel()">📚 Export Kursus</button>
      <button class="btn btn-ghost" onclick="window.print()">🖨️ Cetak / PDF</button>
    </div>
    ${isSuperAdmin() ? `
      <div class="io-panel">
        <input type="file" id="importUsersFile" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleImportUsers(event)" />
        <button class="btn btn-gold" onclick="document.getElementById('importUsersFile').click()">📤 Import Pengguna</button>
        <button class="btn btn-ghost btn-sm" onclick="showTemplateInfo()">📋 Format Excel</button>
      </div>` : ""}
    <div class="section-title">📊 Rating per Kursus</div>
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Kursus</th><th>Kategori</th><th>Rating</th><th>Ulasan</th></tr></thead>
        <tbody>${courses.length ? courses.map(c=>`<tr>
          <td><b>${esc(c.judul)}</b></td>
          <td><span class="tag tag-blue">${esc(c.kategori)}</span></td>
          <td>${starsHTML(avgRating(c.id),14)} <small style="color:var(--muted)">${avgRating(c.id)?avgRating(c.id).toFixed(1):"-"}</small></td>
          <td>${reviewCount(c.id)}</td>
        </tr>`).join("") : '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--muted)">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>`;
}
window.exportUsersExcel = () => {
  if (typeof XLSX === "undefined") return toast("Library Excel belum load", "error");
  const data = allUsers.map(u => ({ Nama: u.nama||"", Email: u.email||"", NIP: u.nip||"", OPD: u.opd||"", Telepon: u.telepon||"", Role: u.role||"user", "Login Terakhir": fmtDate(u.lastLogin) }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pengguna");
  XLSX.writeFile(wb, `pengguna-palopo-inovatif-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast("✓ Excel diunduh", "success");
};
window.exportCoursesExcel = () => {
  if (typeof XLSX === "undefined") return toast("Library Excel belum load", "error");
  const data = courses.map(c => ({ Judul: c.judul||"", Kategori: c.kategori||"", Level: c.level||"", JP: c.jp||0, Instruktur: c.instruktur||"", "Jumlah Materi": (c.materi||[]).length, "Jumlah Kuis": (c.quiz||[]).length, Rating: avgRating(c.id).toFixed(1), "Jumlah Ulasan": reviewCount(c.id) }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kursus");
  XLSX.writeFile(wb, `kursus-palopo-inovatif-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast("✓ Excel diunduh", "success");
};
window.showTemplateInfo = () => {
  openModal(`
    <h3>📋 Format Excel Import</h3>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:14px">Kolom di baris pertama:</p>
    <div style="background:#f8fafc;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;margin-bottom:14px">Nama | Email | NIP | OPD | Telepon | Role</div>
    <div style="background:#fef3c7;padding:12px;border-radius:8px;font-size:12.5px;color:#92400e;line-height:1.6">
      <b>Catatan:</b><br>
      • Role: <b>user</b> atau <b>admin</b><br>
      • Password default: <b>palopo2025</b><br>
      • Import hanya ke Firestore (bukan Authentication)
    </div>
    <div class="modal-actions"><button class="btn btn-primary" onclick="closeModal()">Mengerti</button></div>
  `);
};
window.handleImportUsers = async (event) => {
  if (!isSuperAdmin()) return toast("Hanya Super Admin", "error");
  const file = event.target.files[0];
  if (!file) return;
  showLoading(true);
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    if (!rows.length) throw new Error("File kosong");
    let ok = 0, skip = 0;
    for (const r of rows) {
      const email = String(r.Email || r.email || "").trim().toLowerCase();
      if (!email) { skip++; continue; }
      if (allUsers.some(u => (u.email||"").toLowerCase() === email)) { skip++; continue; }
      await addDoc(collection(db, "users"), {
        nama: String(r.Nama || r.nama || "").trim(),
        email,
        nip: String(r.NIP || r.nip || "").trim(),
        opd: String(r.OPD || r.opd || "").trim(),
        telepon: String(r.Telepon || r.telepon || "").trim(),
        role: (String(r.Role || r.role || "user").toLowerCase() === "admin") ? "admin" : "user",
        foto: "", pwd: "palopo2025",
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      ok++;
    }
    await loadAllUsers();
    toast(`✓ Berhasil import ${ok} data${skip?` (${skip} dilewati)`:""}`, "success");
    navigate("admin-laporan");
  } catch (e) { toast("Gagal import: " + e.message, "error"); }
  finally { showLoading(false); event.target.value = ""; }
};

/* =========================================================
   EXPOSE KE WINDOW
   ========================================================= */
window.closeModal    = closeModal;
window.openModal     = openModal;
window.toggleSidebar = toggleSidebar;
window.showLoading   = showLoading;

/* =========================================================
   BOOT — ditangani onAuthStateChanged
   ========================================================= */