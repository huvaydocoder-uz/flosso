import { pilasterGradient } from "./Frieze";

/**
 * On very wide screens the page stands between two fluted pilasters
 * (catalog profile FTK01-430), so the site reads as a facade bay.
 * They sit above every section (below the header), so they run unbroken from top to bottom
 * and the running bands slide in and out behind them.
 */
export function Pilasters() {
  const bg = pilasterGradient("FTK01-430");
  // from a laptop up: always there, hugging the bay so nothing on the page runs past them
  const side = "pointer-events-none fixed top-0 bottom-0 z-[35] hidden w-[var(--pil-w)] lg:block";
  const pos = "calc(50% - var(--half-bay) - var(--pil-w))";
  const style = { backgroundImage: bg, filter: "var(--frieze-filter)", boxShadow: "6px 0 14px -6px rgb(70 50 40 / 0.35), -1px 0 0 rgb(70 50 40 / 0.1)" };
  return (
    <>
      <div aria-hidden="true" className={side} style={{ ...style, left: pos }} />
      <div aria-hidden="true" className={side} style={{ ...style, right: pos, transform: "scaleX(-1)" }} />
    </>
  );
}
