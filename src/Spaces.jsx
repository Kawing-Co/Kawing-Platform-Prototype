import CompanyWordmark from "./CompanyWordmark";
import {useDemoMotion, MotionControl, MotionGlyph, ConnectedVisit} from "./MotionExperience";
import React, { useState, useEffect, useRef, useId } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  Map,
  ShieldCheck,
  Users,
  LayoutGrid,
  Check,
  SlidersHorizontal,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import { CustomerPreview } from "./Viewport";
import Market from "./Market";
import {
  UndoHost,
  BackPreview,
  useEditorialMotion,
} from "./PremiumExperience";
import { transitionView } from "./premium";
import ProgressiveImage from "./ProgressiveImage";
import { BUSINESSES, BUSINESS_IDS } from "./businesses";
import {
  SCENARIOS,
  VIEWS,
  TIER_LABELS,
  viewLabel,
  parseSession,
  sessionHref,
  customizeTarget,
  readTier,
  hasStudioDraft,
  applyReset,
} from "./session";
import "./session.css";

const VIEW_ICONS = { merchant: Store, customer: Users, admin: ShieldCheck };
const VIEW_TAGS = {
  merchant: "CREATE & OPERATE",
  customer: "DISCOVER & ORDER",
  admin: "ORGANIZE & SUPPORT",
};
// What each view opens to, per scenario, so the choice is clear before entering.
const VIEW_COPY = {
  standard: {
    merchant: [
      "Opens Kawing Studio.",
      "Shape {business}'s business profile, menu and modules, then run orders and payment checks.",
    ],
    customer: [
      "Opens {business}'s finished page.",
      "Browse the menu, order and track a visit the way a guest would.",
    ],
    admin: [
      "Opens the operator overview.",
      "Review setup, packages and support for the fictional merchant.",
    ],
  },
  market: {
    merchant: [
      "Opens the booth map.",
      "Choose an open booth on the shared map, then prepare in My participation.",
    ],
    customer: [
      "Opens the event map.",
      "Find booths and open a business's profile and menu.",
    ],
    admin: [
      "Opens the organizer desk.",
      "Edit the layout, add event-only merchants and run the event lifecycle.",
    ],
  },
};

// Unsaved work lives in Kawing Studio (retained) or the market layout editor (discarded).
function confirmLeave(action) {
  if (window.kawingMapDirty)
    return confirm(
      `${action} and discard the unpublished demo layout draft? Published booths are kept.`,
    );
  if (window.kawingStudioDirty)
    return confirm(
      `${action}? Your unsaved Kawing Studio changes stay as a retained draft.`,
    );
  return true;
}

