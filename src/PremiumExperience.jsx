import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Undo2,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Box,
  Check,
} from "lucide-react";
import { reducedMotion } from "./premium";
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
export function UndoHost() {
  const [toast, setToast] = useState(null);
  const undoRef = useRef(null);
  useEffect(() => {
    const undo = (e) => { undoRef.current = e.detail; setToast(e.detail); };
    const clear = () => { undoRef.current = null; setToast(null); };
    window.addEventListener("kawing:undo", undo);
    for (const event of ["kawing:clear-undo", "hashchange", "popstate"]) window.addEventListener(event, clear);
    return () => {
      window.removeEventListener("kawing:undo", undo);
      for (const event of ["kawing:clear-undo", "hashchange", "popstate"]) window.removeEventListener(event, clear);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => { undoRef.current = null; setToast(null); }, 9000);
    return () => clearTimeout(timer);
  }, [toast]);
  return (<>
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
