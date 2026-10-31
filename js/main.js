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
  // repeat band text so the scrolling loop is seamless
  document.querySelectorAll(".band-track").forEach(el => { el.innerHTML = el.innerHTML.repeat(4); });
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

/* ---------- Rotating "currently into" word ---------- */
const rotateEl = document.getElementById("rotateWord");
let rotIdx = 0;
function rotateWords() {
  return (translations[document.documentElement.lang] || translations.en)["hero.rotate"].split("|");
}
function nextWord() {
  const words = rotateWords();
  rotateEl.classList.remove("in");
  setTimeout(() => {
    rotIdx = (rotIdx + 1) % words.length;
    rotateEl.textContent = words[rotIdx];
    rotateEl.classList.add("in");
  }, 250);
}
rotateEl.textContent = rotateWords()[0];
rotateEl.classList.add("in");
setInterval(nextWord, 2600);
document.querySelectorAll(".lang-switch button").forEach(b =>
  b.addEventListener("click", () => { rotateEl.textContent = rotateWords()[rotIdx % rotateWords().length]; }));

/* ---------- Typed code window ---------- */
const code = [
  ["k", "class "], ["c", "Aya"], ["p", "("], ["c", "Engineer"], ["p", "):\n"],
  ["", "    school = "], ["s", "\"ENSTAB\""], ["", "\n"],
  ["", "    graduating = "], ["n", "2027"], ["", "\n"],
  ["", "    focus = ["], ["s", "\"AI\""], ["", ", "], ["s", "\"Data\""], ["", ", "], ["s", "\"Agentic AI\""], ["", "]\n"],
  ["", "    stack = ["], ["s", "\"Python\""], ["", ", "], ["s", "\"PyTorch\""], ["", ", "], ["s", "\"LLMs\""], ["", "]\n\n"],
  ["k", "    def "], ["f", "solve"], ["p", "("], ["", "self, problem"], ["p", "):\n"],
  ["", "        data = self."], ["f", "clean"], ["p", "("], ["", "problem.data"], ["p", ")\n"],
  ["", "        model = self."], ["f", "train"], ["p", "("], ["", "data"], ["p", ")\n"],
  ["k", "        return "], ["", "self."], ["f", "automate"], ["p", "("], ["", "model"], ["p", ")"], ["m", "  # ✦"]
];
const codeEl = document.getElementById("codeType");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
function typeCode() {
  let part = 0, ch = 0, span = null;
  (function tick() {
    if (part >= code.length) return;
    const [cls, txt] = code[part];
    if (!span) { span = document.createElement("span"); if (cls) span.className = "t-" + cls; codeEl.appendChild(span); }
    span.textContent += txt[ch++];
    if (ch >= txt.length) { part++; ch = 0; span = null; }
    setTimeout(tick, txt[ch - 1] === "\n" ? 120 : 22);
  })();
}
if (reduced) code.forEach(([cls, txt]) => { const s = document.createElement("span"); if (cls) s.className = "t-" + cls; s.textContent = txt; codeEl.appendChild(s); });
else setTimeout(typeCode, 500);

/* ---------- Counters ---------- */
const countIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, to = +el.dataset.to; let n = 0;
  const t = setInterval(() => { el.textContent = ++n; if (n >= to) clearInterval(t); }, 220);
  countIO.unobserve(el);
}), { threshold: 0.5 });
document.querySelectorAll(".count").forEach(el => countIO.observe(el));

/* ---------- Scroll progress, active link, back-to-top ---------- */
const progress = document.getElementById("progress");
const toTop = document.getElementById("toTop");
const sections = [...document.querySelectorAll("main section")];
const links = [...document.querySelectorAll(".nav-links a")];
function onScroll() {
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
  toTop.classList.toggle("show", h.scrollTop > 600);
  let current = sections[0].id;
  sections.forEach(s => { if (s.getBoundingClientRect().top < 120) current = s.id; });
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
