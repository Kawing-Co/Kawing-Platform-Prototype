import React, { useState } from "react";
import { Check, ArrowRight, ShieldCheck, Store, LifeBuoy } from "lucide-react";
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
            <span>
              {current === id ? <Check size={18} /> : name.slice(0, 1)}
            </span>
            <h3>{name}</h3>
            <p>{desc}</p>
            <strong>{n} demo media slots</strong>
          </button>
        ))}
      </div>
      <small>
        Packages do not activate POS, payment integrations, or the event map.
        Those are separate decisions.
      </small>
    </section>
  );
}
export default function AdminSpace({ data, update }) {
  const [tab, setTab] = useState("Overview"),
    [notice, setNotice] = useState("");
  return (
    <main className="admin-space">
      <div className="market-heading">
        <div>
          <span className="spaces-eyebrow">
            KAWING OPERATOR · FICTIONAL WORKSPACE
          </span>
          <h1>A clear view of the whole.</h1>
          <p>
            Manage this merchant’s demo setup without mixing customer and
            creator controls.
          </p>
        </div>
        <ShieldCheck size={38} />
      </div>
      <nav className="market-tabs">
        {["Overview", "Packages", "Setup review", "Support"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {notice && (
        <p className="market-notice" role="status">
          {notice}
        </p>
      )}
      {tab === "Overview" && (
        <>
          <div className="admin-summary">
            {[
              ["Business profiles", "1"],
              ["Sample orders", data.orders.length],
              [
                "Open feedback",
                data.feedback.filter((f) => f.status !== "resolved").length,
              ],
              ["Package", (data.presentationTier || "growth").toUpperCase()],
            ].map(([k, v]) => (
              <article key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </article>
            ))}
          </div>
          <section className="market-panel">
            <span className="detail-icon">
              <Store size={26} />
            </span>
            <h2>{data.brand.name}</h2>
            <p>{data.brand.tagline}</p>
            <div className="admin-checklist">
              <p>
                <Check size={17} /> Business identity configured
              </p>
              <p>
                <Check size={17} /> Customer modules available
              </p>
              <p>
                <Check size={17} /> Cashier verification is separate from
                customer payment claim
              </p>
              <p>
                <Check size={17} /> Browser-local simulation · No production
                onboarding
              </p>
            </div>
            <button
              className="space-primary"
              onClick={() => setTab("Setup review")}
            >
              Review merchant setup <ArrowRight size={16} />
            </button>
          </section>
        </>
      )}
      {tab === "Packages" && <TierPanel data={data} update={update} />}{" "}
      {tab === "Setup review" && (
        <section className="market-panel">
          <h2>Ready for a demonstration.</h2>
          <div className="admin-checklist">
            {[
              ["Business name", data.brand.name],
              ["Business category", data.brand.category || "Restaurant & café"],
              [
                "Visible modules",
                data.storefront.modules.filter((m) => m.enabled).length,
              ],
              ["Payment policy", data.operations.policy],
              [
                "Table links",
                Object.entries(data.storefront.tables)
                  .filter(([_, v]) => v)
                  .map(([k]) => k)
                  .join(", "),
              ],
            ].map(([k, v]) => (
              <p key={k}>
                <Check size={17} />
                <strong>{k}</strong>
                <span>{v}</span>
              </p>
            ))}
          </div>
          <button
            className="space-primary"
            onClick={() =>
              setNotice(
                "Demo setup marked reviewed in this session. No account was approved or invitation sent.",
              )
            }
          >
            Mark demo setup reviewed
          </button>
        </section>
      )}
      {tab === "Support" && (
        <section className="market-panel">
          <LifeBuoy size={35} />
          <h2>A little help, clearly handled.</h2>
          <p>
            Choose a fictional support topic. This does not contact a team or
            create a real ticket.
          </p>
          <label>
            Support topic
            <select>
              <option>Business setup</option>
              <option>Customization</option>
              <option>Ordering workflow</option>
            </select>
          </label>
          <button
            className="space-primary"
            onClick={() =>
              setNotice(
                "Fictional support request recorded for demonstration only. Nothing was sent externally.",
              )
            }
          >
            Simulate support request
          </button>
        </section>
      )}
    </main>
  );
}
