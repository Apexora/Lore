// Escritos de la comunidad: Firestore (mismo proyecto que el Portal) + recompensa en Sinfalita.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, getDoc, query, orderBy, limit,
  getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyAsw466_wzsiLtbjw6FXZ1_O3HQ_AkVyU8",
  authDomain: "album-apexora.firebaseapp.com",
  projectId: "album-apexora",
  appId: "1:17231648284:web:20edb8477453f50473f1d9"
});
// App por defecto con la misma config que el Portal: así la sesión iniciada allá se comparte (IndexedDB, misma clave).
const auth = getAuth(app);
const db = getFirestore(app);

const COL = "apexora_lore_escritos";
const DOMINIO = "@apexora-sala.app";
const MIN = 280, MAX = 8000, POR_CARACTERES = 20, TOPE = 60;
const TIPOS = { historia: "Historia", sesion: "Sesión", personaje: "Personaje", lugar: "Lugar", teoria: "Teoría", otro: "Otro" };

const $ = (id) => document.getElementById(id);
const form = $("w-form"), gate = $("w-gate"), listEl = $("w-list");
const fTitle = $("w-title"), fType = $("w-type"), fText = $("w-text");
let user = null, items = [], filtro = "todos", loaded = false;

$("w-login").href = "https://apexora.github.io/Portal/?volver=" + encodeURIComponent(location.href);

const premio = (n) => (n < MIN ? 0 : Math.min(TOPE, Math.floor(n / POR_CARACTERES)));

/* ---------- Borrador local ---------- */
const DK = "apx-lore-borrador";
try {
  const d = JSON.parse(localStorage.getItem(DK) || "null");
  if (d) { fTitle.value = d.t || ""; fType.value = d.k || "historia"; fText.value = d.x || ""; }
} catch {}
const guardarBorrador = () => {
  try { localStorage.setItem(DK, JSON.stringify({ t: fTitle.value, k: fType.value, x: fText.value })); } catch {}
};
function actualizar() {
  const n = fText.value.trim().length, p = premio(n);
  $("w-count").textContent = `${n} / ${MAX}`;
  $("w-reward").textContent = p ? `Ganarás +${p} Sinfalita` : `Faltan ${Math.max(0, MIN - n)} caracteres para ganar Sinfalita`;
  $("w-reward").classList.toggle("is-ready", p > 0);
}
[fTitle, fType, fText].forEach((el) => el.addEventListener("input", () => { actualizar(); guardarBorrador(); }));
actualizar();

/* ---------- Sesión ---------- */
onAuthStateChanged(auth, (u) => {
  user = u?.email?.endsWith(DOMINIO) ? u : null;
  form.hidden = !user;
  gate.hidden = !!user;
  document.querySelector(".w-chip--mine").hidden = !user;
  pintar();
});

/* ---------- Lectura ---------- */
const fecha = (ts) => {
  const d = ts?.toDate?.(); if (!d) return "recién";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
};
const minutos = (t) => Math.max(1, Math.round(t.split(/\s+/).length / 200));

async function cargar() {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy("creado", "desc"), limit(60)));
    items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    loaded = true;
    pintar();
  } catch (e) {
    console.warn("escritos:", e);
    const denied = e?.code === "permission-denied";
    listEl.replaceChildren(msg(denied
      ? "Todavía no se pueden leer los escritos: falta habilitar la colección en las reglas de Firestore (mirá el README) o iniciar sesión."
      : "No se pudieron cargar los escritos. Probá de nuevo en un rato."));
  }
}
const msg = (t) => { const p = document.createElement("p"); p.className = "hint"; p.textContent = t; return p; };

