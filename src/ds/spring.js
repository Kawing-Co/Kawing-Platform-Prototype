// A small spring that carries velocity when its target changes, so anything driven by it
// can be grabbed and redirected mid-flight (interruptible). Time-correct at any frame rate.
const active = new Set();
let raf = 0, last = 0;
function frame(t) {
  const dt = Math.min(0.1, (t - last) / 1000 || 1 / 60);
  last = t;
  for (const s of active) s._step(dt);
  raf = active.size ? requestAnimationFrame(frame) : 0;
}
export function spring(initial = 0, { stiffness = 180, damping = 22, mass = 1, precision = 0.002 } = {}, onUpdate = () => {}) {
  const s = {
    x: initial, v: 0, target: initial, stiffness, damping, mass, precision,
    _step(dt) {
      for (let left = dt; left > 1e-9;) {
        const h = Math.min(left, 1 / 120); left -= h;
        s.v += ((-s.stiffness * (s.x - s.target) - s.damping * s.v) / s.mass) * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.v) < s.precision && Math.abs(s.x - s.target) < s.precision) {
        s.x = s.target; s.v = 0; active.delete(s); onUpdate(s.x, s); return;
      }
      onUpdate(s.x, s);
    },
    to(t) { s.target = t; if (!active.has(s)) { active.add(s); if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } } return s; },
    set(x) { s.x = s.target = x; s.v = 0; active.delete(s); onUpdate(x, s); return s; },
  };
  return s;
}
