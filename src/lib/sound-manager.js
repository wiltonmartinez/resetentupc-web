const STORAGE_KEY = "resetenlinea:sound-enabled";

let enabledCache = null;
let audioCtx = null;
const preferenceListeners = new Set();

const VOICES = {
  select: [{ freq: 720, delay: 0, dur: 0.07 }],
  confirm: [
    { freq: 660, delay: 0, dur: 0.09 },
    { freq: 880, delay: 0.08, dur: 0.11 },
  ],
  warning: [{ freq: 480, delay: 0, dur: 0.11 }],
  progress: [
    { freq: 620, delay: 0, dur: 0.06 },
    { freq: 620, delay: 0.09, dur: 0.06 },
  ],
  open: [
    { freq: 700, delay: 0, dur: 0.08 },
    { freq: 940, delay: 0.05, dur: 0.09 },
  ],
  close: [
    { freq: 940, delay: 0, dur: 0.06 },
    { freq: 640, delay: 0.04, dur: 0.08 },
  ],
  favoritoAgregar: [
    { freq: 880, delay: 0, dur: 0.07 },
    { freq: 1100, delay: 0.05, dur: 0.07 },
    { freq: 1320, delay: 0.1, dur: 0.13 },
  ],
  favoritoQuitar: [
    { freq: 520, delay: 0, dur: 0.06 },
    { freq: 340, delay: 0.045, dur: 0.09 },
  ],
  celebracion: [
    { freq: 660, delay: 0, dur: 0.09 },
    { freq: 880, delay: 0.09, dur: 0.09 },
    { freq: 1100, delay: 0.18, dur: 0.09 },
    { freq: 1320, delay: 0.27, dur: 0.16 },
  ],
};

function readStoredPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isSoundEnabled() {
  if (enabledCache === null) enabledCache = readStoredPreference();
  return enabledCache;
}

export function setSoundEnabled(value) {
  enabledCache = !!value;
  try {
    localStorage.setItem(STORAGE_KEY, enabledCache ? "1" : "0");
  } catch {
    // localStorage no disponible (modo privado, permisos, etc.) — la preferencia
    // simplemente no persiste entre visitas, el sitio sigue funcionando igual.
  }
  preferenceListeners.forEach((fn) => fn(enabledCache));
}

export function onSoundPreferenceChange(fn) {
  preferenceListeners.add(fn);
  return () => preferenceListeners.delete(fn);
}

function getAudioContext() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

export function playFeedback(name) {
  if (!isSoundEnabled()) return;
  const notes = VOICES[name];
  if (!notes) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  notes.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const start = now + delay;
    const end = start + dur;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  });
}

function resolveDelegatedSound(target) {
  const el = target.closest && target.closest("[data-sound]");
  return el ? el.dataset.sound : null;
}

function initGlobalDelegation() {
  if (window.__resetenlineaSoundDelegationInit) return;
  window.__resetenlineaSoundDelegationInit = true;

  // Los clics activan cualquier data-sound excepto "toggle" (los <details>
  // se resuelven aparte, por evento "toggle", para diferenciar apertura/cierre).
  document.addEventListener(
    "click",
    (event) => {
      const name = resolveDelegatedSound(event.target);
      if (name && name !== "toggle") playFeedback(name);
    },
    { passive: true }
  );

  // El evento "toggle" de <details> no burbujea, por eso se escucha en fase
  // de captura a nivel de documento en vez de delegarlo por bubbling normal.
  document.addEventListener(
    "toggle",
    (event) => {
      const el = event.target;
      if (!el || el.tagName !== "DETAILS" || el.dataset.sound !== "toggle") return;
      playFeedback(el.open ? "open" : "close");
    },
    true
  );
}

if (typeof document !== "undefined") {
  initGlobalDelegation();
}
