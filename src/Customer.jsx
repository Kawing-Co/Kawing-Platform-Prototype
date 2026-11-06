import { receiptKey } from "./experience";
import ProgressiveImage from "./ProgressiveImage";
import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { paymentLabel, contextLabel, uid } from "./commerce";
import { PROVIDERS, provider, resolvePaymentRoute } from "./payments";
import "./payments.css";
import "./ds/customer.css";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UtensilsCrossed,
  WifiOff,
  X,
} from "lucide-react";
import ItemSheet from "./CustomerSheet.jsx";
import Odometer from "./ds/Odometer.jsx";
import { flyTo, burst } from "./ds/fx.js";
import { cleanSel, defaultSel, hasOptions, orderLine, sigOf, summarize } from "./merchant";

const peso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

export default function Customer({
  menu = [],
  brand = { name: "Matcha Mood" },
  onSubmit,
  orders = [],
  offline = false,
  onNavigate,
  context = { kind: "shared", table: null },
  tables = {},
  onAction,
  policy = "prepaid",
  onCartStart,
  onReceiptChange,
  merchantId = "salo",
}) {
  const craft = brand.category === "Crafts";
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const cartKey =
    "kawing-cart-v2:" +
    merchantId +
    ":" +
    context.kind +
    ":" +
    (context.table || "");
  // Lines are { id, sel, qty } keyed by item + selection. Anything stored that no longer
  // matches the menu (older carts, edited menus) is dropped or cleaned, never trusted.
  const readCart = () => {
    try {
      const v = JSON.parse(localStorage.getItem(cartKey)) || {};
      const lines = {};
      for (const l of Object.values(v.cart || {})) {
        const item = menu.find((m) => m.id === l?.id);
        if (!item) continue;
        const sel = cleanSel(item, l.sel);
        lines[sigOf(item.id, sel)] = { id: item.id, sel, qty: Math.max(1, Math.min(20, Number(l.qty) || 1)) };
      }
      return { cart: lines, note: typeof v.note === "string" ? v.note : "" };
    } catch {
      return { cart: {}, note: "" };
    }
  };
  const [cart, setCart] = useState(() => readCart().cart);
  const submission = useRef(uid());
  const inFlight = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const [note, setNote] = useState(() => readCart().note);
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify({ cart, note }));
    } catch {}
  }, [cart, note, cartKey]);
  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState("GCash");
  // Opened only by an explicit "Continue with …" tap; never changes payment status.
  const [payGuide, setPayGuide] = useState(null);
  const [sheet, setSheet] = useState(null);       // item being customized
  const [bagOpen, setBagOpen] = useState(false);  // phone: the order sheet
  const [placed, setPlaced] = useState(() => {
    try {
      const id = localStorage.getItem(receiptKey(merchantId));
      const saved = orders.find((order) => String(order.id) === id);
      if (!saved) localStorage.removeItem(receiptKey(merchantId));
      return saved || null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (
      placed &&
      !orders.some((order) => String(order.id) === String(placed.id))
    ) {
      setPlaced(null);
      try {
        localStorage.removeItem(receiptKey(merchantId));
      } catch {
        /* Storage may be unavailable. */
      }
    }
  }, [orders, placed]);
  function clearReceipt() {
    setPlaced(null);
    submission.current = uid();
    try {
      localStorage.removeItem(receiptKey(merchantId));
    } catch {
      /* Storage may be unavailable. */
    }
  }
  useEffect(() => {
    onReceiptChange?.(!!placed && !checkout);
  }, [placed, checkout, onReceiptChange]);
  const [busy, setBusy] = useState(false);
  const categories = ["All", ...new Set(menu.map((item) => item.category))];
  const filtered = menu.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      `${item.name} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([lineKey, l]) => {
          const item = menu.find((m) => m.id === l.id);
          return item && item.available !== false ? { ...orderLine(item, l.sel, l.qty), lineKey } : null;
        })
        .filter(Boolean),
    [cart, menu],
  );
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const quantity = items.reduce((sum, item) => sum + item.qty, 0);
  const addLine = (id, sel, qty = 1) => {
    if (!quantity) onCartStart?.();
    const key = sigOf(id, sel);
    setCart((c) => ({ ...c, [key]: { id, sel, qty: Math.min(20, (c[key]?.qty || 0) + qty) } }));
  };
  const changeLine = (key, d) =>
    setCart((c) => {
      const l = c[key];
      if (!l) return c;
      const qty = Math.max(0, Math.min(20, l.qty + d));
      const next = { ...c };
      if (qty) next[key] = { ...l, qty };
      else delete next[key];
      return next;
    });
  // The default (as-listed) line of an item, for the card's quick stepper.
  const defaultLine = (item) => cart[sigOf(item.id, defaultSel(item))];
  // Where the photograph lands: the phone's bag pill, or the order panel on a wide screen.
  const bagPoint = () => {
    const el = [...document.querySelectorAll(".cx-mobile-bag, #customer-cart")].find((e) => e.offsetParent) || document.body;
    const r = el.getBoundingClientRect();
    return { x: r.left + Math.min(60, r.width / 2), y: r.top + Math.min(26, r.height / 2) };
  };
  function flyAdd(rect, src, size = 76) {
    if (!rect) return;
    flyTo({ from: { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.5 }, src, target: bagPoint(), size }).then(() => {
      const t = bagPoint();
      burst(t.x, t.y, ["#cfe79a", "#7da24a", "#eef3dc"], 12, { spread: 64, gravity: 28 });
      const pill = document.querySelector(".cx-mobile-bag");
      pill?.classList.remove("k-squish"); void pill?.offsetWidth; pill?.classList.add("k-squish");
    });
  }
  const liveOrder = useMemo(
    () =>
      orders.find((order) => String(order.id) === String(placed?.id)) || placed,
    [orders, placed],
  );
  const status = String(liveOrder?.status || "new").toLowerCase();
  const statusIndex =
    status === "served" || status === "completed"
      ? 3
      : status === "ready"
        ? 2
        : status === "preparing" || status === "cooking"
          ? 1
          : 0;
  async function placeOrder() {
    if (
      !items.length ||
      inFlight.current ||
      (!context.table && !["counter", "takeaway"].includes(context.kind))
    )
      return;
    inFlight.current = true;
    setSubmitError("");
    setBusy(true);
    try {
      const order = {
        items,
        total,
        table: context.table || context.kind,
        payment,
        note,
        submissionId: submission.current,
      };
      const result = await onSubmit(order);
      const created =
        typeof result === "object" && result
          ? result
          : {
              ...order,
              id: result || orders[0]?.id || "new",
              status: offline ? "queued" : "new",
            };
      setPlaced(created);
      try {
        localStorage.setItem(receiptKey(merchantId), String(created.id));
      } catch {
        /* Keep the current receipt usable without storage. */
      }
      setCart({});
      setCheckout(false);
      setBagOpen(false);
      setNote("");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }
  // sliding category indicator
  const rail = useRef(null);
  const [ind, setInd] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const el = rail.current?.querySelector(".cx-category.active");
    if (el) setInd({ x: el.offsetLeft, w: el.offsetWidth });
  }, [category, categories.length]);
  const blocked = context.table
    ? tables[context.table] === false
    : !["counter", "takeaway"].includes(context.kind);
  const heroPhoto = craft ? "/images/market-stall.jpg" : brand.heroPhoto || "/images/matcha/latte-iced.jpg";
  return (
    <div
      className="cx-shell"
      style={{ "--cx-brand": brand.accent || "#1f4d3a" }}
    >
      {placed ? (
        <section className="cx-success" aria-live="polite">
          <div className="cx-stamp-wrap" aria-hidden="true">
            <i /><i /><i />
            <div className="cx-success-icon">
              {status === "queued" ? (
                <WifiOff size={27} />
              ) : (
                <CheckCircle2 size={29} />
              )}
            </div>
          </div>
          <h1>
            {status === "refunded"
              ? "Your demo refund is recorded."
              : status === "queued"
                ? "Saved. We’ll send it soon."
                : statusIndex === 3
                  ? "Thank you. See you again!"
                  : statusIndex === 2
                    ? "Something good is ready."
                    : craft
                      ? "Your market order is received."
                      : "Your order is on its way."}
          </h1>
          <p>
            {status === "refunded"
              ? "Any stamp earned by this order has been reversed in the loyalty ledger."
              : status === "queued"
                ? "Your order is saved on this device. Reconnect the demo to send it to the kitchen."
                : statusIndex === 3
                  ? craft
                    ? "Your order has been collected. Thank you for supporting a local maker."
                    : "Your order has been served. Thank you for supporting a local café."
                  : craft
                    ? "The merchant can verify payment and get your items ready for collection."
                    : "Stay a little, make yourself at home. Your order is connected to our kitchen."}
          </p>
          <div className="cx-success-ref">
            Order <strong>#{liveOrder?.id}</strong> ·{" "}
            {liveOrder?.context
              ? contextLabel(liveOrder.context)
              : liveOrder?.table}{" "}
            · <strong>{peso(liveOrder?.total || 0)}</strong>
            <br />
            <small>
              {liveOrder?.payment !== "Cash"
                ? liveOrder?.payment + " selected — no money was charged."
                : "Pay at the counter · demo order only"}
            </small>
          </div>
          {Array.isArray(liveOrder?.items) && liveOrder.items.length > 0 && (
            <ul className="cx-receipt-items" aria-label="Items in this order">
              {liveOrder.items.map((i, n) => (
                <li key={n}>
                  <span>{i.qty} × {i.name}{i.summary?.length ? <small>{i.summary.join(" · ")}</small> : null}</span>
                  <strong>{peso(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
          )}
          <p className="cx-payment-state" role="status">
            {paymentLabel(liveOrder || {})}
          </p>
          {liveOrder?.payment !== "Cash" &&
            liveOrder?.paymentStatus === "selected" &&
            status !== "queued" && (
              <PayWith
                order={liveOrder}
                open={payGuide === liveOrder.id}
                onContinue={() => setPayGuide(liveOrder.id)}
                onClose={() => setPayGuide(null)}
                onClaim={() => {
                  setPayGuide(null);
                  onAction?.(liveOrder.id, "claim");
                }}
              />
            )}
          <div className="cx-progress">
            {(craft
              ? ["Received", "Packing", "Ready", "Collected"]
              : ["Received", "Preparing", "Ready", "Served"]
            ).map((step, index) => (
              <div
                className={`cx-step ${index <= statusIndex && status !== "queued" ? "done" : ""}`}
                key={step}
              >
                <i>
                  {index <= statusIndex && status !== "queued" ? (
                    <Check size={13} />
                  ) : (
                    index + 1
                  )}
                </i>
                {step}
              </div>
            ))}
          </div>
          <p>
            {craft
              ? "Your order is shared with this merchant. Updates appear here as they prepare your pickup."
              : "Your order is shared with the café team. Follow it in the kitchen, then come back to see its progress."}
          </p>
          {onNavigate && (
            <button className="cx-primary" onClick={() => onNavigate("Orders")}>
              Follow this order in the kitchen <ArrowUpRight size={15} />
            </button>
          )}
          <button className="cx-back" onClick={clearReceipt}>
            Explore the menu <ArrowUpRight size={15} />
          </button>
        </section>
      ) : (
        <>
          <header className="cx-hero">
            <div className="cx-hero-media" aria-hidden="true">
              <ProgressiveImage src={heroPhoto} alt="" width="1024" height="1280" />
            </div>
            <div className="cx-hero-copy">
              <div className="cx-eyebrow">
                {craft ? "Made local. Shared together." : brand.eyebrow || "Neighborhood café"}
              </div>
              <h1>
                {craft ? (
                  <>
                    Made with care,
                    <br />
                    by {brand.name}.
                  </>
                ) : (
                  <>
                    {(brand.heroLines || ["A seat at", `the ${brand.name} table.`])[0]}
                    <br />
                    {(brand.heroLines || ["A seat at", `the ${brand.name} table.`])[1]}
                  </>
                )}
              </h1>
              <p>
                {brand.tagline || "Good food, thoughtfully made."}
              </p>
              <div className="cx-hero-meta">
                <span>
                  <MapPin size={13} />{" "}
                  {craft ? "Market pickup · fictional" : "Poblacion, Makati"}
                </span>
                <span>
                  <Clock3 size={13} />{" "}
                  {craft ? "Arrange at the booth" : "10–15 min"}
                </span>
              </div>
            </div>
            <div className="cx-table">
              <span>You’re at</span>
              <strong>{contextLabel(context)}</strong>
            </div>
          </header>
          {offline && (
            <div className="cx-offline">
              <WifiOff size={15} /> Offline simulation · Your order will be
              saved here and synced when reconnected.
            </div>
          )}
          <div className="cx-layout">
            <section
              aria-label={craft ? "Merchant catalog" : "Café menu"}
            >
              <div className="cx-filter">
                <div className="cx-categories" ref={rail}>
                  <i className="cx-rail-ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />
                  {categories.map((cat) => (
                    <button
                      className={`cx-category ${category === cat ? "active" : ""}`}
                      aria-pressed={category === cat}
                      key={cat}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <label className="cx-search">
                  <Search size={15} />
                  <input
                    aria-label={craft ? "Search products" : "Search the menu"}
                    placeholder={
                      craft ? "Find something lovely" : brand.searchHint || "Find your mood"
                    }
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
              <div className="cx-section-head">
                <h2>
                  {category === "All" ? "A little of everything" : category}
                </h2>
                <span>
                  {filtered.length} {craft ? "items" : "items"} to discover
                </span>
              </div>
              <div className="cx-grid">
                {filtered.map((item, index) => {
                  const dl = defaultLine(item);
                  const custom = hasOptions(item);
                  return (
                    <article
                      className={`cx-food ${item.available === false ? "unavailable" : ""}`}
                      key={item.id}
                    >
                      <button
                        type="button"
                        className="cx-food-visual"
                        aria-hidden="true"
                        tabIndex={-1}
                        disabled={item.available === false || !custom}
                        onClick={() => setSheet(item)}
                      >
                        {item.image ? (
                          <ProgressiveImage
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            width="1024"
                            height="1280"
                          />
                        ) : (
                          <div className="cx-food-fallback">
                            <UtensilsCrossed size={35} />
                          </div>
                        )}
                        {item.available === false ? (
                          <span className="cx-food-label">Back soon</span>
                        ) : (
                          index === 0 && category === "All" && (
                            <span className="cx-food-label">House favorite</span>
                          )
                        )}
                      </button>
                      <div className="cx-food-body">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="cx-food-foot">
                          <strong className="tnum">{peso(item.price)}</strong>
                          <div className="cx-food-actions">
                            {custom && item.available !== false && (
                              <button
                                type="button"
                                className="cx-customize"
                                aria-label={`Customize ${item.name}`}
                                onClick={() => setSheet(item)}
                              >
                                <SlidersHorizontal size={14} /> Customize
                              </button>
                            )}
                            {dl && item.available !== false ? (
                              <div className="cx-qty">
                                <button
                                  aria-label={`Remove one ${item.name}`}
                                  onClick={() => changeLine(sigOf(item.id, defaultSel(item)), -1)}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="cx-count">{dl.qty}</span>
                                <button
                                  aria-label={`Add one ${item.name}`}
                                  onClick={() => changeLine(sigOf(item.id, defaultSel(item)), 1)}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="cx-add"
                                aria-label={`Add ${item.name}`}
                                disabled={item.available === false}
                                onClick={(e) => {
                                  const r = e.currentTarget.closest(".cx-food")?.querySelector(".cx-food-visual")?.getBoundingClientRect();
                                  addLine(item.id, defaultSel(item), 1);
                                  navigator.vibrate?.(10);
                                  flyAdd(r, (item.image || "").replace(/\.jpg$/, "-sm.jpg"));
                                }}
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!filtered.length && (
                <p className="cx-no-results">
                  Nothing found. Try another mood.
                </p>
              )}
            </section>
            <div className="cx-scrim" hidden={!bagOpen} onClick={() => setBagOpen(false)} />
            <aside
              className={"cx-cart" + (bagOpen || checkout ? " is-open" : "")}
              id="customer-cart"
              aria-label="Your order"
            >
              <div className="cx-cart-grab" aria-hidden="true"><i /></div>
              <div className="cx-cart-title">
                <h2>Your order</h2>
                <span>{quantity} {quantity === 1 ? "item" : "items"}</span>
                <button type="button" className="cx-cart-close" aria-label="Close order" onClick={() => { setBagOpen(false); setCheckout(false); }}><X size={16} /></button>
              </div>
              <p className="cx-cart-sub">{contextLabel(context)}</p>
              {!quantity ? (
                <div className="cx-empty">
                  <ShoppingBag size={32} strokeWidth={1} />
                  <h3>Good things start here.</h3>
                  <p>
                    Add something you’ll love.
                    <br />
                    We’ll take care of the rest.
                  </p>
                </div>
              ) : (
                <>
                  {checkout && (
                    <>
                      <button
                        className="cx-checkout-back"
                        onClick={() => setCheckout(false)}
                      >
                        <ArrowLeft size={12} /> Back to your order
                      </button>
                      <h3 className="cx-payment-heading">
                        One last little thing.
                      </h3>
                      <div className="cx-inline-notice">
                        This is a demo. No payment details or real charges.
                      </div>
                    </>
                  )}
                  {items.map((item) => (
                    <div className="cx-cart-row" key={item.lineKey}>
                      <ProgressiveImage className="cx-cart-thumb" src={item.image} alt="" width="1024" height="1280" />
                      <div>
                        <h4>{item.name}</h4>
                        {item.summary.length > 0 && <small className="cx-cart-sum">{item.summary.join(" · ")}</small>}
                        <small className="tnum">{peso(item.price * item.qty)}</small>
                      </div>
                      <div className="cx-qty">
                        <button
                          aria-label={`Remove ${item.name} from order`}
                          onClick={() => changeLine(item.lineKey, -1)}
                        >
                          <Minus size={11} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          aria-label={`Increase ${item.name} in order`}
                          onClick={() => changeLine(item.lineKey, 1)}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!checkout && (
                    <label className="cx-note">
                      Anything we should know?
                      <textarea
                        value={note}
                        maxLength={200}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder={
                          craft
                            ? "Optional pickup request (demo)"
                            : "Extra ice, no straw…"
                        }
                      />
                    </label>
                  )}
                  {blocked && (
                    <p className="cx-inline-notice">
                      {context.table
                        ? "This example table is temporarily disabled."
                        : "Choose a table or pickup entry above before ordering."}
                    </p>
                  )}
                  {submitError && <p role="alert">{submitError}</p>}
                  <div className="cx-total">
                    <span>
                      Total <small>(VAT included)</small>
                    </span>
                    <strong><Odometer value={total} /></strong>
                  </div>
                  {checkout && (
                    <>
                      <div className="cx-payment-label">
                        How would you like to pay?
                      </div>
                      <div className="cx-payment">
                        {PROVIDERS.map(({ id: method, label }) => (
                          <button
                            className={payment === method ? "selected" : ""}
                            aria-pressed={payment === method}
                            key={method}
                            onClick={() => setPayment(method)}
                          >
                            {method === "Cash"
                              ? "Cash at counter"
                              : label + " · simulated"}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    className="cx-primary"
                    disabled={busy || blocked}
                    onClick={checkout ? placeOrder : () => setCheckout(true)}
                  >
                    {busy
                      ? "Sending your order…"
                      : checkout
                        ? offline
                          ? "Save order offline"
                          : "Place demo order"
                        : "Review your order"}
                    <ArrowUpRight size={15} />
                  </button>
                  <p className="cx-disclaimer">
                    {checkout
                      ? "Orders are simulated and stored only in this browser."
                      : "Freshly prepared, a few taps away. No account needed."}
                  </p>
                </>
              )}
            </aside>
          </div>
          {quantity > 0 && !checkout && (
            <button
              className="cx-mobile-bag"
              aria-expanded={bagOpen}
              onClick={() => setBagOpen(true)}
            >
              <span>
                <ShoppingBag size={16} />
                {quantity} {quantity === 1 ? "item" : "items"} · View order
              </span>
              <strong>{peso(total)}</strong>
            </button>
          )}
          {sheet && (
            <ItemSheet
              item={sheet}
              onClose={() => setSheet(null)}
              onAdd={(line, rect, src) => {
                addLine(line.id, line.sel, line.qty);
                navigator.vibrate?.(14);
                flyAdd(rect, src, 96);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

// "Continue with <provider>": uses only a verified provider route; otherwise shows
// truthful instructions. Opening, returning or claiming never marks an order paid.
function PayWith({ order, open, onContinue, onClose, onClaim }) {
  const p = provider(order.payment);
  const route = resolvePaymentRoute(order.payment, { orderId: order.id });
  const panel = React.useRef(null);
  React.useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);
  if (!p) return null;
  return (
    <section className="cx-pay" aria-label={"Pay with " + p.label}>
      <span className="cx-pay-badge">Simulation · No real payment</span>
      {route.kind === "hosted" ? (
        <a
          className="cx-primary"
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Continue with {p.label}
        </a>
      ) : (
        <button
          className="cx-primary"
          aria-expanded={open}
          onClick={open ? onClose : onContinue}
        >
          Continue with {p.label}
        </button>
      )}
      {open && route.kind === "instructions" && (
        <div className="cx-pay-fallback" ref={panel} tabIndex={-1}>
          <p>
            <strong>{route.reason}</strong>
          </p>
          <ol>
            {p.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>
            This demo shows no QR code or receiver number and collects no money.
            A screenshot is not proof of payment: only the cashier's check
            counts.
          </p>
          <button className="cx-back" onClick={onClose}>
            Back to my order
          </button>
        </div>
      )}
      <button className="cx-pay-claim" onClick={onClaim}>
        I’ve sent the demo payment
      </button>
    </section>
  );
}
