import CompanyWordmark from "./CompanyWordmark";
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
  PremiumShell,
  CommandTrigger,
  ProductStory,
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
  function commandNavigate(a) {
    if (step === "inside" && !confirmLeave("Open " + a.name)) return;
    go({
      scenario: a.page ? "standard" : a.scenario || scenario,
      view: a.scenario ? null : a.view,
      page: a.page,
    });
  }
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
      setStep(next.view ? "inside" : next.scenario ? "view" : "scenario");
      setStatus("");
      if (next.page) window.dispatchEvent(new HashChangeEvent("hashchange"));
      window.scrollTo(0, 0);
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
        <PremiumShell navigate={commandNavigate} />
        <Workspace />
      </>
    );
  if (step === "inside" && view)
    return (
      <>
        <PremiumShell navigate={commandNavigate} />
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
      <PremiumShell navigate={commandNavigate} />
      <main className="spaces-landing premium-landing">
        <header className="spaces-brand">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              chooseScenario();
            }}
          >
            <CompanyWordmark />
          </a>
          <span>THE INTERACTIVE PRODUCT EXPERIENCE</span>
          <CommandTrigger />
        </header>
        <div className={"spaces-intro" + (step === "view" ? " is-compact" : "")}>
          <div className="spaces-collage" aria-hidden="true">
            {[
              ["c1", "/images/matcha/latte-iced.jpg", "Matcha Mood", "Matcha café"],
              ["c2", "/images/usual/the-usual.jpg", "the usual.", "Neighbourhood coffee bar"],
              ["c3", "/images/market-stall.jpg", "The Sunday Commons", "Pop-up market"],
            ].map(([cls, src, name, kind]) => (
              <figure className={cls} key={cls}>
                <ProgressiveImage src={src} alt="" loading="lazy" width="1024" height="1280" />
                <figcaption>
                  <b>{name}</b>
                  <small>{kind}</small>
                </figcaption>
              </figure>
            ))}
          </div>
          <ol className="spaces-step" aria-label="Demo entry steps">
            <li aria-current={step === "scenario" ? "step" : undefined}>
              <span className={step === "scenario" ? "current" : "done"}>
                {step === "view" ? <Check size={13} /> : 1}
              </span>
              Choose scenario
            </li>
            <i aria-hidden="true" />
            <li aria-current={step === "view" ? "step" : undefined}>
              <span className={step === "view" ? "current" : ""}>2</span>Choose
              your view
            </li>
          </ol>
          <span className="spaces-eyebrow">
            {step === "scenario"
              ? "ONE PLATFORM. DIFFERENT POSSIBILITIES."
              : scenario === "market"
                ? "POP-UP MARKET · THE SUNDAY COMMONS"
                : "STANDARD MERCHANT · " + BUSINESSES[business].name.toUpperCase()}
          </span>
          <h1>
            {step === "scenario" ? (
              <>
                Good business.
                <br />
                <em>Closer connections.</em>
              </>
            ) : (
              <>
                One experience.
                <br />
                <em>Three perspectives.</em>
              </>
            )}
          </h1>
          <p>
            {step === "scenario"
              ? "A welcome for your guests. A clear rhythm for your team. One thoughtfully connected place to run it all."
              : "Choose a view and jump straight in. Everything is seeded, fictional and simulated, with no account or lengthy setup. Packages and setup live inside each view."}
          </p>
        </div>
        {step === "scenario" ? (
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
                  Explore a business <ArrowRight size={18} />
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
                  Explore a market <ArrowRight size={18} />
                </strong>
              </div>
            </button>
          </div>
        ) : (
          <>
            <BackPreview onClick={() => go({})}>Back to scenarios</BackPreview>
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
        )}
        {step === "scenario" && <ProductStory />}
        <footer className="spaces-footer">
          <span>
            <span className="online-dot" /> Interactive demo · Fictional
            businesses · Browser-local data
          </span>
          <span>Good business, connected.</span>
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
          onScenario();
        }}
        className="space-wordmark"
        aria-label="Kawing demo: choose a scenario"
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
        <CommandTrigger />
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
