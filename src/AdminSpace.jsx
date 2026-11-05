import React, { useState } from "react";
import { useCustomize } from "./session";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Store,
  AlertTriangle,
  Clock3,
  LifeBuoy,
  Search,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
export function TierPanel({ data, update }) {
  const current = data.presentationTier || "growth";
  return (
    <section className="tier-panel">
      <span className="spaces-eyebrow">PACKAGES · DEMO ENTITLEMENTS</span>
      <h2>A fit for every stage.</h2>
      <p>
        Change a demonstration package. No billing or subscription is created.
        Existing business data is retained; payment policy is configured
        separately.
      </p>
      <div className="tier-cards">
        {[
          [
            "basic",
            "Basic",
            "Essential identity, practical links, and two approved media slots.",
            2,
          ],
          [
            "growth",
            "Growth",
            "Richer presentation, six media slots, and mock style suggestions.",
            6,
          ],
          [
            "bespoke",
            "Bespoke",
            "Twelve media slots and a consultation-led presentation preview.",
            12,
          ],
        ].map(([id, name, desc, n]) => (
          <button
            key={id}
            aria-pressed={current === id}
            onClick={() => update((d) => ({ ...d, presentationTier: id }))}
          >
            <span>{current === id ? <Check size={18} /> : name[0]}</span>
            <h3>{name}</h3>
            <p>{desc}</p>
            <strong>{n} demo media slots</strong>
          </button>
        ))}
      </div>
      <small>
        Packages do not activate POS, payment integrations, or the event map.
        Downgrades retain data while new additions follow the lower quota.
      </small>
    </section>
  );
}
export default function AdminSpace({ data, update }) {
  const [tab, setTab] = useState("Overview"),
    [notice, setNotice] = useState(""),
    [summary, setSummary] = useState("Cannot access the ordering flow"),
    [priority, setPriority] = useState("blocking"),
    [resolution, setResolution] = useState("");
  useCustomize(() => setTab("Packages"));
  const ops = {
    subscription: "existing",
    reviewed: false,
    tickets: [],
    ...data.adminOps,
  };
  const issues = ops.tickets.filter((t) => t.status !== "resolved");
  const checks = [
    ["Account relationship active", ops.subscription !== "paused"],
    ["Business name", !!data.brand.name?.trim()],
    ["Business category", !!data.brand.category?.trim()],
    ["Event / business contact", !!data.brand.contact?.trim()],
    ["Available catalog item", data.menu.some((m) => m.available)],
    [
      "Payment policy configured",
      ["prepaid", "counter"].includes(data.operations.policy),
    ],
    ["No unresolved blockers", !issues.some((i) => i.priority === "blocking")],
    ["Operator review complete", ops.reviewed],
  ];
  const ready = checks.every(([, ok]) => ok);
  const patch = (p) => update((d) => ({ ...d, adminOps: { ...ops, ...p } }));
  return (
    <main className="admin-space admin-command">
      <header className="admin-command-heading">
        <div>
          <span className="spaces-eyebrow">KAWING · MERCHANT OPERATIONS</span>
          <h1>A clear view of the whole.</h1>
          <p>One business dossier. Setup, package, and support—connected.</p>
        </div>
        <span className={"readiness-badge " + (ready ? "ready" : "attention")}>
          {ready ? <Check size={16} /> : <AlertTriangle size={16} />}{" "}
          {ready ? "Demo setup ready" : "Setup needs attention"}
        </span>
      </header>
      <div className="admin-command-metrics">
        <span>
          <strong>
            {checks.filter(([, ok]) => ok).length}/{checks.length}
          </strong>
          Setup checks
        </span>
        <span>
          <strong>{issues.length}</strong>Open issues
        </span>
        <span>
          <strong>
            {data.orders.filter((o) => !o.seed && o.status === "served").length}
          </strong>
          Completed demo orders
        </span>
        <span>
          <strong>{(data.presentationTier || "growth").toUpperCase()}</strong>
          Current package
        </span>
      </div>
      <div className="admin-command-layout">
        <aside className="admin-business-card">
          <span className="vendor-avatar">
            <Store size={28} />
          </span>
          <h2>{data.brand.name}</h2>
          <p>{data.brand.tagline}</p>
          <dl>
            <dt>Relationship</dt>
            <dd>
              {ops.subscription === "existing"
                ? "Existing demo subscriber"
                : ops.subscription === "trial"
                  ? "Trial / prospect"
                  : "Paused demo account"}
            </dd>
            <dt>Profile</dt>
            <dd>{data.brand.category || "Category not set"}</dd>
            <dt>Contact</dt>
            <dd>{data.brand.contact || "Needs contact details"}</dd>
          </dl>
          <small>
            Role switching is a presentation feature, not real authentication.
            All records remain local.
          </small>
        </aside>
        <section className="admin-task-panel">
          <nav className="market-tabs">
            {["Overview", "Packages", "Setup review", "Support"].map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
                {t === "Support" && <small>{issues.length}</small>}
              </button>
            ))}
          </nav>
          {notice && (
            <p className="desk-notice" role="status">
              {notice}
            </p>
          )}
          {tab === "Overview" && (
            <>
              <h2>The next right action.</h2>
              <p className="admin-task-lead">
                {ready
                  ? "All configured demo checks are complete. Keep an eye on customer issues."
                  : "Complete business details and review the workflow before calling the setup ready."}
              </p>
              <div className="admin-action-grid">
                <button onClick={() => setTab("Setup review")}>
                  <ShieldCheck size={23} />
                  <strong>Review setup</strong>
                  <span>
                    {checks.filter(([, ok]) => !ok).length} checks remaining
                  </span>
                  <ArrowRight size={17} />
                </button>
                <button onClick={() => setTab("Support")}>
                  <LifeBuoy size={23} />
                  <strong>Handle issues</strong>
                  <span>{issues.length} unresolved requests</span>
                  <ArrowRight size={17} />
                </button>
              </div>
              <div className="readiness-grid">
                {checks.map(([label, ok]) => (
                  <div className={ok ? "complete" : ""} key={label}>
                    {ok ? <Check size={16} /> : <Clock3 size={16} />}
                    <span>{label}</span>
                    <strong>{ok ? "Met" : "Outstanding"}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "Packages" && (
            <>
              <TierPanel data={data} update={update} />
              <label>
                Demo subscriber relationship
                <select
                  aria-label="Merchant subscriber relationship"
                  value={ops.subscription}
                  onChange={(e) =>
                    patch({ subscription: e.target.value, reviewed: false })
                  }
                >
                  <option value="existing">Existing demo subscriber</option>
                  <option value="trial">Trial / prospect</option>
                  <option value="paused">Paused demo account</option>
                </select>
              </label>
              <p className="desk-fineprint">
                Changing a demo relationship never activates billing, payment
                verification, or a production account.
              </p>
            </>
          )}
          {tab === "Setup review" && (
            <>
              <h2>A review with evidence.</h2>
              <p>
                These fields update the same Business Profile. Required setup
                gaps cannot be approved away.
              </p>
              {[
                ["category", "Business category"],
                ["contact", "Business contact"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    maxLength={100}
                    value={data.brand[key] || ""}
                    onChange={(e) =>
                      update((d) => ({
                        ...d,
                        brand: { ...d.brand, [key]: e.target.value },
                        adminOps: { ...ops, reviewed: false },
                      }))
                    }
                  />
                </label>
              ))}
              <div className="readiness-grid">
                {checks.map(([label, ok]) => (
                  <div key={label} className={ok ? "complete" : ""}>
                    {ok ? <Check size={16} /> : <AlertTriangle size={16} />}
                    <span>{label}</span>
                    <strong>{ok ? "Met" : "Outstanding"}</strong>
                  </div>
                ))}
              </div>
              <button
                className="space-primary"
                disabled={!checks.slice(0, -1).every(([, ok]) => ok)}
                onClick={() => {
                  patch({ reviewed: true, reviewedAt: Date.now() });
                  setNotice(
                    "Demo setup reviewed against the current checklist. No real merchant account was approved.",
                  );
                }}
              >
                Mark demo setup reviewed <Check size={16} />
              </button>
            </>
          )}
          {tab === "Support" && (
            <>
              <form
                className="issue-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  patch({
                    reviewed: false,
                    tickets: [
                      {
                        id: crypto.randomUUID(),
                        title: summary,
                        priority,
                        status: "open",
                        resolution: "",
                        createdAt: Date.now(),
                      },
                      ...ops.tickets,
                    ],
                  });
                  setNotice(
                    "Demo issue recorded locally. Blocking issues prevent a ready state. No message was sent externally.",
                  );
                }}
              >
                <h2>Track the problem to its resolution.</h2>
                <label>
                  Issue summary
                  <input
                    value={summary}
                    maxLength={140}
                    required
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </label>
                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="blocking">Blocking setup / operation</option>
                    <option value="normal">Needs attention</option>
                  </select>
                </label>
                <button className="space-primary" disabled={!summary.trim()}>
                  Record demo issue <MessageSquare size={16} />
                </button>
              </form>
              <div className="vendor-issues">
                {!ops.tickets.length && (
                  <div className="desk-empty">
                    <CheckCircle2 size={28} />
                    <p>No support issues recorded.</p>
                  </div>
                )}
                {ops.tickets.map((t) => (
                  <article key={t.id}>
                    <span className={"issue-priority " + t.priority}>
                      {t.priority} · {t.status.replace("_", " ")}
                    </span>
                    <h3>{t.title}</h3>
                    {t.resolution && <p>{t.resolution}</p>}
                    {t.status !== "resolved" && (
                      <>
                        <label>
                          Resolution note
                          <input
                            aria-label={"Resolve " + t.title}
                            maxLength={300}
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="What was checked and corrected?"
                          />
                        </label>
                        <div>
                          <button
                            className="space-secondary"
                            onClick={() =>
                              patch({
                                tickets: ops.tickets.map((v) =>
                                  v.id === t.id
                                    ? { ...v, status: "in_progress" }
                                    : v,
                                ),
                              })
                            }
                          >
                            Start handling
                          </button>
                          <button
                            className="space-primary"
                            disabled={!resolution.trim()}
                            onClick={() => {
                              patch({
                                tickets: ops.tickets.map((v) =>
                                  v.id === t.id
                                    ? {
                                        ...v,
                                        status: "resolved",
                                        resolution: resolution.trim(),
                                      }
                                    : v,
                                ),
                              });
                              setResolution("");
                              setNotice(
                                "Issue resolved with a note. Review setup again to verify readiness.",
                              );
                            }}
                          >
                            Resolve with note
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
