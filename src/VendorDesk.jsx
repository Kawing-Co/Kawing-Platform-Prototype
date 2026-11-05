import React, { useState } from "react";
import {
  Check,
  AlertTriangle,
  ArrowRight,
  Store,
  ClipboardCheck,
  Wrench,
  Flag,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import {
  needTypes,
  vendorOps,
  vendorReadiness,
  updateVendor,
  addIssue,
  resolveIssue,
} from "./operations";
import { businessKey } from "./experience";
import { useLocalSnapshot } from "./premium";
import { orderAction, paymentLabel } from "./commerce";
export function VendorDesk({
  data,
  update,
  role,
  selectedId,
  onSelect,
  onMap,
  commerce,
}) {
  const [area, setArea] = useState("Readiness"),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState(""),
    [resolution, setResolution] = useState(""),
    [issue, setIssue] = useState({
      title: "Power connection unavailable",
      category: "Power",
      priority: "blocking",
    });
  const p = data.profiles.find((p) => p.id === selectedId) || data.profiles[0];
  if (!p) return <p>No local vendors yet.</p>;
  const ops = vendorOps(p),
    state = vendorReadiness(data, p.id);
  const name =
    p.id === "salo" && commerce?.brand ? commerce.brand.name : p.name;
  const currentTier =
    p.id === "salo"
      ? commerce?.presentationTier || "growth"
      : ["basic", "growth", "bespoke"].includes(ops.platformTier)
        ? ops.platformTier
        : "basic";
  const selectedIssues = (data.issues || []).filter(
    (i) => i.merchantId === p.id,
  );
  const patch = (v) => update((d) => updateVendor(d, p.id, v));
  const admin = role === "admin";
  return (
    <section className="vendor-desk">
      <label className="vendor-mobile-select">
        Business profile
        <select
          aria-label="Select event business"
          value={p.id}
          onChange={(e) => {
            onSelect(e.target.value);
            setNotice("");
            setResolution("");
          }}
        >
          {data.profiles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id === "salo" && commerce?.brand
                ? commerce.brand.name
                : v.name}{" "}
              ·{" "}
              {data.booths.find((b) => b.merchant === v.id)?.id || "Unassigned"}
            </option>
          ))}
        </select>
      </label>
      <div className="vendor-directory">
        <div>
          <span className="spaces-eyebrow">
            {admin ? "VENDOR COMMAND CENTER" : "MY PARTICIPATION"}
          </span>
          <h2>
            {admin ? "People before paperwork." : "Your market day, organized."}
          </h2>
        </div>
        <label>
          Find a business
          <input
            aria-label="Find market merchant"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Name or category"
          />
        </label>
        {data.profiles
          .filter((v) =>
            (v.name + " " + v.category)
              .toLowerCase()
              .includes(filter.toLowerCase()),
          )
          .map((v) => (
            <button
              key={v.id}
              className={v.id === p.id ? "active" : ""}
              onClick={() => {
                onSelect(v.id);
                setNotice("");
                setResolution("");
              }}
            >
              <span>{v.name[0]}</span>
              <div>
                <strong>
                  {v.id === "salo" && commerce?.brand
                    ? commerce.brand.name
                    : v.name}
                </strong>
                <small>
                  {data.booths.find((b) => b.merchant === v.id)?.id ||
                    "No booth"}{" "}
                  ·{" "}
                  {vendorReadiness(data, v.id).ready
                    ? "Ready"
                    : "Needs attention"}
                </small>
              </div>
              <ArrowRight size={15} />
            </button>
          ))}
      </div>
      <div className="vendor-dossier">
        <header>
          <div>
            <span className="spaces-eyebrow">
              {p.temporary
                ? "EVENT-ONLY BUSINESS"
                : "EXISTING BUSINESS PROFILE"}
            </span>
            <h2>{name}</h2>
            <p>
              {p.category} · {state.booth?.id || "Not assigned"} ·{" "}
              {ops.subscription === "existing"
                ? "Existing demo subscriber"
                : ops.subscription === "trial"
                  ? "Trial / prospect"
                  : "Not a subscriber"}
            </p>
          </div>
          <span
            className={
              "readiness-badge " + (state.ready ? "ready" : "attention")
            }
          >
            {state.ready ? <Check size={16} /> : <AlertTriangle size={16} />}{" "}
            {state.ready
              ? "Ready to operate"
              : state.remaining + " checks outstanding"}
          </span>
        </header>
        <nav className="dossier-tabs">
          {[
            "Readiness",
            "Business & tier",
            "Logistics",
            "Issues",
            "Orders",
          ].map((t) => (
            <button
              key={t}
              aria-pressed={area === t}
              onClick={() => setArea(t)}
            >
              {t}
              {t === "Issues" && (
                <small>
                  {selectedIssues.filter((i) => i.status !== "resolved").length}
                </small>
              )}
            </button>
          ))}
        </nav>
        {notice && (
          <p className="desk-notice" role="status">
            {notice}
          </p>
        )}
        {area === "Readiness" && (
          <>
            <div className="readiness-grid">
              {state.checks.map((c) => (
                <div key={c.label} className={c.ok ? "complete" : ""}>
                  {c.ok ? <Check size={17} /> : <Clock3 size={17} />}
                  <span>{c.label}</span>
                  <strong>{c.ok ? "Met" : "Outstanding"}</strong>
                </div>
              ))}
            </div>
            <div className="desk-next">
              <div>
                <h3>
                  {state.ready
                    ? "All configured checks are met."
                    : "Let’s close the gaps."}
                </h3>
                <p>
                  Readiness is derived from the booth, requested needs, verified
                  fulfillment, and unresolved blockers. This is a simulation
                  checklist—not a real safety certification.
                </p>
              </div>
              <button
                className="space-primary"
                onClick={() => setArea("Logistics")}
              >
                Review logistics <ArrowRight size={15} />
              </button>
              <button className="space-secondary" onClick={onMap}>
                Locate on map
              </button>
            </div>
          </>
        )}
        {area === "Business & tier" && (
          <div className="dossier-profile">
            <div className="vendor-avatar">
              <Store size={32} />
            </div>
            <h3>{name}</h3>
            <p>{p.bio}</p>
            <div className="subscription-summary">
              <span>
                Current platform package
                <strong>
                  {ops.subscription === "existing"
                    ? currentTier.toUpperCase()
                    : "No active subscription"}
                </strong>
                <small>Existing record · Demonstration only</small>
              </span>
              <span>
                Event participation package
                <strong>{ops.eventTier.toUpperCase()}</strong>
                <small>Separate event allocation · No billing</small>
              </span>
            </div>
            <label>
              Contact / event lead
              <input
                aria-label="Vendor event contact"
                value={ops.contact}
                onChange={(e) => patch({ contact: e.target.value })}
              />
            </label>
            {admin && (
              <>
                <label>
                  Subscriber relationship
                  <select
                    aria-label="Vendor subscription status"
                    value={ops.subscription}
                    onChange={(e) => patch({ subscription: e.target.value })}
                  >
                    <option value="existing">Existing demo subscriber</option>
                    <option value="none">Not a subscriber</option>
                    <option value="trial">Trial / prospect</option>
                  </select>
                </label>
                {p.id !== "salo" && ops.subscription === "existing" && (
                  <label>
                    Current demo platform package
                    <select
                      aria-label="Vendor platform tier"
                      value={
                        ops.platformTier === "none"
                          ? "basic"
                          : ops.platformTier || "basic"
                      }
                      onChange={(e) => patch({ platformTier: e.target.value })}
                    >
                      <option value="basic">Basic</option>
                      <option value="growth">Growth</option>
                      <option value="bespoke">Bespoke</option>
                    </select>
                  </label>
                )}
                <label>
                  Event package to provide
                  <select
                    aria-label="Vendor event tier"
                    value={ops.eventTier}
                    onChange={(e) => patch({ eventTier: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="growth">Growth</option>
                    <option value="bespoke">Bespoke</option>
                  </select>
                </label>
              </>
            )}
            <p className="desk-fineprint">
              Event package changes do not overwrite an existing merchant’s
              platform subscription, pricing, order history, or payment policy.
            </p>
          </div>
        )}
        {area === "Logistics" && (
          <>
            <div className="needs-head">
              <h3>What’s needed. What’s actually ready.</h3>
              <p>
                {admin
                  ? "Verify fulfillment only after the fictional setup action is complete."
                  : "Request the support you need. The organizer verifies fulfillment separately."}
              </p>
            </div>
            <div className="logistics-workbench">
              <div className="logistics-table">
                <div className="logistics-table-head">
                  <span>Requirement</span>
                  <span>Requested</span>
                  <span>
                    {admin ? "Verified fulfilled" : "Organizer status"}
                  </span>
                </div>
                {needTypes.map(([key, label]) => (
                  <div key={key}>
                    <strong>{label}</strong>
                    <label>
                      <input
                        type="checkbox"
                        aria-label={"Request " + label}
                        checked={!!ops.requested[key]}
                        onChange={(e) => {
                          patch({
                            requested: {
                              ...ops.requested,
                              [key]: e.target.checked,
                            },
                            fulfilled: { ...ops.fulfilled, [key]: false },
                          });
                        }}
                      />
                      <span>
                        {ops.requested[key] ? "Needed" : "Not needed"}
                      </span>
                    </label>
                    <label>
                      {admin ? (
                        <input
                          type="checkbox"
                          aria-label={"Fulfill " + label}
                          checked={!!ops.fulfilled[key]}
                          disabled={!ops.requested[key]}
                          onChange={(e) =>
                            patch({
                              fulfilled: {
                                ...ops.fulfilled,
                                [key]: e.target.checked,
                              },
                            })
                          }
                        />
                      ) : ops.fulfilled[key] ? (
                        <Check size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}
                      <span>
                        {ops.requested[key]
                          ? ops.fulfilled[key]
                            ? "Verified"
                            : "Pending"
                          : "—"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="logistics-controls">
                <label>
                  Arrival / load-in time
                  <input
                    type="time"
                    value={ops.arrival}
                    onChange={(e) => patch({ arrival: e.target.value })}
                  />
                </label>
                <label>
                  Tent setup status
                  <select
                    aria-label="Tent setup status"
                    disabled={!admin}
                    value={ops.tentStatus}
                    onChange={(e) => patch({ tentStatus: e.target.value })}
                  >
                    <option value="requested">Requested / not set up</option>
                    <option value="assigned">Tent allocated</option>
                    <option value="setup">Setup in progress</option>
                    <option value="ready">Installed and checked</option>
                    <option value="problem">Problem reported</option>
                  </select>
                </label>
              </div>
              <label>
                Logistics notes
                <textarea
                  maxLength={500}
                  placeholder="Fictional setup requirements; avoid real personal details."
                  value={ops.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                />
              </label>
              <p className="desk-fineprint">
                Checking a request does not fulfill it. A requested tent
                requires both verified fulfillment and “Installed and checked.”
                Changes persist in this browser.
              </p>
            </div>
          </>
        )}
        {area === "Issues" && (
          <>
            <form
              className="issue-form"
              onSubmit={(e) => {
                e.preventDefault();
                update((d) =>
                  addIssue(d, {
                    ...issue,
                    merchantId: p.id,
                    boothId: state.booth?.id || null,
                  }),
                );
                setNotice(
                  "Local demo issue reported. Readiness now reflects any blocking issue. No external message was sent.",
                );
              }}
            >
              <h3>When something goes wrong</h3>
              <label>
                Issue summary
                <input
                  required
                  maxLength={120}
                  value={issue.title}
                  onChange={(e) =>
                    setIssue({ ...issue, title: e.target.value })
                  }
                />
              </label>
              <div>
                <label>
                  Category
                  <select
                    value={issue.category}
                    onChange={(e) =>
                      setIssue({ ...issue, category: e.target.value })
                    }
                  >
                    {[
                      "Power",
                      "Tent / weather cover",
                      "Water",
                      "Connectivity",
                      "Access / safety",
                      "Stock / staffing",
                      "Other",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Impact
                  <select
                    aria-label="Issue priority"
                    value={issue.priority}
                    onChange={(e) =>
                      setIssue({ ...issue, priority: e.target.value })
                    }
                  >
                    <option value="blocking">Blocking operations</option>
                    <option value="normal">Needs attention</option>
                    <option value="low">Low priority</option>
                  </select>
                </label>
              </div>
              <button className="space-primary" disabled={!issue.title.trim()}>
                Report demo issue <Flag size={15} />
              </button>
            </form>
            <div className="vendor-issues">
              {!selectedIssues.length && (
                <div className="desk-empty">
                  <ShieldCheck size={28} />
                  <p>No issues reported for this merchant.</p>
                </div>
              )}
              {selectedIssues.map((i) => (
                <article key={i.id}>
                  <div>
                    <span className={"issue-priority " + i.priority}>
                      {i.priority}
                    </span>
                    <small>
                      {i.status.replace("_", " ")} · {i.category}
                    </small>
                  </div>
                  <h3>{i.title}</h3>
                  {i.resolution && <p>Resolution: {i.resolution}</p>}
                  {admin && i.status !== "resolved" && (
                    <>
                      <label>
                        Resolution note
                        <input
                          aria-label={"Resolution for " + i.title}
                          maxLength={300}
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="What was checked and fixed?"
                        />
                      </label>
                      <div>
                        <button
                          className="space-secondary"
                          onClick={() =>
                            update((d) => ({
                              ...d,
                              issues: d.issues.map((v) =>
                                v.id === i.id
                                  ? { ...v, status: "in_progress" }
                                  : v,
                              ),
                            }))
                          }
                        >
                          Start handling
                        </button>
                        <button
                          className="space-primary"
                          disabled={!resolution.trim()}
                          onClick={() => {
                            update((d) => resolveIssue(d, i.id, resolution));
                            setResolution("");
                            setNotice(
                              "Issue resolved with a recorded note. Other unmet needs still affect readiness.",
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
        {area === "Orders" && (
          <MarketOrders merchantId={p.id} merchantName={name} />
        )}
      </div>
    </section>
  );
}
export function MarketOrders({ merchantId, merchantName }) {
  const data = useLocalSnapshot(businessKey(merchantId));
  const [notice, setNotice] = useState("");
  function act(id, action) {
    const raw = JSON.parse(localStorage.getItem(businessKey(merchantId)));
    if (!raw) {
      setNotice("No business order store is available.");
      return;
    }
    const next = orderAction(raw, id, action);
    if (next === raw) {
      setNotice(
        "That action is not permitted in the current payment/order state.",
      );
      return;
    }
    localStorage.setItem(businessKey(merchantId), JSON.stringify(next));
    window.dispatchEvent(new Event("kawing:local-change"));
    setNotice(
      "Demo operation updated. Customer receipt uses the same order record.",
    );
  }
  const orders = (data?.orders || []).filter(
    (o) => !o.seed && o.merchantId === merchantId,
  );
  return (
    <section className="market-orders">
      <h3>{merchantName} · Shared order desk</h3>
      <p>
        Cashier confirmation is separate from customer claims. Existing orders
        can be completed after an event closes; new orders are blocked.
      </p>
      {notice && <p role="status">{notice}</p>}
      {!orders.length && (
        <div className="desk-empty">
          <ClipboardCheck size={30} />
          <p>
            No customer demo orders yet. Open an occupied booth in Customer View
            to place one.
          </p>
        </div>
      )}
      {orders.slice(0, 12).map((o) => (
        <article key={o.id}>
          <header>
            <strong>#{o.id}</strong>
            <span>{o.status}</span>
          </header>
          <p>
            {o.sourceEvent
              ? "Booth " + o.sourceEvent.boothId
              : "Business order"}{" "}
            · ₱{o.total} · {o.payment}
          </p>
          <p>{paymentLabel(o)}</p>
          <ul>
            {o.items.map((i) => (
              <li key={i.id}>
                {i.qty} × {i.name}
              </li>
            ))}
          </ul>
          <div>
            {(o.paymentStatus === "claimed" ||
              (o.payment === "Cash" && o.paymentStatus === "selected")) && (
              <button
                className="space-secondary"
                onClick={() => act(o.id, "review")}
              >
                Review payment
              </button>
            )}
            {o.paymentStatus === "reviewing" && (
              <button
                className="space-primary"
                onClick={() => act(o.id, "confirm")}
              >
                Confirm payment
              </button>
            )}
            {["new", "preparing", "ready"].includes(o.status) && (
              <button
                className="space-primary"
                disabled={
                  o.paymentStatus !== "confirmed" &&
                  !(o.payment === "Cash" && o.counterApproved)
                }
                onClick={() => act(o.id, "advance")}
              >
                {
                  {
                    new: "Start preparing",
                    preparing: "Mark ready",
                    ready: "Mark served",
                  }[o.status]
                }
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
