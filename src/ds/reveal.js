// Scroll reveal for [data-k-reveal]. Content is visible by default; hidden only once JS has
// confirmed motion is allowed (html.k-motion), so a failure never leaves blank sections.
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function initReveal() {
  if (reduced() || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("k-motion");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("k-in"); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  const scan = () => document.querySelectorAll("[data-k-reveal]:not([data-k-seen])").forEach((el) => { el.dataset.kSeen = "1"; io.observe(el); });
  scan();
  let queued = false;
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; scan(); }); } }).observe(document.body, { childList: true, subtree: true });
}
