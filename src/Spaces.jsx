import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  Map,
  ShieldCheck,
  Users,
  ChevronDown,
  LayoutGrid,
  Leaf,
  Check,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { CustomerPreview } from "./Viewport";
import Market from "./Market";

const roles = [
  [
    "merchant",
    "Merchant View",
    "Your business, thoughtfully presented.",
    "Build your profile, customize the experience, and manage your day.",
    Store,
  ],
  [
    "admin",
    "Admin View",
    "See the bigger picture.",
    "Manage demo setup, packages, and the shared experience.",
    ShieldCheck,
  ],
  [
    "customer",
    "Customer View",
    "A welcome worth exploring.",
    "Discover businesses and experience the customer journey.",
    Users,
  ],
];
function selection() {
  const q = new URLSearchParams(location.search);
  return {
    scenario: q.get("scenario") === "market" ? "market" : "standard",
    role: ["merchant", "admin", "customer"].includes(q.get("workspace"))
      ? q.get("workspace")
      : null,
    guest: q.get("surface") === "guest",
  };
}
export default function Spaces({ Workspace }) {
  const initial = selection(),
    [scenario, setScenario] = useState(initial.scenario),
    [role, setRole] = useState(initial.role),
    [step, setStep] = useState(initial.role ? "inside" : "scenario");
  useEffect(() => {
    const change = () => {
      const s = selection();
      setScenario(s.scenario);
      setRole(s.role);
      setStep(s.role ? "inside" : "scenario");
    };
    window.addEventListener("popstate", change);
    return () => window.removeEventListener("popstate", change);
  }, []);
  function enter(r) {
    if (
      (window.kawingStudioDirty || window.kawingMapDirty) &&
      !confirm(
        "Switch view with unsaved Studio changes? Your draft is retained.",
      )
    )
      return;
    const u = new URL(location.href);
    u.searchParams.set("workspace", r);
    u.searchParams.set("scenario", scenario);
    u.hash =
      scenario === "standard"
        ? r === "customer"
          ? "Customer"
          : r === "merchant"
            ? "Customization"
            : "Admin"
        : "";
    history.pushState(null, "", u);
    setRole(r);
    setStep("inside");
    window.scrollTo(0, 0);
  }
  function chooseScenario() {
    if (
      (window.kawingStudioDirty || window.kawingMapDirty) &&
      !confirm(
        "Change simulation with an unsaved draft? Studio drafts are retained; market drafts will be discarded.",
      )
    )
      return;
    const u = new URL(location.href);
    u.searchParams.delete("workspace");
    u.searchParams.delete("scenario");
    u.hash = "";
    history.pushState(null, "", u);
    setRole(null);
    setStep("scenario");
    window.scrollTo(0, 0);
  }
  if (initial.guest) return <Workspace />;
  // Preserve previously shared product deep links without making the new entry a gate.
  const legacy =
    !role && location.hash && !["#scenario", "#views"].includes(location.hash);
  if (legacy) return <Workspace />;
  if (step === "inside" && role)
    return (
      <div
        className={
          "space-session space-" +
          role +
          (new URLSearchParams(location.search).has("scenario")
            ? " modern-spaces"
            : "")
        }
      >
        <SessionHeader
          scenario={scenario}
          role={role}
          onSwitch={() => {
            if (
              !(window.kawingStudioDirty || window.kawingMapDirty) ||
              confirm(
                "Leave the unsaved Studio draft? It is retained for later.",
              )
            )
              setStep("view");
          }}
          onScenario={chooseScenario}
        />
        {scenario === "standard" && role === "customer" ? (
          <CustomerPreview />
        ) : scenario === "market" ? (
          <Market key={role} role={role} />
        ) : (
          <Workspace key={role} space={role} />
        )}
      </div>
    );
  return (
    <main className="spaces-landing">
      <header className="spaces-brand">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            chooseScenario();
          }}
        >
          <span>k✳</span>kawing.
        </a>
        <span>THE INTERACTIVE PRODUCT EXPERIENCE</span>
        <button onClick={chooseScenario}>
          <Compass size={16} /> Start over
        </button>
      </header>
      <div className="spaces-intro">
        <div className="spaces-step">
          <span className={step === "scenario" ? "current" : "done"}>
            {step === "view" ? <Check size={13} /> : 1}
          </span>
          Choose simulation
          <i />
          <span className={step === "view" ? "current" : ""}>2</span>Choose your
          view
        </div>
        <span className="spaces-eyebrow">
          {step === "scenario"
            ? "ONE PLATFORM. DIFFERENT POSSIBILITIES."
            : scenario === "market"
              ? "BOOTH SETUP · POP-UP MARKET"
              : "MERCHANT SETUP · STANDARD MERCHANT"}
        </span>
        <h1>
          {step === "scenario" ? (
            <>
              A space for every
              <br />
              <em>kind of connection.</em>
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
            ? "Step into a neighborhood business or a lively local market. Choose a simulation, then explore it your way."
            : "Choose a view and jump straight in. Everything is seeded, editable, and simulated—no account or lengthy setup."}
        </p>
      </div>
      {step === "scenario" ? (
        <div className="scenario-cards">
          <button
            onClick={() => {
              setScenario("standard");
              setStep("view");
            }}
            className="scenario-card merchant-scenario"
          >
            <div className="scenario-art">
              <div className="mini-shop">
                <Leaf size={40} />
                <span>YOUR DAILY LOCAL</span>
                <b>Salo Kitchen</b>
                <i />
                <div>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <span className="art-label">
                <Check size={13} /> A beautiful business profile
              </span>
            </div>
            <div className="scenario-card-copy">
              <span>01 / STANDARD MERCHANT</span>
              <h2>Merchant Setup</h2>
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
            onClick={() => {
              setScenario("market");
              setStep("view");
            }}
          >
            <div className="scenario-art map-art">
              <div className="mini-map">
                {Array.from({ length: 9 }, (_, i) => (
                  <i
                    key={i}
                    className={i === 4 ? "path" : i === 2 ? "occupied" : ""}
                  >
                    {i === 4 ? (
                      <Compass size={25} />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </i>
                ))}
              </div>
              <span className="art-label">
                <Map size={14} /> An interactive shared map
              </span>
            </div>
            <div className="scenario-card-copy">
              <span>02 / POP-UP MARKET</span>
              <h2>Booth Setup</h2>
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
          <button className="spaces-back" onClick={() => setStep("scenario")}>
            <ArrowLeft size={16} />
            Back to simulations
          </button>
          <div className="space-role-cards">
            {roles.map(([id, title, subtitle, desc, Icon]) => (
              <button key={id} onClick={() => enter(id)}>
                <span className="space-role-icon">
                  <Icon size={26} />
                </span>
                <span className="space-role-tag">
                  {id === "merchant"
                    ? "CREATE & OPERATE"
                    : id === "admin"
                      ? "ORGANIZE & MANAGE"
                      : "DISCOVER & ENJOY"}
                </span>
                <h2>{title}</h2>
                <strong>{subtitle}</strong>
                <p>{desc}</p>
                <span className="space-enter">
                  Enter {title}
                  <ArrowRight size={17} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <footer className="spaces-footer">
        <span>
          <span className="online-dot" /> Interactive demo · Fictional
          businesses · Browser-local data
        </span>
        <span>Good business, connected.</span>
      </footer>
    </main>
  );
}
export function SessionHeader({ scenario, role, onSwitch, onScenario }) {
  return (
    <header className="space-session-header">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onScenario();
        }}
        className="space-wordmark"
      >
        kawing<span>✳</span>
      </a>
      <div>
        <span>{scenario === "market" ? "Booth Setup" : "Merchant Setup"}</span>
        <ChevronDown size={13} />
        <strong>{roles.find((r) => r[0] === role)?.[1]}</strong>
        <small>SIMULATION</small>
      </div>
      <nav>
        <button onClick={onSwitch}>
          <Users size={15} />
          Switch View
        </button>
        <button onClick={onScenario}>
          <LayoutGrid size={15} />
          Change Simulation
        </button>
      </nav>
    </header>
  );
}
