// Order flow: Confirm → Verify (one-time code) → Complete.
//  • "Place order" is optimistic: the completion screen appears at once ("Confirming…")
//    and fills in when the demo server answers. If it fails, Retry re-sends with the SAME
//    idempotency key, so the café can never receive the order twice.
//  • Payment is a demonstration only — nothing is charged.
import { store, draft, saveDraft, cartTotal, itemById, lineUnit, buildOrder, submitOrder, taxIncluded, clearCart, cartCount } from "../store.js";
import { peso, pickImage, summarize } from "../model.js";
import { photo, btn } from "../views.js";
import { openSheet, closeAll } from "./sheet.js";
import { odo } from "../lib/odometer.js";
import { burst } from "./fx.js";
import { toast } from "./toast.js";
import { vt } from "../lib/vt.js";
import { paintPlaceholders, watchImages } from "../lib/placeholder.js";
import { esc, sleep, vibrate, reduced } from "../lib/dom.js";
import { I } from "../icons.js";

const hhmm = (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
function slots(prep) {
  const now = Date.now(), r5 = (t) => Math.ceil(t / 300000) * 300000;
  return [{ label: "ASAP", sub: `~${prep} min`, at: now + prep * 60000 }, ...[15, 30, 45].map((m) => ({ label: hhmm(r5(now + m * 60000)), sub: `in ${m} min`, at: r5(now + m * 60000) }))];
}

export function openFlow() {
  if (!store.cart.length) return;
  const prep = store.menu.merchant.prepMinutes;
  const times = slots(prep);
  let slot = Math.min(draft.slot || 0, times.length - 1), placed = false, orderDraft = null, order = null, inflight = null;
  const idemKey = crypto.randomUUID?.() ?? "idem_" + Math.random().toString(36).slice(2);

  const root = document.createElement("div");
  root.className = "flow";
  const timers = [];
  const handle = openSheet({ content: root, full: true, label: "Confirm your order", onClosed: () => timers.forEach(clearTimeout) });

  /* ───────── step 1: confirm ───────── */
  function confirmView() {
    const total = cartTotal();
    root.innerHTML = `
      <div class="flow-top"><button type="button" class="icon-btn hit" data-back aria-label="Back">${I.arrowL}</button><h2>Confirm order</h2><div class="steps-mini" aria-hidden="true"><i class="on"></i><i></i><i></i></div></div>
      <div class="flow-body" data-scroll>
        <section><h3>Pickup</h3>
          <div class="seg" role="radiogroup" aria-label="Pickup type" data-v="${draft.pickup}"><span class="thumb"></span>
            <button type="button" role="radio" aria-checked="${draft.pickup === "takeout"}" data-pk="takeout">${I.bag}Takeout</button>
            <button type="button" role="radio" aria-checked="${draft.pickup === "dinein"}" data-pk="dinein">${I.cup}Dine-in</button></div>
        </section>
        <section><h3>Ready at</h3>
          <div class="chips" role="radiogroup" aria-label="Pickup time">${times.map((t, i) => `<button type="button" class="chip" role="radio" aria-checked="${i === slot}" data-slot="${i}"><span class="tnum">${t.label}</span><small>${t.sub}</small></button>`).join("")}</div>
        </section>
        <section><h3>Your details</h3>
          <div class="fields">
            <div class="field" data-f="name"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" placeholder="So we can call it out" value="${esc(draft.name)}" enterkeyhint="next"><span class="err" data-err></span></div>
            <div class="field" data-f="phone"><label for="f-phone">Mobile number</label><input id="f-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="0917 000 0000" value="${esc(draft.phone)}" enterkeyhint="done"><span class="err" data-err></span></div>
          </div>
        </section>
        <section><h3>Payment</h3>
          <div class="pay" role="radiogroup" aria-label="Payment method">
            ${[["card", I.card, "Card", "Visa or Mastercard"], ["wallet", I.wallet, "E-wallet", "Pay with your phone"], ["counter", I.store, "Pay at the counter", "Cash or card when you collect"]].map(([id, ic, t, s]) => `<button type="button" role="radio" aria-checked="${draft.pay === id}" data-pay="${id}">${ic}<span><b>${t}</b><small>${s}</small></span><span class="dot"></span></button>`).join("")}
          </div>
          <p class="demo-note">Demo checkout — no payment is taken and no card is needed.</p>
        </section>
        <section><h3>Your order</h3>
          <div class="review">
            ${store.cart.map((l) => { const it = itemById(l.itemId), sum = summarize(it, l.sel); return `<div class="rline">${photo(pickImage(it, l.sel), { sm: true, alt: "" })}<div><b>${l.qty > 1 ? l.qty + " × " : ""}${esc(it.name)}</b><small>${esc(sum.join(" · ") || "As on the menu")}</small></div><span class="p tnum">${peso(lineUnit(l) * l.qty)}</span></div>`; }).join("")}
            <hr><div class="sum"><span>VAT included (12%)</span><span class="tnum">${peso(taxIncluded(total))}</span></div>
            <div class="sum total"><span>Total</span><span class="tnum" data-tot></span></div>
          </div>
        </section>
      </div>
      <div class="flow-foot">${btn(`Place order · <span class="tnum" data-ptot></span>`, { cls: "btn-primary btn-block", attrs: "data-place" })}<p class="fine">By placing this demo order you agree to nothing. It is simulated end to end.</p></div>`;
    root.querySelectorAll("[data-tot],[data-ptot]").forEach((el) => odo(el, total));
    paintPlaceholders(root); watchImages(root);
  }

  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-back]")) { handle.close(); return; }
    const pk = e.target.closest("[data-pk]");
    if (pk) { draft.pickup = pk.dataset.pk; saveDraft(); root.querySelector(".seg").dataset.v = draft.pickup; root.querySelectorAll("[data-pk]").forEach((b) => b.setAttribute("aria-checked", String(b === pk))); vibrate(8); return; }
    const sl = e.target.closest("[data-slot]");
    if (sl) { slot = Number(sl.dataset.slot); draft.slot = slot; root.querySelectorAll("[data-slot]").forEach((b) => b.setAttribute("aria-checked", String(b === sl))); vibrate(6); return; }
    const py = e.target.closest("[data-pay]");
    if (py) { draft.pay = py.dataset.pay; saveDraft(); root.querySelectorAll("[data-pay]").forEach((b) => b.setAttribute("aria-checked", String(b === py))); vibrate(6); return; }
    if (e.target.closest("[data-place]")) place();
    if (e.target.closest("[data-retry]")) send();
    if (e.target.closest("[data-again]")) { closeAll(); setTimeout(() => (location.hash = "#menu"), 60); }
  });
  root.addEventListener("input", (e) => { const i = e.target.closest("input"); if (!i) return; draft[i.name === "tel" ? "phone" : "name"] = i.value; saveDraft(); i.closest(".field").classList.remove("bad"); });

  function validate() {
    let ok = true;
    for (const [key, test, msg] of [["name", (v) => v.trim().length >= 1, "Please add a name."], ["phone", (v) => v.replace(/\D/g, "").length >= 9, "Please add a mobile number so we can text a code."]]) {
      const f = root.querySelector(`[data-f="${key}"]`), v = f.querySelector("input").value;
      const good = test(v); f.classList.toggle("bad", !good); f.querySelector("[data-err]").textContent = good ? "" : msg;
      if (!good && ok) { f.querySelector("input").focus(); f.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" }); }
      ok = ok && good;
    }
    return ok;
  }

  /* ───────── step 2: verify (one-time code) ───────── */
  let verifying = false;
  function place() {
    if (placed || verifying || !validate()) return;   // a fast double-tap must not open two sheets
    verifying = true;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    openVerify(code, draft.phone).then((ok) => {
      verifying = false;
      if (!ok) return;
      placed = true;
      orderDraft = buildOrder(times[slot].label === "ASAP" ? `ASAP · ~${prep} min` : times[slot].label, times[slot].at);
      completeView().then(() => send());   // optimistic: show the finish line now, confirm in the background
    });
  }

  /* ───────── step 3: complete (optimistic) ───────── */
  function completeView() {
    return vt(() => {
      const o = orderDraft;
      root.innerHTML = `
        <div class="done" data-scroll>
          <div class="done-bg">${photo("ritual", { alt: "", cls: "" })}</div>
          <div class="done-in" data-in>
            <div class="stamp-wrap"><i class="ring"></i><i class="ring r2"></i><i class="ring r3"></i><div class="stamp" aria-hidden="true"><span>Order<br>received</span></div></div>
            <h2>Thank you, <em>${esc(o.name.split(" ")[0])}</em>.<br>Your order is in.</h2>
            <div class="ordno"><small>Order number</small><div data-no><span class="skel dk"></span></div></div>
            <div class="pickup"><span><small>${o.pickup === "takeout" ? "Takeout" : "Dine-in"}</small><b class="tnum">${esc(o.slotLabel)}</b></span><span><small>Total</small><b class="tnum">${peso(o.total)}</b></span></div>
            <div data-status class="confirming"><span class="sync"></span>Confirming with the café…</div>
            <div class="track" data-track hidden>
              <div class="track-bar"><i></i></div>
              <ol><li class="on" data-s="0"><span class="pip"></span>Received<small>just now</small></li><li data-s="1"><span class="pip"></span>Whisking<small>in progress</small></li><li data-s="2"><span class="pip"></span>Ready<small>at the counter</small></li></ol>
              <p class="note">Demo time-lapse: a real order would follow the café's own pace.</p>
            </div>
            <div class="receipt" data-receipt hidden>
              ${o.lines.map((l) => `<div class="rline">${photo(pickImage(itemById(l.itemId), l.sel), { sm: true, alt: "" })}<div><b>${l.qty > 1 ? l.qty + " × " : ""}${esc(l.name)}</b><small>${esc(l.summary.join(" · ") || "As on the menu")}</small></div><span class="p tnum">${peso(l.unit * l.qty)}</span></div>`).join("")}
              <hr style="border:0;border-top:1px solid var(--line);width:100%"><div class="sum"><span>VAT included (12%)</span><span class="tnum">${peso(o.tax)}</span></div>
              <div class="sum total"><span>Total</span><span class="tnum">${peso(o.total)}</span></div>
              <div class="ref"><span>Request key</span><span>${idemKey}</span></div>
            </div>
          </div>
          <div class="done-foot">${btn("Back to the menu", { cls: "btn-light", attrs: "data-again", icon: I.arrow })}</div>
        </div>`;
      paintPlaceholders(root); watchImages(root);
      requestAnimationFrame(() => root.querySelector("[data-in]")?.classList.add("is-in"));
    }, { name: "flow" });
  }

  async function send() {
    if (inflight) return inflight;                       // double-tap / double-send guard
    const status = () => root.querySelector("[data-status]");
    if (status()) { status().className = "confirming"; status().innerHTML = `<span class="sync"></span>Confirming with the café…`; }
    inflight = submitOrder(orderDraft, idemKey).then(({ order: o, replay }) => {
      order = o;
      const no = root.querySelector("[data-no]"); if (no) no.innerHTML = `<b class="tnum">${o.id}</b>`;
      status()?.remove();
      root.querySelector("[data-track]").hidden = false; root.querySelector("[data-receipt]").hidden = false;
      clearCart();
      vibrate([12, 40, 18]);
      const r = root.querySelector(".stamp").getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ["#cfe79a", "#7da24a", "#eef3dc", "#d9694f"], 26, { spread: 150 });
      startTracking();
    }).catch((err) => {
      if (status()) { status().className = "errbox"; status().innerHTML = `<span>${esc(err.message)}. Your order is safe — retrying won't create a duplicate.</span>${btn("Retry", { cls: "btn-light", attrs: "data-retry" })}`; }
    }).finally(() => { inflight = null; });
    return inflight;
  }

  function startTracking() {
    const track = root.querySelector("[data-track]"), items = [...track.querySelectorAll("li")], bar = track.querySelector(".track-bar i");
    const set = (n, label) => {
      items.forEach((li, i) => li.classList.toggle("on", i <= n));
      bar.style.setProperty("--tp", [0.12, 0.55, 1][n]);
      if (label) items[n].querySelector("small").textContent = label;
    };
    set(0);
    timers.push(setTimeout(() => { set(1); vibrate(8); }, 3800));
    timers.push(setTimeout(() => {
      set(2, "now");
      vibrate([20, 50, 20]);
      const r = items[2].getBoundingClientRect();
      burst(r.right - 20, r.top, ["#cfe79a", "#eef3dc", "#7da24a"], 30, { spread: 160 });
      toast({ text: `${order.id} is ready at the counter.`, duration: 6000 });
    }, 11500));
  }

  confirmView();
  return handle;
}

