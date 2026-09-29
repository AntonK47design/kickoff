// CrazyGames SDK v3 wrapper. Every call is a no-op outside CrazyGames, so the same build runs anywhere.
let SDK = null, ready = null, playing = false, wantPlay = false, adActive = false;

function loadScript() {
  return new Promise(res => {
    if (window.CrazyGames && window.CrazyGames.SDK) return res();
    const s = document.createElement('script');
    s.src = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
    s.onload = () => res(); s.onerror = () => res();
    document.head.appendChild(s);
    setTimeout(res, 4000);
  });
}
export function init() {
  if (ready) return Promise.race([ready, new Promise(r => setTimeout(r, 3000))]);
  ready = (async () => {
    try {
      await loadScript();
      const S = window.CrazyGames && window.CrazyGames.SDK; if (!S) return;
      await Promise.race([S.init(), new Promise(r => setTimeout(r, 2500))]);
      if (!S.environment) await S.init().catch(() => {});
      if (S.environment === 'crazygames' || S.environment === 'local') SDK = S;
    } catch (e) { console.warn('[CG] SDK unavailable', e); }
  })();
  return Promise.race([ready, new Promise(r => setTimeout(r, 3000))]);
}
const call = fn => { if (SDK) try { return fn(SDK); } catch (e) { console.warn('[CG]', e); } };
export const active = () => !!SDK;
export const loadingStart = () => call(s => s.game.loadingStart());
export const loadingStop = () => call(s => s.game.loadingStop());
export const happy = () => call(s => s.game.happytime());
export function setPlaying(on) {
  wantPlay = on; if (adActive || on === playing) return;
  playing = on; call(s => (on ? s.game.gameplayStart() : s.game.gameplayStop()));
}
export function ad(type, { onDone, onFail } = {}) {
  if (!SDK || adActive) return false;
  const resume = wantPlay;
  if (playing) { playing = false; call(s => s.game.gameplayStop()); }
  adActive = true;
  const end = () => { adActive = false; setPlaying(resume); };
  let settled = false; const guard = setTimeout(() => { if (!settled) { settled = true; end(); onFail && onFail({ code: 'timeout' }); } }, 45000);
  const once = f => (...x) => { if (settled) return; settled = true; clearTimeout(guard); f(...x); };
  call(s => s.ad.requestAd(type, {
    adStarted: () => {},
    adFinished: once(() => { end(); onDone && onDone(); }),
    adError: once(e => { end(); onFail && onFail(e); }),
  }));
  return true;
}
export const getSave = key => call(s => s.data.getItem(key)) || null;
export const setSave = (key, v) => call(s => s.data.setItem(key, v));
export const muteSetting = () => call(s => s.game.settings && s.game.settings.muteAudio) === true;
export const onSettings = cb => call(s => s.game.addSettingsChangeListener && s.game.addSettingsChangeListener(cb));
export const useLocal = true;
export const gameReady = () => {};
export const onPause = () => {};
