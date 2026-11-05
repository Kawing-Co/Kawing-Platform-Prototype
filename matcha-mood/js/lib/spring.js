// Tiny critically-tunable spring. Because velocity carries over when the target
// changes, anything driven by it (sheets, hero carousel, buttons) can be grabbed
// and redirected mid-flight — i.e. every animation is interruptible.
const active = new Set();
let rafId = 0, last = 0;

function frame(t) {
  const dt = Math.min(0.1, (t - last) / 1000 || 1 / 60);   // real elapsed time, so a slow frame rate never means slow motion
  last = t;
  for (const s of active) s._step(dt);
  rafId = active.size ? requestAnimationFrame(frame) : 0;
}

export function spring(initial = 0, { stiffness = 180, damping = 22, mass = 1, precision = 0.002 } = {}, onUpdate = () => {}) {
  const s = {
    x: initial, v: 0, target: initial, stiffness, damping, mass, precision,
    _step(dt) {
      // semi-implicit Euler in fixed sub-steps (stable at any frame rate)
      for (let left = dt; left > 1e-9;) {
        const h = Math.min(left, 1 / 120); left -= h;
        const a = (-s.stiffness * (s.x - s.target) - s.damping * s.v) / s.mass;
        s.v += a * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.v) < s.precision && Math.abs(s.x - s.target) < s.precision) {
        s.x = s.target; s.v = 0; active.delete(s);
        onUpdate(s.x, s); s.onRest?.(); return;
      }
      onUpdate(s.x, s);
    },
    to(t) { s.target = t; s._run(); return s; },
    set(x) { s.x = s.target = x; s.v = 0; active.delete(s); onUpdate(x, s); return s; },
    kick(v) { s.v += v; s._run(); return s; },
    stop() { active.delete(s); s.v = 0; return s; },
    _run() {
      if (!active.has(s)) { active.add(s); if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); } }
    },
    get settled() { return !active.has(s); },
  };
  return s;
}