/* ───────── one-time-code sheet ───────── */
function openVerify(code, phone) {
  return new Promise((resolve) => {
    const root = document.createElement("div");
    root.className = "verify";
    root.style.padding = "30px 22px calc(26px + var(--sab))";
    root.innerHTML = `<h2>Enter your code</h2><p>We sent a 4-digit code to <b class="tnum">${esc(phone)}</b>.</p>
      <div class="otp" data-otp><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <input inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="4" aria-label="4-digit code" data-autofocus></div>
      <p class="help fine">Demo: a text message will appear at the top of the screen. Tap it to fill the code, or type it.</p>
      <div>${btn("Verify and place order", { cls: "btn-primary btn-block", attrs: "data-go disabled" })}</div>`;
    let done = false;
    const h = openSheet({ content: root, label: "Verify your phone number", onClosed: () => { sms.remove(); if (!done) resolve(false); } });
    const input = root.querySelector("input"), cells = [...root.querySelectorAll(".cell")], go = root.querySelector("[data-go]"), otp = root.querySelector("[data-otp]");

    // the "text message" arrives after a beat, like the real thing
    const sms = document.createElement("button");
    sms.type = "button"; sms.className = "sms";
    sms.innerHTML = `<span class="hanko" aria-hidden="true">M</span><span><b>Messages · Matcha Mood</b><span>Your code is <em class="tnum">${code}</em>. Tap to fill.</span></span>`;
    document.body.append(sms);
    const t = setTimeout(() => { sms.classList.add("on"); vibrate([10, 30, 10]); }, 900);
    const hide = setTimeout(() => sms.classList.remove("on"), 9000);
    sms.addEventListener("click", () => { input.value = code; paint(); sms.classList.remove("on"); input.focus(); });

    const paint = () => {
      const v = input.value.replace(/\D/g, "").slice(0, 4); input.value = v;
      cells.forEach((c, i) => { const had = c.textContent; c.textContent = v[i] || ""; c.classList.toggle("on", i === v.length); c.classList.toggle("fill", !!v[i] && had !== v[i]); });
      go.disabled = v.length < 4; otp.classList.remove("bad");
      if (v.length === 4) setTimeout(submit, 220);
    };
    const submit = () => {
      if (done) return;
      if (input.value !== code) { otp.classList.add("bad"); vibrate([30, 40, 30]); input.value = ""; setTimeout(paint, 450); return; }
      done = true; clearTimeout(t); clearTimeout(hide); sms.classList.remove("on");
      resolve(true); h.close();
    };
    input.addEventListener("input", paint);
    go.addEventListener("click", submit);
    cells[0].classList.add("on");
    otp.addEventListener("click", () => input.focus());
  });
}
