let ctx = null, master = null, noiseBuf = null, V = 1, duckOn = false, platMute = false;
let muted = false; try { muted = localStorage.getItem('ka-muted') === '1'; } catch (e) {}
const last = {};
const GAP = { splash: 0.12, coin: 0.055, touch: 0.07, land: 0.08, kick: 0.05, hit: 0.05, lift: 0.1, pop: 0.08, tap: 0.05 };
export const isMuted = () => muted;
export function setMuted(m) { muted = m; if (m) mediaSession(false); try { localStorage.setItem('ka-muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.setTargetAtTime(m || platMute ? 0 : 0.7, ctx.currentTime, 0.02); }
export function setPlatformMute(m) { platMute = m; if (master) master.gain.setTargetAtTime(muted || platMute ? 0 : 0.7, ctx.currentTime, 0.02); }
let duckTimer = null;
export function duck(on) {
  duckOn = on; clearTimeout(duckTimer);
  if (on) duckTimer = setTimeout(() => duck(false), 45000);
  if (ctx) (on ? ctx.suspend() : ctx.resume()).catch(() => {});
  if (on) mediaSession(false);
}
export const debugState = () => ({ ctx: ctx ? ctx.state : 'none', time: ctx ? +ctx.currentTime.toFixed(1) : 0, rate: ctx ? ctx.sampleRate : 0, gain: master ? +master.gain.value.toFixed(2) : 0, muted, platMute, duckOn, ios: IOS });
export function test() { unlock(); duckOn = false; if (ctx) ctx.resume().catch(() => {}); if (master) master.gain.setValueAtTime(muted || platMute ? 0 : 0.7, ctx.currentTime); setTimeout(() => sfx('fanfare'), 120);
  setTimeout(() => { try { const n = 8000, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(i / 16000 * 2 * Math.PI * 660) * 12000 * Math.min(1, (n - i) / 800), true);
    const el = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))); el.volume = 0.8; el.play().catch(e => console.warn('beep blocked', e)); } catch (e) {} }, 1600); }
let silentEl = null;
function silentUrl() {
  const n = 4000, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}
// iOS: Web Audio is silenced by the ring/silent switch unless the page plays as media.
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function mediaSession(on) {
  if (!IOS) return;
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  try {
    if (!silentEl) { silentEl = document.createElement('audio'); silentEl.src = silentUrl(); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.setAttribute('x-webkit-airplay', 'deny'); }
    if (on) silentEl.play().catch(() => {}); else silentEl.pause();
  } catch (e) {}
}
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted || platMute ? 0 : 0.7;
    const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running' && !duckOn) ctx.resume().catch(() => {});
  if (!duckOn && !muted && !platMute && !document.hidden) mediaSession(true);
}
['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend', 'click'].forEach(e => window.addEventListener(e, unlock, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden) mediaSession(false); else if (ctx && !duckOn) ctx.resume().catch(() => {}); });