export default function Spaces({ Workspace }) {
  const motion=useDemoMotion();
  const initial = parseSession(location.search),
    [scenario, setScenario] = useState(initial.scenario),
    [view, setView] = useState(initial.view),
    [step, setStep] = useState(initial.step),
    [business, setBusiness] = useState(initial.business),
    [resets, setResets] = useState(0),
    [status, setStatus] = useState("");
  useEffect(() => {
    const change = () => {
      const s = parseSession(location.search);
      setScenario(s.scenario);
      setView(s.view);
      setStep(s.step);
      setBusiness(s.business);
    };
    window.addEventListener("popstate", change);
    return () => window.removeEventListener("popstate", change);
  }, []);
  useEditorialMotion();
  function go(next) {
    window.dispatchEvent(new Event("kawing:clear-undo"));
    transitionView(() => {
      const open = next.business ?? business;
      const destination = new URL(sessionHref(location.href, { ...next, business: open }));
      if (next.page) destination.hash = next.page;
      history.pushState(null, "", destination);
      setScenario(next.scenario || scenario);
      setView(next.view || null);
      setBusiness(open);
      setStep(parseSession(destination.search).step);
      setStatus("");
      if (next.page) window.dispatchEvent(new HashChangeEvent("hashchange"));
      window.scrollTo(0, 0);
      const nextStep = parseSession(destination.search).step;
      requestAnimationFrame(() => document.getElementById(nextStep === "scenario" ? "experience-choices" : nextStep === "view" ? "view-picker-title" : "demo-title")?.focus({preventScroll:true}));
    });
  }
  function enter(v, customize = false) {
    if (v !== view && step === "inside" && !confirmLeave("Switch view")) return;
    go({ scenario, view: v, customize });
  }
  function chooseBusiness(id) {
    if (id === business) return;
    if (step === "inside" && !confirmLeave("Switch business")) return;
    go({ scenario, view: step === "inside" ? view : null, business: id });
  }
  function chooseScenario() {
    if (step === "inside" && !confirmLeave("Change scenario")) return;
    go({ screen: "experiences" });
  }
  function goHome() {
    if (step === "inside" && !confirmLeave("Return to introduction")) return;
    go({});
  }
  function customize() {
    const target = customizeTarget(scenario, view);
    if (target.view === view)
      window.dispatchEvent(new Event("kawing:customize"));
    else enter(target.view, true);
  }
  function reset(options) {
    applyReset(scenario, options);
    window.kawingMapDirty = false;
    if (options.discardStudioDraft) window.kawingStudioDirty = false;
    setResets((n) => n + 1);
    setStatus(
      `${SCENARIOS[scenario].label} restored to its seeded fictional data.` +
        (scenario === "standard" &&
        !options.discardStudioDraft &&
        hasStudioDraft()
          ? " Your Kawing Studio draft was kept."
          : ""),
    );
  }
  if (initial.guest) return <Workspace />;
  // Preserve previously shared product deep links without making the new entry a gate.
  const legacy =
    !view && location.hash && !["#scenario", "#views"].includes(location.hash);
  if (legacy)
    return (
      <>
        <UndoHost />
        <Workspace />
      </>
    );
  if (step === "inside" && view)
    return (
      <>
        <UndoHost />
        <div
          className={
            "space-session space-" +
            view +
            // Legacy `?workspace=` links without a scenario keep the original demo bar.
            (new URLSearchParams(location.search).has("scenario")
              ? " modern-spaces"
              : "")
          }
        >
          <SessionHeader
            scenario={scenario}
            view={view}
            business={business}
            onBusiness={chooseBusiness}
            onView={(v) => enter(v)}
            onCustomize={customize}
            onScenario={chooseScenario}
            onHome={goHome}
            onReset={reset}
          />
          <p className="session-status" aria-live="polite">
            {status}
          </p>
          <React.Fragment key={resets}>
            {scenario === "standard" && view === "customer" ? (
              <CustomerPreview
                key={business}
                merchantId={business}
                merchantName={BUSINESSES[business].name}
              />
            ) : scenario === "market" ? (
              <Market key={view} role={view} />
            ) : (
              <Workspace key={view + business} space={view} />
            )}
          </React.Fragment>
        </div>
      </>
    );
  return (
    <>
      <UndoHost />
      <main data-page-hidden={!motion.pageVisible} data-motion={motion.enabled?"on":"off"} className={"spaces-landing premium-landing entry-mobile-first" + (step === "view" ? " view-picker" : "")}>
        <header className="spaces-brand">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
          >
            <CompanyWordmark />
          </a>
          <div className="entry-header-tools"><span>THE INTERACTIVE PRODUCT EXPERIENCE</span><MotionControl motion={motion}/></div>

        </header>
        {step === "landing" ? (
          <section className="demo-introduction" aria-labelledby="demo-title">
            <div className="demo-introduction-copy">
              <span className="demo-eyebrow">THE KAWING &amp; CO. PRODUCT DEMO</span>
              <div className="connection-badge"><MotionGlyph enabled={motion.enabled} loop/><span>Small businesses. Lasting connections.</span></div>
              <h1 id="demo-title" tabIndex={-1}>Good business.<br /><em>Closer connections.</em></h1>
              <p>See how one customer visit connects a branded menu, an order, the team behind it, and a reason to return.</p>
              <button className="demo-start" data-tactile onClick={() => go({ screen: "experiences" })}>Choose your experience <MotionGlyph name="nudge" enabled={motion.enabled} tone="light" className="motion-forward"/></button>
              <small>Interactive proposal · Fictional businesses · No real payments</small>
            </div>
            <div className="demo-purpose-card">
              <div className="logo-stage"><CompanyWordmark variant="stacked" /></div><span className="demo-eyebrow">MORE THAN A DIGITAL MENU</span>
              <h2>One visit.<br />Everyone connected.</h2>
              <ConnectedVisit motion={motion}/>
              <p className="demo-purpose-note">Try different views to see the same local demo data connect. A proposed three-month pilot would start with 3–5 establishments.</p>
            </div>
          </section>
        ) : step === "view" ? (
          <section className="selected-experience" aria-labelledby="view-picker-title">
            <span className="demo-eyebrow">{scenario === "market" ? "POP-UP MARKET · THE SUNDAY COMMONS" : "STANDARD MERCHANT · " + BUSINESSES[business].name.toUpperCase()}</span>
            <h1 id="view-picker-title" tabIndex={-1}>Choose your view.</h1>
            <p>{scenario === "standard" ? "Pick a business, then step into the experience." : "Explore a shared market as a merchant, customer, or admin."}</p>
          </section>
        ) : null}
        {step === "scenario" ? (
          <section className="experience-selection" aria-label="Demo experiences">
          <BackPreview onClick={goHome}>Back to introduction</BackPreview>
          <h1 id="experience-choices" tabIndex={-1}>What would you like to explore?</h1>
          <p>Choose one experience. Then choose whose view to try.</p>
          <div className="scenario-cards" data-reveal>
            <button
              onClick={() => go({ scenario: "standard" })}
              className="scenario-card merchant-scenario"
              data-magnetic
            >
              <div className="scenario-art" aria-hidden="true">
                <div className="art-split">
                  <ProgressiveImage src="/images/matcha/latte-iced.jpg" alt="" loading="lazy" width="1024" height="1280" />
                  <ProgressiveImage src="/images/usual/the-usual.jpg" alt="" loading="lazy" width="1170" height="1414" />
                </div>
                <span className="art-label">
                  <Check size={13} /> Two businesses, two looks
                </span>
              </div>
              <div className="scenario-card-copy">
                <span>01 / ONE BUSINESS</span>
                <h2>Standard Merchant</h2>
                <p>
                  One business. Its identity, customer experience, and everyday
                  operations. No booth map required.
                </p>
                <strong>
                  Explore a business <MotionGlyph name="nudge" enabled={motion.enabled} className="motion-forward"/>
                </strong>
              </div>
            </button>
            <button
              className="scenario-card market-scenario"
              data-magnetic
              onClick={() => go({ scenario: "market" })}
            >
              <div className="scenario-art map-art" aria-hidden="true">
                <ProgressiveImage
                  src="/images/market-stall.jpg"
                  alt=""
                  loading="lazy"
                  width="1536"
                  height="1024"
                />
                <span className="art-label">
                  <Map size={14} /> An interactive shared map
                </span>
              </div>
              <div className="scenario-card-copy">
                <span>02 / SHARED EVENT MAP</span>
                <h2>Pop-up Market</h2>
                <p>
                  A local market brought together. Explore demo booths, choose a
                  spot, and shape a shared event layout.
                </p>
                <strong>
                  Explore a market <MotionGlyph name="nudge" enabled={motion.enabled} className="motion-forward"/>
                </strong>
              </div>
            </button>
          </div>
          </section>
        ) : step === "view" ? (
          <>
            <BackPreview onClick={() => go({ screen: "experiences" })}>Back to scenarios</BackPreview>
            {scenario === "standard" && (
              <div className="business-picker" role="radiogroup" aria-label="Business">
                <span className="business-picker-label">Business</span>
                {BUSINESS_IDS.map((id) => {
                  const b = BUSINESSES[id];
                  return (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={business === id}
                      onClick={() => chooseBusiness(id)}
                    >
                      <ProgressiveImage src={b.previewPhoto.replace(/\.jpg$/, "-sm.jpg")} alt="" width="400" height="500" />
                      <span>
                        <b>{b.name}</b>
                        <small>{b.kind}</small>
                      </span>
                      {business === id && <Check size={16} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="space-role-cards">
              {VIEWS.map(([id, title]) => {
                const Icon = VIEW_ICONS[id];
                const [subtitle, desc] = VIEW_COPY[scenario][id].map((t) =>
                  t.replace("{business}", BUSINESSES[business].name),
                );
                return (
                  <button key={id} onClick={() => enter(id)}>
                    <span className="space-role-icon" aria-hidden="true">
                      <Icon size={26} />
                    </span>
                    <span className="space-role-tag">{VIEW_TAGS[id]}</span>
                    <h2>{title}</h2>
                    <strong>{subtitle}</strong>
                    <p>{desc}</p>
                    <span className="space-enter">
                      Enter {title}
                      <ArrowRight size={17} />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        <footer className="spaces-footer">
          <span>
            <span className="online-dot" /> Interactive demo · Fictional
            businesses · Browser-local data
            <a className="motion-credits" href="/motion/CREDITS.txt" target="_blank" rel="noopener noreferrer">Animation credits</a>
          </span>
          <CompanyWordmark variant="reversed" />
        </footer>
      </main>
    </>
  );
}

// A small disclosure menu: Escape or an outside click closes it and returns focus.
function Disclosure({ label, icon, className = "", children }) {
  const [open, setOpen] = useState(false),
    id = useId(),
    root = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector(".session-menu button")?.focus();
    const away = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    const key = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div className={"session-disclosure " + className} ref={root}>
      <button
        ref={trigger}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {icon}
        {label}
      </button>
      {open && (
        <div className="session-menu" id={id}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function SessionHeader({
  scenario,
  view,
  business = "salo",
  onBusiness = () => {},
  onView,
  onCustomize,
  onScenario,
  onHome,
  onReset,
}) {
  const [tier, setTier] = useState(() => readTier(undefined, business)),
    dialog = useRef(null),
    [discardDraft, setDiscardDraft] = useState(false),
    [draftExists, setDraftExists] = useState(false);
  useEffect(() => {
    const refresh = () => setTier(readTier(undefined, business));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("kawing:local-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("kawing:local-change", refresh);
    };
  }, [business]);
  const target = customizeTarget(scenario, view);
  function openReset(close) {
    close?.();
    setDiscardDraft(false);
    setDraftExists(scenario === "standard" && hasStudioDraft());
    dialog.current?.showModal();
  }
  const resetButton = (close) => (
    <button onClick={() => openReset(close)}>
      <RotateCcw size={15} aria-hidden="true" />
      Reset
    </button>
  );
  const scenarioButton = (close) => (
    <button
      onClick={() => {
        close?.();
        onScenario();
      }}
    >
      <LayoutGrid size={15} aria-hidden="true" />
      Change Scenario
    </button>
  );
  return (
    <header className="space-session-header">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          (onHome || onScenario)();
        }}
        className="space-wordmark"
        aria-label="Kawing demo: introduction"
      >
        <CompanyWordmark />
      </a>
      <p className="session-context" aria-label="Demo session">
        <span>{SCENARIOS[scenario].label}</span>
        {scenario === "standard" && (
          <>
            <span aria-hidden="true">·</span>
            <span className="session-business">{BUSINESSES[business].name}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className="session-tier">{TIER_LABELS[tier]} tier</span>
        <span aria-hidden="true">·</span>
        <strong>{viewLabel(view)}</strong>
        <small>SIMULATION</small>
      </p>
      <nav aria-label="Demo session">

        <Disclosure
          label="Switch View"
          icon={<Users size={15} aria-hidden="true" />}
        >
          {(close) => (
            <>
              {VIEWS.map(([id, title]) => {
                const Icon = VIEW_ICONS[id];
                return (
                  <button
                    key={id}
                    aria-current={id === view ? "true" : undefined}
                    onClick={() => {
                      close();
                      if (id !== view) onView(id);
                    }}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {title}
                    {id === view && <Check size={14} aria-label="current" />}
                  </button>
                );
              })}
              {scenario === "standard" && (
                <>
                  <span className="session-menu-label">Business</span>
                  {BUSINESS_IDS.map((id) => (
                    <button
                      key={id}
                      aria-current={id === business ? "true" : undefined}
                      onClick={() => {
                        close();
                        onBusiness(id);
                      }}
                    >
                      <Store size={15} aria-hidden="true" />
                      {BUSINESSES[id].name}
                      {id === business && <Check size={14} aria-label="current" />}
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </Disclosure>
        <button onClick={onCustomize} title={"Open " + target.label}>
          <SlidersHorizontal size={15} aria-hidden="true" />
          Customize
        </button>
        <span className="session-wide">
          {scenarioButton()}
          {resetButton()}
        </span>
        <Disclosure
          className="session-more"
          label="More"
          icon={<MoreHorizontal size={15} aria-hidden="true" />}
        >
          {(close) => (
            <>
              {scenarioButton(close)}
              {resetButton(close)}
            </>
          )}
        </Disclosure>
      </nav>
      <dialog
        ref={dialog}
        className="session-dialog"
        aria-labelledby="session-reset-title"
      >
        <form method="dialog">
          <RotateCcw className="modal-symbol" aria-hidden="true" />
          <h2 id="session-reset-title">Reset {SCENARIOS[scenario].label}?</h2>
          <p>
            {scenario === "market"
              ? "Restores The Sunday Commons map, booths, assignments, event-only merchants, their orders and the event lifecycle. Any unpublished layout draft is discarded. The Standard Merchant businesses' records are kept."
              : "Restores Matcha Mood's and the usual.'s seeded menus, orders, loyalty, engagement, saved designs and packages, and clears this browser's carts and last receipts. Pop-up Market records are kept."}
          </p>
          {draftExists && (
            <label className="session-check">
              <input
                type="checkbox"
                checked={discardDraft}
                onChange={(e) => setDiscardDraft(e.target.checked)}
              />
              Also discard the unsaved Kawing Studio draft
            </label>
          )}
          <p className="session-note">
            Fictional data in this browser only. Nothing is sent anywhere.
          </p>
          <div className="modal-buttons">
            <button value="cancel" className="space-secondary" autoFocus>
              Keep exploring
            </button>
            <button
              value="reset"
              className="space-primary"
              onClick={() =>
                onReset({ discardStudioDraft: draftExists && discardDraft })
              }
            >
              Reset {SCENARIOS[scenario].short}
            </button>
          </div>
        </form>
      </dialog>
    </header>
  );
}
