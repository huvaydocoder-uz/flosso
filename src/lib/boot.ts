/** Inline scripts that run before first paint (plain module: importable from server components). */
export const THEME_KEY = "flosso-theme";

/** apply the saved theme so the page never flashes the wrong one */
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}})();`;

/**
 * Intro plays on every full page load, reloads included, unless motion is reduced.
 * The scroll position is restored by the Intro itself once it ends (a reload continues where the
 * visitor was; a fresh browser session starts at the top), so the browser's own restoration is off.
 * Its animations stay paused until the facade image is decoded, so the 3D assembly is always seen.
 */
export const INTRO_BOOT = `(function(){var d=document.documentElement;try{history.scrollRestoration='manual'}catch(e){}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('no-intro');return}}catch(e){}d.classList.add('intro-on');var go=function(){d.classList.add('intro-go')};var i=new Image();i.onload=i.onerror=go;i.src='/images/compositions/composition-1-cut.webp';if(i.complete)go();setTimeout(go,3000)})();`;
