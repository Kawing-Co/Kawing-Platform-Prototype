import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Command,
  Undo2,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Box,
  Check,
  Store,
  Map,
  Users,
  ShieldCheck,
  Palette,
  ReceiptText,
  ChartNoAxesCombined,
} from "lucide-react";
import { reducedMotion, inTriangle } from "./premium";
const SpatialCanvas = lazy(() => import("./SpatialCanvas"));
export function Skeleton({ label = "Loading preview" }) {
  return (
    <div className="premium-skeleton" role="status" aria-label={label}>
      <div className="sk-brand" />
      <div className="sk-line" />
      <div className="sk-line short" />
      <div className="sk-card" />
      <div className="sk-row" />
      <div className="sk-row" />
      <div className="sk-row" />
      <span>{label}…</span>
    </div>
  );
}
export function BackPreview({ children, onClick }) {
  return (
    <span className="back-preview">
      <button className="spaces-back" onClick={onClick}>
        <ArrowLeft size={16} />
        {children}
      </button>
      <span role="tooltip">
        Back to scenario selection<span>Your saved demo data stays here.</span>
      </span>
    </span>
  );
}
export function PremiumShell({ navigate }) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [group, setGroup] = useState("Spaces"),
    [toast, setToast] = useState(null),
    [active, setActive] = useState(0);
  const dialog = useRef(null),
    input = useRef(null),
    returnFocus = useRef(null),
    drag = useRef(null),
    pending = useRef(null),
    trail = useRef([]),
    pane = useRef(null),
    undoRef = useRef(null);
  const actions = [
    {
      name: "Merchant View",
      detail: "Kawing Studio and daily operations",
      group: "Spaces",
      icon: Store,
      view: "merchant",
    },
    {
      name: "Customer View",
      detail: "Browse and order as a guest",
      group: "Spaces",
      icon: Users,
      view: "customer",
    },
    {
      name: "Admin View",
      detail: "Setup, packages and support",
      group: "Spaces",
      icon: ShieldCheck,
      view: "admin",
    },
    {
      name: "Kawing Studio",
      detail: "Edit the Business Profile",
      group: "Create",
      icon: Palette,
      view: "merchant",
      page: "Customization",
    },
    {
      name: "Menu management",
      detail: "Availability and the daily catalog",
      group: "Create",
      icon: ReceiptText,
      view: "merchant",
      page: "Menu",
    },
    {
      name: "Staff orders",
      detail: "Cashier verification and fulfillment",
      group: "Operate",
      icon: ReceiptText,
      view: "merchant",
      page: "Orders",
    },
    {
      name: "Business analytics",
      detail: "Illustrative sales and performance",
      group: "Operate",
      icon: ChartNoAxesCombined,
      view: "merchant",
      page: "Analytics",
    },
    {
      name: "Customer engagement",
      detail: "Feedback and local activity",
      group: "Operate",
      icon: Users,
      view: "merchant",
      page: "Engagement",
    },
    {
      name: "Standard Merchant",
      detail: "One business, three perspectives",
      group: "Explore",
      icon: Store,
      scenario: "standard",
    },
    {
      name: "Pop-up Market",
      detail: "Booths and event operations",
      group: "Explore",
      icon: Map,
      scenario: "market",
    },
  ];
  const q = query.toLowerCase().trim(),
    shown = actions.filter((a) =>
      q
        ? (a.name + " " + a.detail).toLowerCase().includes(q)
        : a.group === group,
    );
  function close() {
    dialog.current?.close();
    setOpen(false);
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }
  function launch() {
    dialog.current?.style.removeProperty("--sheet-drag");
    returnFocus.current = document.activeElement;
    setQuery("");
    setActive(0);
    setOpen(true);
  }
  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? close() : launch();
      }
    };
    const trigger = () => launch();
    const undo = (e) => {
      undoRef.current = e.detail;
      setToast(e.detail);
    };
    const clear = () => {
      undoRef.current = null;
      setToast(null);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("kawing:commands", trigger);
    window.addEventListener("kawing:undo", undo);
    window.addEventListener("kawing:clear-undo", clear);
    window.addEventListener("hashchange", clear);
    window.addEventListener("popstate", clear);
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("kawing:commands", trigger);
      window.removeEventListener("kawing:undo", undo);
      window.removeEventListener("kawing:clear-undo", clear);
      window.removeEventListener("hashchange", clear);
      window.removeEventListener("popstate", clear);
      clearTimeout(pending.current);
    };
  }, [open]);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    }
  }, [open]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      undoRef.current = null;
      setToast(null);
    }, 9000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    setActive(0);
  }, [query, group]);
  function run(a) {
    close();
    navigate(a);
  }
  function aim(next, e) {
    clearTimeout(pending.current);
    const rect = pane.current?.getBoundingClientRect(),
      last = trail.current.at(-3);
    const p = { x: e.clientX, y: e.clientY };
    if (
      rect &&
      last &&
      p.x > last.x &&
      inTriangle(
        p,
        last,
        { x: rect.left, y: rect.top - 12 },
        { x: rect.left, y: rect.bottom + 12 },
      )
    ) {
      pending.current = setTimeout(() => setGroup(next), 220);
    } else setGroup(next);
  }
  function dismissDrag(e) {
    if (!drag.current) return;
    const distance = e.clientY - drag.current.y;
    if (distance > 90) close();
    else dialog.current?.style.removeProperty("--sheet-drag");
    drag.current = null;
  }
  return (
    <>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-label="Quick actions"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="command-sheet-handle"
          aria-hidden="true"
          onPointerDown={(e) => {
            drag.current = { y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current)
              dialog.current.style.setProperty(
                "--sheet-drag",
                Math.max(0, e.clientY - drag.current.y) + "px",
              );
          }}
          onPointerUp={dismissDrag}
          onPointerCancel={() => {
            drag.current = null;
            dialog.current?.style.removeProperty("--sheet-drag");
          }}
        >
          <i />
        </div>
        <header>
          <Search size={20} />
          <input
            ref={input}
            aria-label="Search actions"
            placeholder="Where would you like to go?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={
              shown[active] ? "command-" + active : undefined
            }
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => (i + 1) % Math.max(shown.length, 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(
                  (i) =>
                    (i - 1 + Math.max(shown.length, 1)) %
                    Math.max(shown.length, 1),
                );
              }
              if (e.key === "Enter" && shown[active]) {
                e.preventDefault();
                run(shown[active]);
              }
            }}
          />
          <button aria-label="Close quick actions" onClick={close}>
            <X size={18} />
          </button>
        </header>
        <div
          className="command-body"
          onPointerMove={(e) => {
            trail.current.push({ x: e.clientX, y: e.clientY });
            if (trail.current.length > 5) trail.current.shift();
          }}
        >
          {!q && (
            <nav aria-label="Action categories">
              {["Spaces", "Create", "Operate", "Explore"].map((g) => (
                <button
                  key={g}
                  aria-pressed={group === g}
                  onPointerEnter={(e) => aim(g, e)}
                  onFocus={() => {
                    clearTimeout(pending.current);
                    setGroup(g);
                  }}
                  onClick={() => setGroup(g)}
                >
                  {g}
                  <ChevronRight size={13} />
                </button>
              ))}
            </nav>
          )}
          <div
            ref={pane}
            id="command-results"
            role="listbox"
            aria-label="Matching actions"
            onPointerEnter={() => clearTimeout(pending.current)}
          >
            {shown.map((a, i) => (
              <button
                key={a.name}
                role="option"
                id={"command-" + i}
                aria-selected={active === i}
                onPointerMove={() => setActive(i)}
                onClick={() => run(a)}
              >
                <span>
                  <a.icon size={19} />
                </span>
                <div>
                  <strong>{a.name}</strong>
                  <small>{a.detail}</small>
                </div>
                <ArrowRight size={16} />
              </button>
            ))}
            {!shown.length && (
              <p className="command-empty">
                No matching action. Try “orders” or “customer”.
              </p>
            )}
          </div>
        </div>
        <footer>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to browse <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </footer>
      </dialog>
      {toast && (
        <div className="premium-toast" role="status">
          <Check size={17} />
          <span>{toast.message}</span>
          <button
            onClick={() => {
              const item = undoRef.current;
              undoRef.current = null;
              if (item) {
                item.undo();
                setToast(null);
              }
            }}
          >
            <Undo2 size={14} />
            Undo
          </button>
          <button
            aria-label="Dismiss undo notification"
            onClick={() => {
              undoRef.current = null;
              setToast(null);
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
export function CommandTrigger() {
  const mac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <button
      className="command-trigger"
      onClick={() => window.dispatchEvent(new Event("kawing:commands"))}
      aria-label="Open quick actions"
    >
      <Search size={15} />
      <span>Quick actions</span>
      <kbd>{mac ? "⌘" : "Ctrl"} K</kbd>
    </button>
  );
}
export function ProductStory() {
  const [stage, setStage] = useState(0),
    [spatial, setSpatial] = useState(false),
    [film, setFilm] = useState(false),
    [angle, setAngle] = useState(-0.35),
    [zoom, setZoom] = useState(1);
  const dialog = useRef(null),
    trigger = useRef(null);
  const stages = [
    [
      "A warm welcome.",
      "A branded menu, a simple order, and the little things that make guests feel at home.",
      "Guest",
    ],
    [
      "A team in sync.",
      "The same order moves from cashier verification to preparation, ready, and served.",
      "Team",
    ],
    [
      "A reason to return.",
      "Completed visits connect to rewards and a clearer picture of the business.",
      "Owner",
    ],
  ];
  useEffect(() => {
    if (film) dialog.current?.showModal();
  }, [film]);
  const close = () => {
    dialog.current?.querySelector("video")?.pause();
    dialog.current?.close();
    setFilm(false);
    trigger.current?.focus();
  };
  return (
    <section
      className="product-story"
      aria-label="The connected Kawing experience"
      data-reveal
    >
      <div className="story-visual">
        {spatial ? (
          <Suspense fallback={<Skeleton label="Preparing spatial preview" />}>
            <SpatialCanvas
              stage={stage}
              angle={angle}
              onAngle={setAngle}
              zoom={zoom}
              onZoom={setZoom}
            />
          </Suspense>
        ) : (
          <img
            src="/images/story-scene.jpg"
            alt="A considered café workspace, connected by Kawing"
            width="1280"
            height="720"
            loading="lazy"
          />
        )}
        <span className="story-visual-label">
          <i />
          {spatial
            ? "Interactive 3D · Illustrative scene"
            : "ONE VISIT. ONE CONNECTED WORKFLOW."}
        </span>
        <button
          className="story-spatial-toggle"
          aria-pressed={spatial}
          onClick={() => setSpatial((v) => !v)}
        >
          <Box size={16} />
          {spatial ? "Close 3D" : "Explore in 3D"}
        </button>
        {spatial && (
          <div className="spatial-controls">
            <button
              aria-label="Rotate scene left"
              onClick={() => setAngle((a) => a - 0.3)}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              aria-label="Reset scene rotation"
              onClick={() => {
                setAngle(-0.35);
                setZoom(1);
              }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              aria-label="Rotate scene right"
              onClick={() => setAngle((a) => a + 0.3)}
            >
              <ArrowRight size={16} />
            </button>
            <button
              aria-label={zoom > 1 ? "Show full scene" : "Inspect scene detail"}
              aria-pressed={zoom > 1}
              onClick={() => setZoom((z) => (z > 1 ? 1 : 1.35))}
            >
              {zoom > 1 ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
          </div>
        )}
      </div>
      <div className="story-copy">
        <span className="premium-eyebrow">
          FROM ONE SCAN TO A LASTING RELATIONSHIP
        </span>
        <div
          className="story-stage-tabs"
          role="tablist"
          aria-label="Connected visit stages"
        >
          {stages.map((s, i) => (
            <button
              role="tab"
              key={s[2]}
              id={`story-tab-${i}`}
              aria-controls="story-panel"
              aria-selected={i === stage}
              tabIndex={i === stage ? 0 : -1}
              onClick={() => setStage(i)}
              onKeyDown={(e) => {
                const next =
                  e.key === "ArrowRight"
                    ? (i + 1) % 3
                    : e.key === "ArrowLeft"
                      ? (i + 2) % 3
                      : e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 2
                          : null;
                if (next !== null) {
                  e.preventDefault();
                  setStage(next);
                  document.getElementById(`story-tab-${next}`)?.focus();
                }
              }}
            >
              {String(i + 1).padStart(2, "0")} {s[2]}
            </button>
          ))}
        </div>
        <div
          className="story-stage"
          key={stage}
          id="story-panel"
          role="tabpanel"
          aria-labelledby={`story-tab-${stage}`}
        >
          <h2>{stages[stage][0]}</h2>
          <p>{stages[stage][1]}</p>
          {spatial && (
            <small className="spatial-hint">
              Drag to look around. Rotate, reset or inspect the detail below.
            </small>
          )}
        </div>
        <button
          className="story-watch"
          ref={trigger}
          onClick={() => setFilm(true)}
        >
          <span>
            <Play size={14} fill="currentColor" />
          </span>
          Watch the product story <small>12 seconds</small>
        </button>
        <p className="story-boundary">
          A product concept, made interactive. All businesses and transactions
          are fictional.
        </p>
      </div>
      <dialog
        ref={dialog}
        className="film-dialog"
        aria-label="Kawing product story"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <header>
          <span>KAWING · A CONNECTED VISIT</span>
          <button onClick={close} aria-label="Close product story">
            <X size={20} />
          </button>
        </header>
        {film && (
          <video
            controls
            playsInline
            preload="none"
            poster="/images/story-poster.jpg"
            aria-label="Twelve-second Kawing workflow film"
          >
            <source src="/motion/kawing-story.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/motion/kawing-story.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        )}
        <p>
          Menu → order → cashier confirmation → preparation → rewards. Fictional
          demonstration.
        </p>
      </dialog>
    </section>
  );
}
export function useEditorialMotion() {
  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal]");
    if (reducedMotion()) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    targets.forEach((t) => {
      t.classList.add("reveal-ready");
      io.observe(t);
    });
    const fine = matchMedia("(pointer:fine)").matches;
    const move = (e) => {
      const el = e.target.closest("[data-magnetic]");
      if (el && fine) {
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          "--mx",
          Math.max(-3, Math.min(3, (e.clientX - r.left - r.width / 2) * 0.04)) +
            "px",
        );
        el.style.setProperty(
          "--my",
          Math.max(-3, Math.min(3, (e.clientY - r.top - r.height / 2) * 0.04)) +
            "px",
        );
      }
    };
    const leave = (e) => {
      const el = e.target.closest?.("[data-magnetic]");
      if (el) {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      }
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerout", leave);
    return () => {
      io.disconnect();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
    };
  }, []);
}
