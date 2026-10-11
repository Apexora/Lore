import { onSesion, registrarVisita } from "https://apexora.github.io/Portal/apexora-core.js";
onSesion((u) => { if (u?.email?.endsWith("@apexora-sala.app")) registrarVisita(); });
