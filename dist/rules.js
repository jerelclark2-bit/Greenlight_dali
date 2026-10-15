/** Pure, deterministic game rules. Rendering never decides whether a shot scores. */
export const SHOT = Object.freeze({ duration: 1.25, target: 0.68, green: 0.052, good: 0.105 });
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export function gradeRelease(heldSeconds, contest = 0) {
  const progress = clamp(heldSeconds / SHOT.duration, 0, 1);
  const error = progress - SHOT.target;
  const perfect = Math.abs(error) <= SHOT.green;
  const made = perfect || (Math.abs(error) <= SHOT.good && contest < 0.35);
  return {progress, error, perfect, made, label: perfect ? 'GREEN RELEASE' : error < 0 ? 'EARLY' : 'LATE'};
}
export function blockContact(ball, defender, jumpHeight) {
  return jumpHeight > 0.25 && Math.hypot(ball.x - defender.x, ball.z - defender.z) < 0.78 && ball.y > 1.3 + jumpHeight && ball.y < 2.8 + jumpHeight;
}
export function shotValue(x) { return Math.abs(x) > 2.5 ? 3 : 2; }
export function nextPossession(attempts) { return attempts % 2; }
