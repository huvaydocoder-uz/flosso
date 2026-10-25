/** Inline scripts that run before first paint (plain module: importable from server components). */
export const THEME_KEY = "flosso-theme";

/** night runs from 19:00 to 07:00 on the visitor's own clock */
export const NIGHT_FROM = 19;
export const DAY_FROM = 7;

/**
 * The day or night the given moment falls in, e.g. "night-2026-10-25" (a night is named after the evening it
 * starts on). A manual choice is saved with this key and only holds until the next 07:00 / 19:00.
 */
export function themePeriod(now = new Date()): { key: string; theme: "dark" | "light" } {
  const h = now.getHours();
  const night = h >= NIGHT_FROM || h < DAY_FROM;
  const d = new Date(now);
  if (h < DAY_FROM) d.setDate(d.getDate() - 1);
  const key = `${night ? "night" : "day"}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return { key, theme: night ? "dark" : "light" };
}

/**
 * Apply the theme before first paint so the page never flashes the wrong one: the visitor's choice for the
 * current day/night if they made one, otherwise dark at night and light by day. While the page stays open it
 * switches itself at 07:00 and 19:00 (and re-checks when the tab comes back, e.g. after sleep).
 * Same rules as themePeriod(), in plain ES5.
 */
export const THEME_BOOT = `(function(){var d=document.documentElement;function p(){var n=new Date(),h=n.getHours(),x=h>=${NIGHT_FROM}||h<${DAY_FROM},t=new Date(n.getTime());if(h<${DAY_FROM})t.setDate(t.getDate()-1);return{k:(x?'night':'day')+'-'+t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(),t:x?'dark':'light'}}function apply(){var c=p(),t=c.t;try{var s=(localStorage.getItem('${THEME_KEY}')||'').split('|');if(s[1]===c.k&&(s[0]==='dark'||s[0]==='light'))t=s[0]}catch(e){}if(d.dataset.theme!==t)d.dataset.theme=t}function next(){var n=new Date(),b=new Date(n.getTime());b.setMinutes(0,0,0);do{b.setHours(b.getHours()+1)}while(b.getHours()!==${NIGHT_FROM}&&b.getHours()!==${DAY_FROM});setTimeout(function(){apply();next()},Math.min(b-n+500,2147483647))}apply();next();document.addEventListener('visibilitychange',function(){if(!document.hidden)apply()})})();`;

/**
 * Intro plays on every full page load, reloads included, unless motion is reduced.
 * The scroll position is restored by the Intro itself once it ends (a reload continues where the
 * visitor was; a fresh browser session starts at the top), so the browser's own restoration is off.
 * Its animations stay paused until the facade image is decoded, so the 3D assembly is always seen.
 */
export const INTRO_BOOT = `(function(){var d=document.documentElement;try{history.scrollRestoration='manual'}catch(e){}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('no-intro');return}}catch(e){}d.classList.add('intro-on');var go=function(){d.classList.add('intro-go')};var i=new Image();i.onload=i.onerror=go;i.src='/images/compositions/composition-1-cut.webp';if(i.complete)go();setTimeout(go,3000)})();`;
