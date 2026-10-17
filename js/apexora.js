import { onSesion, registrarVisita } from "https://apexora.github.io/Portal/apexora-core.js";
// HUD (Sinfalita, Odita, racha): se carga en todas las páginas, no solo en la portada.
import("https://apexora.github.io/Portal/apexora-hud.js").catch(() => {});
onSesion((u) => { if (u?.email?.endsWith("@apexora-sala.app")) registrarVisita(); });
