const SCALED = "(min-width: 701px) and (pointer: fine)";

/** The factor the desk is drawn at on a desktop browser. It is --ui-scale in the CSS, and 1 on phones and tablets. */
export function uiScale(): number {
  if (!window.matchMedia(SCALED).matches) return 1;
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-scale"));
  return value > 0.3 && value <= 1 ? value : 1;
}
