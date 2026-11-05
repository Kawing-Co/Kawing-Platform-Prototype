// Digit-roll number. Tabular figures keep the width steady; each digit is a strip
// that slides to its value, so prices roll instead of jumping.
export function odo(el, value, prefix = "₱") {
  const txt = Math.round(value).toLocaleString("en-US");
  const chars = [...txt];
  const sig = prefix + chars.map((c) => (/\d/.test(c) ? "d" : c)).join("");
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.classList.add("odo");
    el.innerHTML = `<span class="s" aria-hidden="true">${prefix}</span>` + chars.map((c) => /\d/.test(c)
      ? `<span class="d" aria-hidden="true"><span>${Array.from({ length: 10 }, (_, n) => `<i>${n}</i>`).join("")}</span></span>`
      : `<span class="s" aria-hidden="true">${c}</span>`).join("");
    el.setAttribute("role", "text");
    void el.offsetWidth; // let the strips start from 0 so a rebuild also rolls
  }
  el.setAttribute("aria-label", prefix + txt);
  const cols = el.querySelectorAll(".d > span");
  let k = 0;
  for (const c of chars) if (/\d/.test(c)) cols[k++].style.transform = `translateY(${-Number(c) * 1.18}em)`;
}