function env(g, t, vol, attack, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
function tone(f, dur, o = {}) {
  const t = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
  env(g, t, (o.vol || 0.2) * V, o.attack || 0.005, dur); osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur + 0.05);
}
function noise(dur, o = {}) {
  const t = ctx.currentTime + (o.at || 0), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noiseBuf; src.loop = true; f.type = o.filter || 'lowpass'; f.frequency.setValueAtTime(o.freq || 1000, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur); f.Q.value = o.q || 0.8;
  env(g, t, (o.vol || 0.2) * V, o.attack || 0.005, dur); src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
}
const S = {
  coin: o => { const p = o.pitch || 0; tone(1100 + 700 * p, 0.07, { type: 'square', vol: 0.05 }); tone(1650 + 900 * p, 0.12, { at: 0.035, vol: 0.09 }); },
  cash: () => { [0, 0.08].forEach((a, i) => { tone(1300 + i * 500, 0.1, { type: 'square', vol: 0.05, at: a }); tone(2000 + i * 600, 0.18, { at: a + 0.03, vol: 0.08 }); }); noise(0.15, { filter: 'highpass', freq: 5000, vol: 0.05, at: 0.16 }); },
  build: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.16, at: i * 0.07 })); tone(2093, 0.4, { at: 0.3, vol: 0.05 }); noise(0.25, { freq: 300, vol: 0.25 }); },
  upgrade: () => { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.15, at: i * 0.06 })); tone(600, 0.35, { to: 1800, vol: 0.04, type: 'sawtooth', at: 0.02 }); },
  kick: () => { tone(160, 0.13, { to: 45, vol: 0.45 }); noise(0.05, { freq: 1800, vol: 0.18 }); },
  hit: () => { noise(0.07, { filter: 'bandpass', freq: 1100, q: 1.2, vol: 0.35 }); tone(300, 0.1, { to: 170, type: 'triangle', vol: 0.14 }); },
  touch: () => tone(210, 0.06, { to: 120, vol: 0.18 }),
  land: () => { tone(110, 0.1, { to: 60, vol: 0.22 }); noise(0.06, { freq: 600, vol: 0.08 }); },
  lift: () => { tone(85, 0.2, { to: 55, vol: 0.35 }); noise(0.1, { filter: 'bandpass', freq: 2400, q: 3, vol: 0.12 }); },
  pop: () => { tone(880, 0.12, { to: 1320, vol: 0.12 }); tone(1760, 0.1, { at: 0.06, vol: 0.06 }); },
  splash: () => { noise(0.35, { filter: 'bandpass', freq: 1400, q: 0.7, vol: 0.28, attack: 0.02 }); noise(0.25, { filter: 'highpass', freq: 4000, vol: 0.06, at: 0.05 }); },
  door: () => { noise(0.35, { filter: 'bandpass', freq: 400, to: 2200, q: 1.2, vol: 0.18, attack: 0.05 }); tone(330, 0.12, { type: 'triangle', vol: 0.08, at: 0.05 }); tone(494, 0.18, { type: 'triangle', vol: 0.08, at: 0.14 }); },
  tap: () => tone(520, 0.05, { to: 380, vol: 0.06 }),
  click: () => { tone(700, 0.04, { type: 'square', vol: 0.04 }); tone(1400, 0.03, { at: 0.01, vol: 0.04 }); },
  whistle: () => { const w = (a, d) => { tone(2750, d, { at: a, vol: 0.12, vib: [28, 140], attack: 0.02 }); noise(d, { filter: 'bandpass', freq: 2800, q: 4, vol: 0.05, at: a, attack: 0.02 }); }; w(0, 0.16); w(0.24, 0.16); w(0.48, 0.55); },
  cheer: () => { noise(2.4, { filter: 'bandpass', freq: 900, q: 0.6, vol: 0.32, attack: 0.35 }); noise(2.0, { filter: 'bandpass', freq: 2200, q: 0.8, vol: 0.12, attack: 0.4, at: 0.1 }); },
  crowd: () => noise(1.4, { filter: 'bandpass', freq: 800, q: 0.6, vol: 0.18, attack: 0.3 }),
  groan: () => { noise(1.4, { freq: 900, to: 250, vol: 0.28, attack: 0.15 }); tone(220, 1.0, { to: 130, type: 'sawtooth', vol: 0.025, at: 0.05 }); },
  fanfare: () => { [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42]].forEach(([f, a], i) => { const d = i === 3 ? 0.8 : 0.16; tone(f, d, { type: 'sawtooth', vol: 0.06, at: a }); tone(f * 2, d, { type: 'triangle', vol: 0.08, at: a }); }); S.cheer(); },
};
export function sfx(name, o = {}) {
  if (muted || platMute || duckOn || !ctx || !S[name]) return;
  if (ctx.state !== 'running') { ctx.resume().catch(() => {}); if (ctx.state !== 'running') return; }
  const now = ctx.currentTime; if (GAP[name] && last[name] && now - last[name] < GAP[name]) return; last[name] = now;
  V = o.vol == null ? 1 : o.vol; try { S[name](o); } catch (e) {} V = 1;
}
