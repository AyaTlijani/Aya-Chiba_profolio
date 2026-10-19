// Put her GitHub username here when she has one, e.g. "ayachiba".
// While it's empty, every GitHub link on the page stays hidden.
const GITHUB_USER = "";

// Screenshot galleries for the "View screenshots" buttons
const galleries = {
  recruitai: [5, 1, 2, 3, 4].map(n => `assets/img/projects/recruitai-${n}.jpg`),
  matchmuse: [1, 2, 3, 4].map(n => `assets/img/projects/matchmuse-${n}.jpg`)
};

/* ---------- Language ---------- */
function setLang(lang) {
  const dict = translations[lang] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = dict[el.dataset.i18n];
    if (val !== undefined) el.innerHTML = val;
  });
  document.documentElement.lang = lang;
  document.title = dict["meta.title"];
  document.querySelectorAll(".lang-switch button").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === lang));
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

document.querySelectorAll(".lang-switch button").forEach(b =>
  b.addEventListener("click", () => setLang(b.dataset.lang)));

let savedLang = null;
try { savedLang = localStorage.getItem("lang"); } catch (e) {}
setLang(savedLang || ((navigator.language || "en").startsWith("fr") ? "fr" : "en"));

/* ---------- Theme ---------- */
document.getElementById("themeToggle").addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* ---------- Mobile menu ---------- */
const navLinks = document.getElementById("navLinks");
document.getElementById("menuToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

/* ---------- CV dropdown ---------- */
const cvMenu = document.getElementById("cvMenu");
document.getElementById("cvToggle").addEventListener("click", e => {
  e.stopPropagation();
  cvMenu.classList.toggle("open");
});
document.addEventListener("click", () => cvMenu.classList.remove("open"));

/* ---------- GitHub links ---------- */
document.querySelectorAll("[data-github]").forEach(el => {
  if (!GITHUB_USER) { el.style.display = "none"; return; }
  el.href = "https://github.com/" + GITHUB_USER;
});
document.querySelectorAll(".gh-user").forEach(el => el.textContent = GITHUB_USER);

/* ---------- Image viewer ---------- */
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vCount = document.getElementById("vCount");
let current = [], idx = 0;

function show() {
  vImg.src = current[idx];
  vCount.textContent = (idx + 1) + " / " + current.length;
}
function openViewer(name) {
  current = galleries[name]; idx = 0; show();
  viewer.classList.add("open");
  viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeViewer() {
  viewer.classList.remove("open");
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function step(d) { idx = (idx + d + current.length) % current.length; show(); }

document.querySelectorAll("[data-gallery]").forEach(b =>
  b.addEventListener("click", () => openViewer(b.dataset.gallery)));
document.getElementById("vClose").addEventListener("click", closeViewer);
document.getElementById("vPrev").addEventListener("click", () => step(-1));
document.getElementById("vNext").addEventListener("click", () => step(1));
viewer.addEventListener("click", e => { if (e.target === viewer) closeViewer(); });
document.addEventListener("keydown", e => {
  if (!viewer.classList.contains("open")) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

/* ---------- Fade-in on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".fade").forEach(el => io.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