function tarjeta(it) {
  const art = document.createElement("article");
  art.className = "w-card";
  const tag = document.createElement("span"); tag.className = "sc-tag"; tag.textContent = TIPOS[it.tipo] || "Otro";
  const h = document.createElement("h3"); h.textContent = it.titulo;
  const by = document.createElement("p"); by.className = "w-by";
  by.textContent = `por ${it.autor || "anónimo"} · ${fecha(it.creado)} · ⏱ ${minutos(it.texto || "")} min`;
  const body = document.createElement("div"); body.className = "w-body";
  const parrafos = String(it.texto || "").split(/\n{2,}/);
  parrafos.forEach((t) => { const p = document.createElement("p"); p.textContent = t; body.appendChild(p); });
  const largo = it.texto.length > 380;
  if (largo) body.classList.add("is-clamped");
  art.append(tag, h, by, body);
  const row = document.createElement("div"); row.className = "w-row";
  if (largo) {
    const b = document.createElement("button"); b.type = "button"; b.className = "w-link"; b.textContent = "Seguir leyendo →";
    b.addEventListener("click", () => { const o = body.classList.toggle("is-clamped"); b.textContent = o ? "Seguir leyendo →" : "Cerrar"; });
    row.appendChild(b);
  }
  if (user && it.uid === user.uid) {
    const x = document.createElement("button"); x.type = "button"; x.className = "w-link w-del"; x.textContent = "Borrar";
    x.addEventListener("click", async () => {
      if (!confirm("¿Borrar este escrito? No se puede deshacer (la Sinfalita ya ganada se queda).")) return;
      try { await deleteDoc(doc(db, COL, it.id)); items = items.filter((y) => y.id !== it.id); pintar(); }
      catch { alert("No se pudo borrar. Probá de nuevo."); }
    });
    row.appendChild(x);
  }
  art.appendChild(row);
  return art;
}

function pintar() {
  if (!loaded) return;
  const vis = items.filter((i) => filtro === "todos" || (filtro === "mios" ? user && i.uid === user.uid : i.tipo === filtro));
  if (!vis.length) {
    const p = msg(items.length ? "No hay escritos de este tipo todavía." : "Todavía no hay escritos. La primera historia puede ser la tuya.");
    listEl.replaceChildren(p); return;
  }
  listEl.replaceChildren(...vis.map(tarjeta));
}

$("w-filters").addEventListener("click", (e) => {
  const b = e.target.closest(".w-chip"); if (!b) return;
  filtro = b.dataset.f;
  document.querySelectorAll(".w-chip").forEach((c) => { const on = c === b; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on); });
  pintar();
});

/* ---------- Publicar ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!user) return;
  const titulo = fTitle.value.trim(), texto = fText.value.trim(), tipo = fType.value;
  if (!titulo || texto.length < 40) { $("w-status").textContent = "Escribí un título y un texto un poco más largo."; return; }
  const btn = $("w-submit"); btn.disabled = true; $("w-status").textContent = "Publicando…";
  try {
    let autor = user.email.split("@")[0];
    try { const p = await getDoc(doc(db, "apexora_profiles", user.uid)); if (p.exists() && p.data().name) autor = p.data().name; } catch {}
    const data = { uid: user.uid, autor, titulo, tipo, texto, chars: texto.length, creado: serverTimestamp() };
    const ref = await addDoc(collection(db, COL), data);
    items.unshift({ id: ref.id, ...data, creado: { toDate: () => new Date() } });
    let ganado = 0;
    const p = premio(texto.length);
    if (p) {
      try {
        const core = await import("https://apexora.github.io/Portal/apexora-core.js");
        ganado = (await core.premiar(p, 0)).comun;
      } catch (err) { console.warn("premio:", err); }
    }
    fTitle.value = ""; fText.value = ""; actualizar();
    try { localStorage.removeItem(DK); } catch {}
    $("w-status").textContent = ganado ? `¡Publicado! +${ganado} Sinfalita.` : p ? "¡Publicado! (llegaste al tope diario de Sinfalita)" : "¡Publicado!";
    filtro = "todos"; document.querySelectorAll(".w-chip").forEach((c) => { const on = c.dataset.f === "todos"; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on); });
    pintar();
    $("biblioteca").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.warn("publicar:", err);
    $("w-status").textContent = err?.code === "permission-denied"
      ? "Todavía no está habilitado publicar (faltan las reglas de Firestore). Tu borrador sigue guardado."
      : "No se pudo publicar. Tu borrador sigue guardado; probá de nuevo.";
  } finally { btn.disabled = false; }
});

cargar();
