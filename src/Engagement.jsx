import React, { useState } from "react";
import {
  Check,
  MessageSquare,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
export default function Engagement({ data, update }) {
  const [category, setCategory] = useState("All"),
    [status, setStatus] = useState("All");
  const count = (type) => data.events.filter((e) => e.type === type).length;
  const clicks = count("review_click"),
    views = count("review_view");
  const clickedViews = new Set(
    data.events
      .filter(
        (e) =>
          e.type === "review_click" &&
          data.events.some(
            (v) => v.type === "review_view" && v.detail === e.detail,
          ),
      )
      .map((e) => e.detail),
  ).size;
  const served = data.orders.filter((o) => !o.seed && o.status === "served"),
    gross = served.reduce((s, o) => s + o.total, 0),
    refunded = data.orders
      .filter((o) => !o.seed && o.status === "refunded")
      .reduce((s, o) => s + o.total, 0);
  return (
    <div className="engagement">
      <span className="eyebrow">
        CUSTOMER ENGAGEMENT · BROWSER-LOCAL DEMO EVENTS
      </span>
      <h1>From a visit to a relationship.</h1>
      <p>
        These counts come from interactions in this browser. They are not real
        customer tracking, cross-device people, or confirmed external actions.
        Review CTR is the share of review views with an outgoing click; repeated
        clicks are counted separately.
      </p>
      <div className="engagement-grid">
        {[
          ["Business Profile opens", count("storefront_visit")],
          ["Menu opens", count("menu_open")],
          ["Cart starts", count("cart_start")],
          ["Orders submitted", data.orders.filter((o) => !o.seed).length],
          ["Completed orders", served.length],
          ["Loyalty enrollments", count("loyalty_enroll")],
          ["Returning member links", count("loyalty_return")],
          ["Review-link views", views],
          ["Review-link clicks", clicks],
          [
            "Review-link CTR",
            views ? Math.round((clickedViews / views) * 100) + "%" : "—",
          ],
          ["Social outgoing clicks", count("social_click")],
          ["Wi-Fi opens", count("wifi_open")],
          ["Private feedback", count("feedback_submit")],
          ["Offer opens", count("promotion_impression")],
          ["Offer CTA clicks", count("promotion_click")],
          ["Game sessions", count("game_session")],
        ].map(([label, value]) => (
          <div className="panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="panel engagement-explainer">
        <h2>The connected order journey</h2>
        <div className="engagement-flow">
          {[
            ["Business Profile", "storefront_visit"],
            ["Menu", "menu_open"],
            ["Cart", "cart_start"],
          ].map(([name, type]) => (
            <span key={type}>
              <strong>{count(type)}</strong>
              {name} opens <ArrowRight size={14} />
            </span>
          ))}
          <span>
            <strong>{data.orders.filter((o) => !o.seed).length}</strong>
            Submitted orders
            <ArrowRight size={14} />
          </span>
          <span>
            <strong>{served.length}</strong>Completed orders
          </span>
        </div>
        <p>
          Activity counts use different units and may repeat. This is a journey
          visualization, not a conversion funnel or unique-visitor estimate. No
          conversion rate or campaign attribution is inferred.
        </p>
      </section>
      <section className="panel engagement-explainer">
        <h2>Fulfilled sales & product activity</h2>
        <div className="engagement-flow">
          <span>
            <strong>₱{gross + refunded}</strong>Gross completed demo sales
          </span>
          <span>
            <strong>₱{gross}</strong>Net after demonstrated refunds
          </span>
          <span>
            <strong>
              ₱{served.length ? Math.round(gross / served.length) : 0}
            </strong>
            Average completed order
          </span>
        </div>
        <p>
          Orders submitted locally: today{" "}
          {
            data.orders.filter(
              (o) => !o.seed && Date.now() - (o.createdAt || 0) < 86400000,
            ).length
          }{" "}
          · 7 days{" "}
          {
            data.orders.filter(
              (o) => !o.seed && Date.now() - (o.createdAt || 0) < 7 * 86400000,
            ).length
          }{" "}
          · 30 days{" "}
          {
            data.orders.filter(
              (o) => !o.seed && Date.now() - (o.createdAt || 0) < 30 * 86400000,
            ).length
          }
          . Seeded overview remains illustrative.
        </p>
        {data.menu.map((m) => {
          const sold = served.reduce(
            (s, o) =>
              s +
              o.items
                .filter((i) => i.id === m.id)
                .reduce((a, i) => a + i.qty, 0),
            0,
          );
          return (
            <div className="engagement-product" key={m.id}>
              <span>{m.name}</span>
              <strong>{sold} fulfilled</strong>
            </div>
          );
        })}
      </section>
      <section className="panel engagement-explainer">
        <h2>
          <MessageSquare size={19} /> Private feedback inbox
        </h2>
        <p>
          Owner-only presentation view. This prototype has no real
          authentication; use fictional notes only. Reviews remain available
          regardless of ratings.
        </p>
        <div className="engagement-filters">
          <label>
            Filter category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "All",
                "Food and drinks",
                "Staff service",
                "Waiting time",
                "Cleanliness",
                "Ordering experience",
                "Other",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Filter status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["All", "new", "reviewed", "resolved"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {data.feedback.filter((f) => f.status === "new").length} new ·{" "}
          {data.feedback.filter((f) => f.status === "reviewed").length} reviewed
          · {data.feedback.filter((f) => f.status === "resolved").length}{" "}
          resolved. Category trends:{" "}
          {[
            "Food and drinks",
            "Staff service",
            "Waiting time",
            "Cleanliness",
            "Ordering experience",
            "Other",
          ]
            .map(
              (c) =>
                `${c}: ${data.feedback.filter((f) => f.category === c).length}`,
            )
            .join(" · ")}
          .
        </p>
        {data.feedback
          .filter(
            (f) =>
              (category === "All" || f.category === category) &&
              (status === "All" || f.status === status),
          )
          .map((f) => (
            <article className="feedback-record" key={f.id}>
              <span>
                {f.category} · {f.rating ? f.rating + "/5" : "No rating"} ·{" "}
                {f.status}
              </span>
              <p>{f.message || "No written message."}</p>
              {f.contact && (
                <small>
                  Fictional contact: {f.contact} ·{" "}
                  {f.consent ? "Consent recorded" : "No follow-up consent"}
                </small>
              )}
              <div>
                <button
                  disabled={f.status !== "new"}
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      feedback: d.feedback.map((v) =>
                        v.id === f.id ? { ...v, status: "reviewed" } : v,
                      ),
                    }))
                  }
                >
                  Mark reviewed
                </button>
                <button
                  disabled={f.status === "resolved"}
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      feedback: d.feedback.map((v) =>
                        v.id === f.id ? { ...v, status: "resolved" } : v,
                      ),
                    }))
                  }
                >
                  <Check size={14} />
                  Mark resolved
                </button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
