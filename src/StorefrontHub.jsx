import { receiptKey } from "./experience";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Gift,
  Wifi,
  MessageSquare,
  Star,
  Instagram,
  Facebook,
  Gamepad2,
  Tag,
  ShoppingBag,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Clock3,
  UserRound,
  Home,
  UtensilsCrossed,
  RefreshCw,
} from "lucide-react";
import Customer from "./Customer";
import { ASSETS } from "./merchant";
import ProgressiveImage from "./ProgressiveImage";
import "./ds/hub.css";
import {
  labels,
  themeTokens,
  contextLabel,
  balance,
  event,
  redeem,
  uid,
  safeUrl,
  paymentLabel,
} from "./commerce";
import "./storefront.css";
const icons = {
  order: UtensilsCrossed,
  loyalty: Gift,
  promotions: Tag,
  wifi: Wifi,
  review: Star,
  feedback: MessageSquare,
  social: Heart,
  game: Gamepad2,
};
export default function StorefrontHub({
  data,
  update,
  onSubmit,
  onAction,
  navigate,
  context,
  setContext,
  preview = false,
  configOverride,
  brandOverride,
  startMenu = false,
  onEdit,
  selectedEdit,
}) {
  const c = configOverride || data.storefront,
    b = brandOverride || data.brand;
  const [pane, setPane] = useState(startMenu ? "order" : "home"),
    [notice, setNotice] = useState(""),
    [receiptVersion, setReceiptVersion] = useState(0),
    [showReceipt, setShowReceipt] = useState(false);
  const focus = useRef(null);
  const reviewView = useRef(null);
  const emit = (type, detail = "") => {
    if (!preview) update((d) => event(d, type, detail));
  };
  useEffect(() => {
    if (!preview) emit("storefront_visit");
  }, []);
  useEffect(() => {
    if (
      !["home", "order"].includes(pane) &&
      (!c.modules.some((m) => m.type === pane && m.enabled) ||
        (pane === "loyalty" && !c.loyalty.enabled))
    )
      setPane("home");
  }, [c.modules, c.loyalty.enabled, pane]);
  useEffect(() => {
    if (!preview && pane !== "home") focus.current?.focus();
  }, [pane]);
  function open(type) {
    if (preview && onEdit) {
      onEdit(type);
      return;
    }
    if (
      type !== "order" &&
      (!c.modules.some((m) => m.type === type && m.enabled) ||
        (type === "loyalty" && !c.loyalty.enabled))
    )
      return;
    if (preview && type === "order") {
      setNotice("Live design preview. Open customer mode to place an order.");
      return;
    }
    setPane(type);
    setNotice("");
    emit(type === "order" ? "menu_open" : type + "_open");
    if (type === "review") {
      reviewView.current = uid();
      emit("review_view", reviewView.current);
    }
    if (type === "promotions" && c.promotion.active)
      emit("promotion_impression");
  }
  const guest = data.accounts.find((a) => a.id === data.guestId),
    points = balance(data),
    latest = data.orders.find(
      (o) => !o.seed && o.merchantId === (data.merchantId || "salo"),
    );
  const enabled = c.modules.filter(
    (m) =>
      m.enabled &&
      m.type !== "order" &&
      (m.type !== "loyalty" || c.loyalty.enabled),
  );
  const featured = enabled.find((m) => m.type === c.featured);
  function trackOrder() {
    if (!latest) return;
    try {
      localStorage.setItem(receiptKey(data.merchantId), latest.id);
    } catch {}
    setReceiptVersion((v) => v + 1);
    open("order");
  }
  function external(url, platform, label) {
    const checked = safeUrl(url, platform);
    emit(
      platform === "Google Review" ? "review_click" : "social_click",
      platform === "Google Review" ? reviewView.current : label,
    );
    if (checked) {
      window.open(checked, "_blank", "noopener,noreferrer");
      setNotice(
        "Opened the configured destination. A click does not confirm an external action.",
      );
    } else
      setNotice(
        "Demo destination only. No fictional business profile was opened and no review was posted.",
      );
  }
  const promoActive =
    c.promotion.active &&
    c.promotion.start <= new Date().toISOString().slice(0, 10) &&
    c.promotion.end >= new Date().toISOString().slice(0, 10);
  const count = latest ? latest.items.reduce((s, i) => s + i.qty, 0) : 0;
  return (
    <div
      className={`sf-shell sf-${c.layout} sf-menu-${c.theme.menu} sf-cards-${c.theme.cards} sf-modules-${c.theme.modules} sf-hero-${c.theme.hero} ${preview ? (onEdit ? "sf-editor-preview" : "sf-preview") : ""}`}
      style={themeTokens(c)}
      onClickCapture={(e) => {
        if (!onEdit) return;
        const node = e.target.closest("[data-edit-id]");
        if (node) {
          e.preventDefault();
          e.stopPropagation();
          onEdit(node.dataset.editId);
        }
      }}
    >
      {!preview && (
        <div className="sf-demo-context">
          <span>DEMO ENTRY · NOT CUSTOMER IDENTITY</span>
          <label>
            Entry context
            <select
              aria-label="Entry context"
              value={
                context.table
                  ? `${context.kind}:${context.table}`
                  : context.kind
              }
              onChange={(e) => {
                const [kind, table] = e.target.value.split(":");
                setContext({ kind, table: table || null });
              }}
            >
              <option value="shared">Shared merchant URL</option>
              <option value="table:05">Table QR · 05</option>
              <option value="table:03">Table QR · 03</option>
              <option value="nfc:08">NFC · Table 08</option>
              <option value="counter">Counter pickup</option>
              <option value="takeaway">Takeaway pickup</option>
            </select>
          </label>
        </div>
      )}
      <div className="sf-context">
        <span>
          <Leaf size={14} /> {contextLabel(context)}
        </span>
        <span>Made local. Connected by Kawing.</span>
      </div>
      {latest && !preview && (
        <button className="sf-current" onClick={trackOrder}>
          <Clock3 size={18} />
          <span>
            <strong>
              Your current order ·{" "}
              {latest.status === "served"
                ? "Served"
                : latest.status === "new"
                  ? "Received"
                  : latest.status}
            </strong>
            <small>
              {count} items · {paymentLabel(latest)}
            </small>
          </span>
          <ArrowRight size={17} />
        </button>
      )}
      {pane === "home" ? (
        <>
          <header
            className={
              "sf-brand-hero " +
              (selectedEdit === "brand" ? "edit-selected" : "")
            }
            data-edit-id="brand"
          >
            {onEdit && (
              <button
                className="sf-edit-handle"
                aria-label="Edit business identity"
                data-edit-id="brand"
              >
                Edit identity
              </button>
            )}
            {c.layout !== "minimal" && (
              <div className="sf-hero-media" aria-hidden="true">
                <ProgressiveImage
                  className="sf-cover"
                  src={c.cover}
                  alt=""
                  width="1024"
                  height="1280"
                />
              </div>
            )}
            <div className="sf-brand-copy">
              <img
                className="sf-logo"
                src={c.logo}
                alt={`${b.name} logo demo`}
              />
              <div className="sf-kicker">
                {b.category === "Crafts"
                  ? "MADE BY YOUR NEIGHBORS"
                  : "YOUR NEIGHBORHOOD TABLE"}
              </div>
              <h1>{b.name || "Your restaurant"}</h1>
              <p>{b.tagline}</p>
              <div className="sf-welcome">
                {guest
                  ? `Welcome back, ${guest.name}. ${Math.max(0, c.loyalty.threshold - points)} stamps to your next reward.`
                  : "A little familiar. A little extraordinary."}
              </div>
              <button
                className="sf-primary"
                aria-label="Order now"
                data-edit-id="order"
                onClick={() => open("order")}
              >
                Order now <ArrowRight size={19} />
              </button>
              {c.layout === "minimal" && (
                <button className="sf-plain" onClick={() => open("order")}>
                  View menu
                </button>
              )}
            </div>
          </header>
          {(b.bio || b.hours || b.address || b.contact) && (
            <section className="sf-business-details" data-edit-id="business">
              {onEdit && (
                <button
                  className="sf-edit-handle"
                  aria-label="Edit business details"
                  data-edit-id="business"
                >
                  Edit details
                </button>
              )}
              <span>{b.category || "LOCAL BUSINESS"}</span>
              {b.bio && <p>{b.bio}</p>}
              <div>
                {b.hours && (
                  <p>
                    <strong>Hours</strong>
                    {b.hours}
                  </p>
                )}
                {b.address && (
                  <p>
                    <strong>Find us</strong>
                    {b.address}
                  </p>
                )}
                {b.contact && (
                  <p>
                    <strong>Contact</strong>
                    {b.contact}
                  </p>
                )}
              </div>
            </section>
          )}
          {Array.isArray(c.galleryAssets) && c.galleryAssets.length > 0 && (
            <section
              className="sf-business-gallery"
              data-edit-id="gallery"
              aria-label="Business gallery"
            >
              {onEdit && (
                <button
                  className="sf-edit-handle"
                  aria-label="Edit business gallery"
                  data-edit-id="gallery"
                >
                  Edit gallery
                </button>
              )}
              {c.galleryAssets
                .filter((src) => ASSETS.covers.includes(src))
                .map((src, i) => (
                  <img key={i} src={src} alt={"Business gallery " + (i + 1)} />
                ))}
            </section>
          )}
          {c.layout === "visual" && (
            <div className="sf-featured-products">
              {data.menu
                .filter((m) => m.available)
                .slice(0, 2)
                .map((m) => (
                  <button key={m.id} onClick={() => open("order")}>
                    <img src={m.image} alt={m.name} />
                    <span>
                      {m.name}
                      <strong>₱{m.price}</strong>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
            </div>
          )}
          {featured && (
            <button
              className="sf-featured-module"
              onClick={() => open(featured.type)}
            >
              <Gift size={24} />
              <span>
                <small>FEATURED FOR YOU</small>
                <strong>{featured.title}</strong>
                <small>
                  {featured.description ||
                    "A little extra from your neighborhood kitchen."}
                </small>
              </span>
              <ArrowRight size={18} />
            </button>
          )}
          {promoActive &&
            c.promotion.placement === "hub" &&
            enabled.some((m) => m.type === "promotions") && (
              <button
                className={
                  "sf-promo-teaser " +
                  (selectedEdit === "promotions" ? "edit-selected" : "")
                }
                data-edit-id="promotions"
                onClick={() => open("promotions")}
              >
                <img src={c.promotion.image} alt="" />
                <span>
                  <small>FROM OUR KITCHEN · {c.promotion.kind}</small>
                  <strong>{c.promotion.title}</strong>
                  <span>
                    Discover the offer <ArrowRight size={13} />
                  </span>
                </span>
              </button>
            )}
          <div className="sf-services-heading">
            <h2>
              {c.layout === "minimal"
                ? "Good to know"
                : "Make yourself at home"}
            </h2>
            <span>More from {b.name}</span>
          </div>
          <div className="sf-services">
            {enabled.map((m) => {
              const Icon = icons[m.type];
              return (
                <button
                  key={m.id}
                  data-edit-id={m.type}
                  data-k-reveal=""
                  className={
                    (selectedEdit === m.type ? "edit-selected " : "") +
                    (m.type === "loyalty" ? "is-loyalty" : "")
                  }
                  onClick={() => open(m.type)}
                  aria-label={m.cta || m.title}
                >
                  <span className="sf-service-icon">
                    <Icon size={22} />
                  </span>
                  <span>
                    <strong>{m.cta || m.title}</strong>
                    <small>
                      {m.description ||
                        {
                          loyalty: "Little visits. Lovely rewards.",
                          wifi: "The details, without the ask.",
                          review: "Share your experience, openly.",
                          feedback: "A private note to our team.",
                          social: "Stay a little more connected.",
                          promotions: "Fresh reasons to come back.",
                          game: "A small pause for play.",
                        }[m.type]}
                    </small>
                    {m.type === "loyalty" && (
                      <span className="sf-stamps" aria-hidden="true">
                        {Array.from({ length: c.loyalty.threshold }, (_, i) => (
                          <i key={i} className={i < points ? "on" : ""} />
                        ))}
                      </span>
                    )}
                  </span>
                  <ArrowRight size={17} />
                </button>
              );
            })}
          </div>
          <p className="sf-footnote">
            One scan opens the door. Kawing connects the visit to orders, your
            team, and a lasting customer relationship.
          </p>
        </>
      ) : (
        <section className="sf-module-page" key={pane}>
          <button className="sf-back" onClick={() => setPane("home")}>
            <ArrowLeft size={16} /> Back to Business Profile
          </button>
          <h2 tabIndex={-1} ref={focus} className={"sf-module-title" + (pane === "order" ? " is-order" : "")}>
            {pane === "order"
              ? "Something good starts here."
              : c.modules.find((m) => m.type === pane)?.title || labels[pane]}
          </h2>
          {pane === "order" && (
            <Customer
              key={context.kind + context.table + receiptVersion}
              onReceiptChange={setShowReceipt}
              merchantId={data.merchantId || "salo"}
              menu={data.menu}
              brand={b}
              orders={data.orders}
              onSubmit={onSubmit}
              offline={data.offline}
              onNavigate={navigate}
              context={context}
              tables={c.tables}
              onAction={onAction}
              policy={data.operations.policy}
              onCartStart={() => emit("cart_start")}
            />
          )}
          {pane === "loyalty" && (
            <Loyalty
              data={data}
              c={c}
              update={preview ? () => {} : update}
              preview={preview}
              notify={setNotice}
            />
          )}
          {pane === "wifi" && (
            <div className="sf-detail">
              <Wifi className="sf-large-icon" />
              <h3>{c.wifi.name}</h3>
              <p>{c.wifi.instructions}</p>
              <label>
                Fictional demonstration password<code>{c.wifi.password}</code>
              </label>
              <button
                className="sf-primary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(c.wifi.password);
                    setNotice(
                      "Fictional password copied. Open your Wi-Fi settings to choose a network.",
                    );
                  } catch {
                    setNotice(
                      "Clipboard unavailable. Select and copy the password shown above.",
                    );
                  }
                }}
              >
                <Copy size={17} /> Copy demo password
              </button>
              <p className="sf-honest">
                A website cannot universally connect your phone to Wi-Fi. No
                real network or credentials are provided. Ask staff if your
                device needs help.
              </p>
            </div>
          )}
          {pane === "review" && (
            <div className="sf-detail">
              <Star className="sf-large-icon" />
              <h3>Every experience is welcome.</h3>
              <p>
                Share an honest review, or leave a private note separately.
                Rewards never depend on reviewing us.
              </p>
              <button
                className="sf-primary"
                onClick={() => external(c.reviewUrl, "Google Review", "google")}
              >
                {c.reviewLabel}
                <ExternalLink size={17} />
              </button>
              <p className="sf-honest">
                {c.reviewUrl
                  ? "Opens a merchant-configured Google destination."
                  : "Demo destination · This fictional restaurant has no configured Google Business Profile."}{" "}
                A click is not a submitted review.
              </p>
            </div>
          )}
          {pane === "social" && (
            <div className={`sf-social sf-social-${c.socialStyle}`}>
              <p>
                Our stories, beyond the table. Blank destinations are labeled
                demonstrations.
              </p>
              {c.socials
                .filter((l) => l.enabled)
                .map((l, i) => (
                  <button
                    key={i}
                    onClick={() => external(l.url, l.platform, l.platform)}
                  >
                    {l.platform === "Instagram" ? (
                      <Instagram />
                    ) : l.platform === "Facebook" ? (
                      <Facebook />
                    ) : (
                      <ExternalLink />
                    )}
                    <span>
                      {l.platform}
                      <small>
                        {l.label} ·{" "}
                        {l.url ? "External destination" : "Demo destination"}
                      </small>
                    </span>
                    <ExternalLink size={16} />
                  </button>
                ))}
            </div>
          )}
          {pane === "feedback" && (
            <Feedback
              submit={(record) => {
                if (preview) return;
                update((d) =>
                  event(
                    {
                      ...d,
                      feedback: [
                        { ...record, id: uid(), status: "new" },
                        ...d.feedback,
                      ],
                    },
                    "feedback_submit",
                  ),
                );
                setNotice(
                  "Private demo feedback saved in this browser. No message was sent externally.",
                );
              }}
              preview={preview}
            />
          )}
          {pane === "promotions" &&
            (promoActive ? (
              <article className="sf-offer">
                <img src={c.promotion.image} alt="Featured food" />
                <span>MERCHANT-OWNED · {c.promotion.kind}</span>
                <h3>{c.promotion.title}</h3>
                <p>{c.promotion.description}</p>
                <strong>{c.promotion.price}</strong>
                <p>
                  Demo code: <code>{c.promotion.code}</code> · Display dates{" "}
                  {c.promotion.start}–{c.promotion.end}
                </p>
                <button
                  className="sf-primary"
                  onClick={() => {
                    emit("promotion_click");
                    open("order");
                  }}
                >
                  {c.promotion.cta}
                  <ArrowRight size={17} />
                </button>
                <p className="sf-honest">
                  Illustrative campaign; prices at checkout remain unchanged. No
                  automatic discount or order attribution is claimed.
                </p>
              </article>
            ) : (
              <div className="sf-detail">
                <Tag className="sf-large-icon" />
                <h3>Good things are on their way.</h3>
                <p>
                  No active offers for today. Our regular menu is always a good
                  place to start.
                </p>
              </div>
            ))}
          {pane === "game" && (
            <MemoryGame onStart={() => emit("game_session")} />
          )}
        </section>
      )}
      {pane === "order" &&
        showReceipt &&
        latest?.status === "served" &&
        promoActive &&
        c.promotion.placement === "after-order" &&
        enabled.some((m) => m.type === "promotions") && (
          <button
            className={
              "sf-promo-teaser " +
              (selectedEdit === "promotions" ? "edit-selected" : "")
            }
            data-edit-id="promotions"
            onClick={() => open("promotions")}
          >
            <img src={c.promotion.image} alt="" />
            <span>
              <small>MERCHANT-OWNED · AFTER YOUR VISIT</small>
              <strong>{c.promotion.title}</strong>
              <span>
                Discover the offer <ArrowRight size={13} />
              </span>
            </span>
          </button>
        )}
      {notice && (
        <div role="status" className="sf-notice">
          <Check size={16} />
          {notice}
          <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {(!preview || onEdit) && (
        <nav className="sf-bottom-nav" aria-label="Customer navigation">
          <button
            onClick={() => setPane("home")}
            aria-current={pane === "home" ? "page" : undefined}
          >
            <Home size={19} />
            Home
          </button>
          <button
            onClick={() => open("order")}
            aria-current={pane === "order" ? "page" : undefined}
          >
            <UtensilsCrossed size={19} />
            Menu
          </button>
          {enabled.some((m) => m.type === "loyalty") && (
            <button onClick={() => open("loyalty")}>
              <Gift size={19} />
              Rewards
            </button>
          )}
          {latest && (
            <button onClick={trackOrder}>
              <Clock3 size={19} />
              Order status
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
function Feedback({ submit, preview }) {
  const [sent, setSent] = useState(false);
  return sent ? (
    <div className="sf-detail">
      <Check className="sf-large-icon" />
      <h3>Thank you for the note.</h3>
      <p>
        It’s private to this browser’s demo inbox. Your public review option
        remains available, whatever your experience.
      </p>
      <button className="sf-plain" onClick={() => setSent(false)}>
        Write another fictional note
      </button>
    </div>
  ) : (
    <form
      className="sf-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (f.get("contact") && !f.get("consent")) return;
        submit(Object.fromEntries(f));
        setSent(true);
      }}
    >
      <p>
        A private note to the team. Use fictional information only. All fields
        are optional; no contact is required.
      </p>
      <label>
        How was your visit? (optional)
        <select name="rating">
          <option value="">Prefer not to rate</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </label>
      <label>
        Category
        <select name="category">
          {[
            "Food and drinks",
            "Staff service",
            "Waiting time",
            "Cleanliness",
            "Ordering experience",
            "Other",
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        Your fictional feedback
        <textarea
          name="message"
          maxLength={500}
          placeholder="What could we do better?"
        />
      </label>
      <label>
        Fictional contact (optional)
        <input
          name="contact"
          type="email"
          placeholder="guest@example.test"
          onInput={(e) =>
            (e.currentTarget.form.querySelector("[name=consent]").required =
              !!e.currentTarget.value)
          }
        />
      </label>
      <label className="sf-check">
        <input type="checkbox" name="consent" /> I consent to follow-up in this
        fictional demo. No contact is actually sent.
      </label>
      <button className="sf-primary" disabled={preview}>
        Send private demo feedback <ArrowRight size={17} />
      </button>
    </form>
  );
}
function Loyalty({ data, c, update, preview, notify }) {
  const account = data.accounts.find((a) => a.id === data.guestId),
    points = Math.max(0, balance(data)),
    threshold = c.loyalty.threshold;
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState(false);
  function recover(e) {
    e.preventDefault();
    if (
      email === "alex@example.test" &&
      code === "246810" &&
      data.accounts.some((a) => a.id === "alex")
    ) {
      update((d) => event({ ...d, guestId: "alex" }, "loyalty_return"));
      notify(
        "Demo account linked after simulated code verification. No real email was sent.",
      );
      setChallenge(false);
    } else
      notify("That demo email/code does not match. No account was restored.");
  }
  return (
    <>
      <div className={`sf-loyalty-card sf-loyalty-${c.loyalty.card}`}>
        <span>THE {data.brand.name.toUpperCase()} LITTLE THANK-YOU</span>
        <div>
          <img src={c.logo} alt="Merchant logo" />
          <h3>{account ? account.name : "Guest"}’s loyalty card</h3>
        </div>
        <p>
          {c.loyalty.reward} · {threshold} stamps
        </p>
        <div className="sf-stamps">
          {Array.from({ length: threshold }, (_, i) => (
            <span key={i} className={i < points ? "stamped" : ""}>
              {i < points ? <Check size={20} /> : i + 1}
            </span>
          ))}
        </div>
        <strong>
          {account
            ? `${points} stamps · ${Math.floor(points / threshold)} rewards available`
            : "Join the fictional loyalty demo to collect stamps."}
        </strong>
        <small>
          One stamp per eligible, cashier-confirmed, completed order. No review
          is required.
        </small>
      </div>
      {!account ? (
        <div className="sf-detail">
          <h3>A familiar face, next time.</h3>
          <p>
            Try Alex’s fictional account with 7 sample opening stamps. We
            remember the account in this browser only; no fingerprinting.
          </p>
          <button
            className="sf-primary"
            disabled={preview}
            onClick={() =>
              update((d) => event({ ...d, guestId: "alex" }, "loyalty_enroll"))
            }
          >
            Try Alex’s demo loyalty account <UserRound size={17} />
          </button>
        </div>
      ) : (
        <div className="sf-detail">
          <button
            className="sf-primary"
            disabled={preview || !c.loyalty.enabled || points < threshold}
            onClick={() => {
              update((d) => redeem(d));
              notify(
                "Demo reward redeemed and recorded in the loyalty ledger.",
              );
            }}
          >
            Redeem reward <Gift size={17} />
          </button>
          <button
            className="sf-plain"
            disabled={preview}
            onClick={() => {
              update((d) => ({ ...d, guestId: null }));
              notify(
                "This browser forgot the account link. The fictional local account still exists.",
              );
            }}
          >
            Forget account on this browser
          </button>
        </div>
      )}
      <details className="sf-recovery">
        <summary>Recover a demo loyalty account</summary>
        <p>
          If the account remains in this browser’s demo store, a fictional inbox
          code can re-link it. Clearing all browser data removes these records;
          nothing can be restored from a server.
        </p>
        <form className="sf-form" onSubmit={recover}>
          <label>
            Demo email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.test"
              required
            />
          </label>
          <button
            type="button"
            className="sf-plain"
            disabled={preview}
            onClick={() => setChallenge(true)}
          >
            Show simulated inbox
          </button>
          {challenge && (
            <p role="status">
              Fictional inbox for alex@example.test: <b>246810</b>. This is a
              displayed demonstration code, not authentication.
            </p>
          )}
          <label>
            Recovery code
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
          <button className="sf-primary" disabled={preview || !challenge}>
            Verify demo code
          </button>
        </form>
      </details>
      <div className="sf-detail">
        <h3>Rewards history</h3>
        {data.ledger
          .filter((l) => l.guestId === data.guestId)
          .map((l) => (
            <p key={l.id}>
              {l.amount > 0 ? "+" : ""}
              {l.amount} · {l.reason}
            </p>
          ))}
        <p className="sf-honest">
          Apple Wallet / Google Wallet passes and tier programs are future
          concepts, not active integrations.
        </p>
      </div>
    </>
  );
}
const symbols = ["☕", "🍋", "🥑", "🌿", "☕", "🍋", "🥑", "🌿"];
function MemoryGame({ onStart }) {
  const [open, setOpen] = useState([]),
    [matched, setMatched] = useState([]),
    [moves, setMoves] = useState(0),
    [started, setStarted] = useState(false);
  const busy = open.length === 2;
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    if (symbols[a] === symbols[b]) {
      setMatched((m) => [...m, a, b]);
      setOpen([]);
      return;
    }
    const t = setTimeout(() => setOpen([]), 650);
    return () => clearTimeout(t);
  }, [open]);
  function flip(i) {
    if (busy || open.includes(i) || matched.includes(i)) return;
    if (!started) {
      onStart();
      setStarted(true);
    }
    if (open.length === 1) setMoves((m) => m + 1);
    setOpen((v) => [...v, i]);
  }
  return (
    <div className="sf-game">
      <Gamepad2 className="sf-large-icon" />
      <h3>The little café match</h3>
      <p>
        Find four matching pairs. Tap two cards at a time. No timer, prizes, or
        ads—just a small pause.
      </p>
      <div className="sf-game-grid">
        {symbols.map((s, i) => (
          <button
            key={i}
            aria-label={`Card ${i + 1}${matched.includes(i) ? " matched " + s : open.includes(i) ? " " + s : ""}`}
            aria-pressed={open.includes(i) || matched.includes(i)}
            disabled={matched.includes(i)}
            onClick={() => flip(i)}
          >
            {open.includes(i) || matched.includes(i) ? s : "✳"}
          </button>
        ))}
      </div>
      <p role="status">
        {matched.length === 8
          ? `All paired. Nicely done in ${moves} moves!`
          : `${matched.length / 2} of 4 pairs · ${moves} moves`}
      </p>
      <button
        className="sf-primary"
        onClick={() => {
          setOpen([]);
          setMatched([]);
          setMoves(0);
          setStarted(false);
        }}
      >
        <RefreshCw size={17} /> Restart puzzle
      </button>
    </div>
  );
}
