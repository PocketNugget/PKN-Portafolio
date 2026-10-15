/** Portrait phones, and landscape phones that are too short for floating windows. */
export function phoneLayout(): boolean {
  return window.matchMedia("(max-width: 700px), (pointer: coarse) and (max-height: 500px)").matches;
}
