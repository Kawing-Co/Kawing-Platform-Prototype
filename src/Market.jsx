import {BUSINESSES} from "./businesses";
import { seedMarket, validateLayout } from "./market-layout";
export { seedMarket, validateLayout } from "./market-layout";
import BoothMap from "./BoothMap";
import { CustomerPreview } from "./Viewport";
import { VendorDesk } from "./VendorDesk";
import { normalizeMarket, vendorReadiness } from "./operations";
import { useCustomize } from "./session";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  Undo2,
  Save,
  Compass,
  Users,
  LayoutGrid,
  X,
} from "lucide-react";
function load() {
  try {
    const d = JSON.parse(localStorage.getItem("kawing-market-v1"));
    if (
      d?.version === 1 &&
      Array.isArray(d.booths) &&
      Array.isArray(d.profiles)
    )
      return normalizeMarket(d);
  } catch {}
  return normalizeMarket(seedMarket());
}
export default function Market({ role }) {
  const [data, setData] = useState(load),
    // Merchant and Customer open on the shared booth map (KAWING-DEMO-UX-002).
    [tab, setTab] = useState(role === "admin" ? "Vendor desk" : "Map"),
    [customerBusiness, setCustomerBusiness] = useState(null),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [undo, setUndo] = useState([]),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [page, setPage] = useState(1),
    [notice, setNotice] = useState(""),
    [profile, setProfile] = useState("salo"),
    [temp, setTemp] = useState({
      name: "Daily Brew",
      category: "Food & drinks",
      bio: "Carefully brewed coffee and a warm welcome.",
    });
  useEffect(() => {
    try {
      localStorage.setItem("kawing-market-v1", JSON.stringify(data));
    } catch {
      setNotice("Storage unavailable; this session remains usable.");
    }
  }, [data]);
  useEffect(() => {
    window.kawingMapDirty = !!draft;
    return () => {
      window.kawingMapDirty = false;
    };
  }, [draft]);
  useEffect(() => {
    const before = (e) => {
      if (draft) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [draft]);
  const booths = draft || data.booths,
    b = booths.find((b) => b.id === selected),
    existing = data.profiles.find((p) => p.id === b?.merchant);
  let commerce = null;
  try {
    commerce = JSON.parse(localStorage.getItem("kawing-demo-v1"));
  } catch {}
  const publicProfile =
    existing?.id === "salo" && commerce?.brand
      ? {
          ...existing,
          name: commerce.brand.name,
          bio: commerce.brand.bio || commerce.brand.tagline,
        }
      : existing;
  const displayProfiles = data.profiles.map((p) =>
    p.id === "salo" && commerce?.brand
      ? {
          ...p,
          name: commerce.brand.name,
          bio: commerce.brand.bio || commerce.brand.tagline,
        }
      : p,
  );
  const active = data.status === "active",
    visibleProfiles = role === "customer" && !active ? displayProfiles.filter(p => !p.temporary) : displayProfiles,
    filtered = booths.filter(
      (b) =>
        (
          b.id +
          " " +
          b.category +
          " " +
          (visibleProfiles.find((p) => p.id === b.merchant)?.name || "")
        )
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "All" ||
          (filter === "Available"
            ? !b.merchant && !b.blocked
            : filter === "Occupied"
              ? !!b.merchant
              : b.category === filter)),
    );
  useEffect(() => {
    if (selected && !filtered.some(v=>v.id===selected)) setSelected(null);
  }, [query, filter, data.booths]);
  useEffect(() => {
    if (!selected || !matchMedia('(max-width: 750px)').matches) return;
    const frame=requestAnimationFrame(()=>document.getElementById('booth-detail-panel')?.focus({preventScroll:true}));
    return ()=>cancelAnimationFrame(frame);
  }, [selected]);
  function edit(id, patch) {
    if (patch.merchant && data.status !== "active") {
      setNotice("Reactivate the demo event before assigning a new merchant.");
      return;
    }
    setUndo((u) => [...u, structuredClone(draft || data.booths)]);
    setDraft(
      (draft || data.booths).map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
    setNotice("Layout draft changed. Publish locally when ready.");
  }
  useCustomize(() => {
    if (role === "admin") changeTab("Event setup");
    else if (role === "merchant") changeTab("My participation");
  });
  function changeTab(t) {
    if (
      draft &&
      t !== "Layout Editor" &&
      !confirm("Discard the unpublished layout draft?")
    )
      return;
    if (draft && t !== "Layout Editor") setDraft(null);
    setTab(t);
    setPage(1);
  }
  function assign() {
    const current = data.booths.find((v) => v.id === selected);
    if (!active || !current || current.blocked || current.merchant) {
      setNotice(
        "That booth cannot be selected. Choose an available booth in an active demo event.",
      );
      return;
    }
    if (!data.profiles.some((p) => p.id === profile)) {
      setNotice(
        "Create a temporary profile or choose an existing business first.",
      );
      return;
    }
    setData((d) => ({
      ...d,
      booths: d.booths.map((v) =>
        v.id === current.id
          ? { ...v, merchant: profile }
          : v.merchant === profile
            ? { ...v, merchant: null }
            : v,
      ),
      audit: [
        { id: Date.now(), text: profile + " assigned to " + current.id },
        ...d.audit,
      ],
    }));
    setNotice(
      "Demo assignment confirmed locally. Customer and Admin now see the same booth.",
    );
  }
  function publish() {
    const error = validateLayout(draft || data.booths);
    if (error) {
      setNotice(error);
      return;
    }
    setData((d) => ({
      ...d,
      booths: draft || d.booths,
      audit: [
        { id: Date.now(), text: "Demo layout updated locally" },
        ...d.audit,
      ],
    }));
    setDraft(null);
    setUndo([]);
    setNotice(
      "Demo layout published to this browser only. No real event was published.",
    );
  }
  const tabs =
    role === "admin"
      ? [
          "Vendor desk",
          "Map",
          "Layout Editor",
          "Booths",
          "Merchants",
          "Event setup",
        ]
      : role === "merchant"
        ? ["Map", "My participation", "Merchants"]
        : ["Map", "Booth list"];
  if (customerBusiness && role === "customer")
    return (
      <CustomerPreview
        merchantId={customerBusiness.id}
        merchantName={customerBusiness.name}
        boothId={customerBusiness.boothId}
        onBack={() => setCustomerBusiness(null)}
      />
    );
  return (
    <main className={"market-workspace" + (["Map", "Layout Editor"].includes(tab) ? " map-mode" : "")}>
      <div className="market-heading">
        <div>
          <span className="spaces-eyebrow">THE NEIGHBORHOOD, TOGETHER</span>
          <h1>{data.name}</h1>
          <p>
            <MapPin size={14} />
            {data.venue}
            <span className={"market-lifecycle " + data.status}>
              {data.status}
            </span>
          </p>
        </div>
        <span className="market-simulation">
          Fictional event · Local simulation
        </span>
      </div>
      <nav className="market-tabs" aria-label="Market sections">
        {tabs.map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => changeTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {role !== "customer" && (
        <div className="market-command-summary">
          <span>
            <strong>{data.profiles.length}</strong> Vendors
          </span>
          <span>
            <strong>
              {
                data.profiles.filter((p) => vendorReadiness(data, p.id).ready)
                  .length
              }
            </strong>{" "}
            Ready
          </span>
          <span>
            <strong>
              {
                (data.issues || []).filter((i) => i.status !== "resolved")
                  .length
              }
            </strong>{" "}
            Open issues
          </span>
          <span>
            <strong>
              {data.booths.filter((b) => !b.merchant && !b.blocked).length}
            </strong>{" "}
            Available spots
          </span>
          <button
            onClick={() =>
              setTab(role === "admin" ? "Vendor desk" : "My participation")
            }
          >
            Open readiness desk <ArrowRight size={15} />
          </button>
        </div>
      )}
      {["Vendor desk", "My participation"].includes(tab) && (
        <VendorDesk
          data={data}
          update={setData}
          role={role}
          selectedId={profile}
          onSelect={setProfile}
          commerce={commerce}
          onMap={() => {
            setSelected(
              data.booths.find((b) => b.merchant === profile)?.id || null,
            );
            setTab("Map");
          }}
        />
      )}
      {notice && (
        <div className="market-notice" role="status">
          <Check size={17} />
          {notice}
          <button
            aria-label="Dismiss market notice"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {!active && (
        <div className="market-ended">
          {data.status === "ended"
            ? "This demo event has ended. New booth selections are closed. Temporary profiles are no longer publicly discoverable; history is retained."
            : "This event is in draft. Booth selection is closed until the admin activates it."}
        </div>
      )}
      {["Map", "Layout Editor"].includes(tab) && (
        <>
          <div className="map-toolbar">
            <label>
              <Search size={17} />
              <input
                aria-label="Search booths"
                placeholder="Find a booth or business…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <select
              aria-label="Filter booths"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              {["All", "Available", "Occupied", "Food & drinks", "Crafts"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </div>
          <div className="market-map-grid">
            <BoothMap booths={booths} profiles={visibleProfiles} visible={filtered} selected={selected} onSelect={setSelected} editing={tab === "Layout Editor"} onClear={() => {setQuery("");setFilter("All");setPage(1);}} />
            <aside className="booth-detail" id="booth-detail-panel" aria-label="Booth details" data-selected={!!b} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){setSelected(null);document.getElementById('map-'+selected)?.focus();}}}>
              {!b ? (
                <>
                  <span className="detail-icon">
                    <Compass size={30} />
                  </span>
                  <span className="spaces-eyebrow">FIND YOUR PLACE</span>
                  <h2>
                    {role === "merchant"
                      ? "A little spot. A big possibility."
                      : "Meet your next local favorite."}
                  </h2>
                  <p>
                    {role === "merchant"
                      ? "Choose an available booth to preview its position and confirm a simulated assignment."
                      : "Tap a booth on the map, or use the list below. Occupied booths introduce the businesses behind them."}
                  </p>
                  <div className="booth-summary">
                    <strong>
                      {data.booths.filter((b) => b.merchant).length}
                      <small>Local businesses</small>
                    </strong>
                    <strong>
                      {
                        data.booths.filter((b) => !b.merchant && !b.blocked)
                          .length
                      }
                      <small>Available booths</small>
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="booth-detail-top">
                    <span>{b.id}</span>
                    <small>
                      {b.blocked
                        ? "Unavailable"
                        : b.merchant
                          ? "Occupied"
                          : "Available"}
                    </small>
                    <button
                      aria-label="Close booth detail"
                      onClick={() => {setSelected(null);document.getElementById('map-'+selected)?.focus();}}
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <h2>
                    {publicProfile?.temporary && !active && role === "customer"
                      ? "Event-only profile inactive"
                      : publicProfile?.name || "Your place in the market"}
                  </h2>
                  <p>
                    {b.category} · {role === "customer" ? `Booth ${b.id}` : `${b.w} × ${b.h} layout units`}
                  </p>
                  {publicProfile &&
                  (active ||
                    !publicProfile.temporary ||
                    role !== "customer") ? (
                    <>
                      <div className="market-business-logo">
                        {publicProfile.name.slice(0, 1)}
                      </div>
                      <p>{publicProfile.bio}</p>
                      <small>
                        {publicProfile.temporary
                          ? "Temporary event profile · Fictional"
                          : "Existing business profile · Fictional"}
                      </small>
                      {role === "customer" && (
                        <button
                          className="space-primary booth-shop-action"
                          disabled={!active || b.blocked}
                          onClick={() =>
                            setCustomerBusiness({
                              ...publicProfile,
                              boothId: b.id,
                            })
                          }
                        >
                          Open Business Profile <ArrowRight size={16} />
                        </button>
                      )}
                      <h3>A taste of what’s here</h3>
                      {BUSINESSES[publicProfile.id] ? (
                        <div className="booth-products">
                          {(
                            (publicProfile.id === "salo" ? commerce?.menu : null) || BUSINESSES[publicProfile.id]?.menu || [
                              {
                                name: "Matcha Latte",
                                price: 230,
                                image: "/images/matcha/latte-iced-sm.jpg",
                              },
                            ]
                          )
                            .slice(0, 2)
                            .map((p) => (
                              <div key={p.name}>
                                <img src={p.image} alt="" />
                                <span>
                                  {p.name}
                                  <small>₱{p.price} · sample menu</small>
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p>Handcrafted pieces · Sample product display</p>
                      )}
                      <p className="market-hint">
                        Social/contact destination: demonstration only. No
                        fabricated profile or payment page is opened.
                      </p>
                    </>
                  ) : (
                    b.merchant && (
                      <p>
                        This temporary profile is no longer publicly
                        discoverable.
                      </p>
                    )
                  )}
                  {role === "merchant" && (
                    <>
                      {!b.merchant && !b.blocked && (
                        <p className="market-hint">
                          Selected for preview only · Not reserved until you
                          confirm.
                        </p>
                      )}
                      <label>
                        Participating business
                        <select
                          aria-label="Participating business"
                          value={profile}
                          onChange={(e) => setProfile(e.target.value)}
                        >
                          {data.profiles.map((p) => (
                            <option value={p.id} key={p.id}>
                              {p.id === "salo" && commerce?.brand
                                ? commerce.brand.name
                                : p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="space-primary"
                        disabled={!!b.merchant || b.blocked || !active}
                        onClick={assign}
                      >
                        Confirm demo booth <ArrowRight size={17} />
                      </button>
                      {b.merchant === profile && (
                        <button
                          className="space-secondary"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              booths: d.booths.map((v) =>
                                v.id === b.id ? { ...v, merchant: null } : v,
                              ),
                            }));
                            setNotice(
                              "Demo participation cancelled. Business profile retained.",
                            );
                          }}
                        >
                          Cancel my assignment
                        </button>
                      )}
                    </>
                  )}
                  {role === "admin" && tab === "Layout Editor" && (
                    <>
                      <h3>Booth geometry</h3>
                      {["x", "y", "w", "h"].map((k) => (
                        <label key={k}>
                          {
                            {
                              x: "Horizontal position",
                              y: "Vertical position",
                              w: "Width",
                              h: "Height",
                            }[k]
                          }
                          <input
                            type="number"
                            aria-label={"Booth " + k}
                            value={b[k]}
                            onChange={(e) =>
                              edit(b.id, { [k]: Number(e.target.value) })
                            }
                          />
                        </label>
                      ))}
                      <label>
                        Booth category
                        <select
                          value={b.category}
                          onChange={(e) =>
                            edit(b.id, { category: e.target.value })
                          }
                        >
                          <option>Food & drinks</option>
                          <option>Crafts</option>
                        </select>
                      </label>
                      <label className="sf-check">
                        <input
                          type="checkbox"
                          checked={b.blocked}
                          onChange={(e) =>
                            edit(b.id, { blocked: e.target.checked })
                          }
                        />{" "}
                        Mark unavailable
                      </label>
                      <label>
                        Assigned merchant
                        <select
                          aria-label="Assigned merchant"
                          value={b.merchant || ""}
                          onChange={(e) => {
                            if (
                              e.target.value &&
                              booths.some(
                                (v) =>
                                  v.id !== b.id &&
                                  v.merchant === e.target.value,
                              )
                            ) {
                              setNotice(
                                "This merchant already has a booth. Unassign that booth first.",
                              );
                              return;
                            }
                            edit(b.id, { merchant: e.target.value || null });
                          }}
                        >
                          <option value="">Unassigned</option>
                          {data.profiles.map((p) => (
                            <option value={p.id} key={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="space-secondary"
                        onClick={() => {
                          setUndo((u) => [...u, structuredClone(booths)]);
                          setDraft(booths.filter((v) => v.id !== b.id));
                          setSelected(null);
                        }}
                      >
                        Remove demo booth
                      </button>
                    </>
                  )}
                </>
              )}
            </aside>
          </div>
          {role === "admin" && tab === "Layout Editor" && (
            <div className="layout-save">
              <span>
                {draft
                  ? "Unpublished draft · " +
                    (validateLayout(draft) || "Layout valid")
                  : "Published local layout · Select a booth to edit"}
              </span>
              <div>
                <button
                  onClick={() => {
                    const n =
                      Math.max(...booths.map((b) => Number(b.id.slice(1)))) + 1;
                    setUndo((u) => [...u, structuredClone(booths)]);
                    setDraft([
                      ...booths,
                      {
                        id: "B" + String(n).padStart(2, "0"),
                        x: 5,
                        y: 47,
                        w: 10,
                        h: 10,
                        category: "Crafts",
                        blocked: false,
                        merchant: null,
                      },
                    ]);
                    setSelected("B" + String(n).padStart(2, "0"));
                    setNotice(
                      "New booth added as a draft. Move it to a clear position before publishing.",
                    );
                  }}
                >
                  <Plus size={15} />
                  Add booth
                </button>
                <button
                  disabled={!undo.length}
                  onClick={() => {
                    setDraft(undo[undo.length - 1]);
                    setUndo((u) => u.slice(0, -1));
                  }}
                >
                  <Undo2 size={15} />
                  Undo
                </button>
                <button
                  onClick={() => {
                    setDraft(null);
                    setUndo([]);
                    setNotice("Draft cancelled; published layout retained.");
                  }}
                >
                  Cancel draft
                </button>
                <button className="space-primary" onClick={publish}>
                  <Save size={15} />
                  Publish demo layout
                </button>
              </div>
            </div>
          )}
          <BoothList
            booths={filtered}
            profiles={
              role === "customer" && !active
                ? displayProfiles.filter((p) => !p.temporary)
                : displayProfiles
            }
            selected={selected}
            select={setSelected}
            page={page}
            setPage={setPage}
          />
        </>
      )}
      {["Booths", "Booth list"].includes(tab) && (
        <BoothList
          booths={data.booths}
          profiles={
            role === "customer" && !active
              ? displayProfiles.filter((p) => !p.temporary)
              : displayProfiles
          }
          selected={selected}
          select={(id) => {
            setSelected(id);
            setTab("Map");
          }}
          page={page}
          setPage={setPage}
        />
      )}
      {tab === "Merchants" && (
        <section className="market-panel">
          <h2>
            {role === "merchant"
              ? "Bring your business along."
              : "The people behind the booths."}
          </h2>
          <p>
            Existing merchants keep their business identity. Event-only sellers
            can use a short temporary profile.
          </p>
          <form
            className="temporary-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!active) {
                setNotice(
                  "The event must be active to add a temporary participant.",
                );
                return;
              }
              const p = {
                ...temp,
                id: temp.id || "temp-" + crypto.randomUUID().slice(0, 8),
                temporary: true,
              };
              setData((d) => ({
                ...d,
                profiles: d.profiles.some((v) => v.id === p.id)
                  ? d.profiles.map((v) => (v.id === p.id ? p : v))
                  : [...d.profiles, p],
              }));
              setProfile(p.id);
              setNotice(
                "Temporary demo profile created. Select an available booth on the map to attach it.",
              );
              setTab("Map");
            }}
          >
            <h3>Create Temporary Merchant Profile</h3>
            <label>
              Business name
              <input
                required
                maxLength={45}
                value={temp.name}
                onChange={(e) => setTemp({ ...temp, name: e.target.value })}
              />
            </label>
            <label>
              Category
              <select
                value={temp.category}
                onChange={(e) => setTemp({ ...temp, category: e.target.value })}
              >
                <option>Food & drinks</option>
                <option>Crafts</option>
              </select>
            </label>
            <label>
              Short description
              <textarea
                maxLength={200}
                value={temp.bio}
                onChange={(e) => setTemp({ ...temp, bio: e.target.value })}
              />
            </label>
            <button className="space-primary" disabled={!active}>
              Create temporary demo profile <Plus size={16} />
            </button>
          </form>
          <div className="market-vendor-list">
            {data.profiles.slice((page - 1) * 5, page * 5).map((p) => (
              <article key={p.id}>
                <span>{p.name.slice(0, 1)}</span>
                <div>
                  <h3>{p.name}</h3>
                  <p>
                    {p.category} ·{" "}
                    {p.temporary ? "Event only" : "Existing merchant"} ·{" "}
                    {data.status === "ended" && p.temporary
                      ? "Inactive"
                      : "Demo profile"}
                  </p>
                </div>
                <small>
                  {data.booths.find((b) => b.merchant === p.id)?.id ||
                    "No booth"}
                </small>
                {p.temporary && active && (
                  <button
                    className="space-secondary"
                    onClick={() => {
                      setTemp({ ...p });
                      setNotice(
                        "Editing temporary profile. Save using the form above.",
                      );
                    }}
                  >
                    Edit profile
                  </button>
                )}
              </article>
            ))}
          </div>
          <Pager page={page} setPage={setPage} total={data.profiles.length} />
        </section>
      )}
      {tab === "Event setup" && (
        <section className="market-panel">
          <h2>A shared event, clearly managed.</h2>
          <label>
            Event name
            <input
              value={data.name}
              maxLength={60}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label>
            Venue label
            <input
              value={data.venue}
              maxLength={90}
              onChange={(e) =>
                setData((d) => ({ ...d, venue: e.target.value }))
              }
            />
          </label>
          <label>
            Demo event lifecycle
            <select
              aria-label="Event lifecycle"
              value={data.status}
              onChange={(e) => {
                setData((d) => ({ ...d, status: e.target.value }));
                setNotice(
                  "Lifecycle updated across all demo views. Historical assignments are retained.",
                );
              }}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </label>
          <p>
            Ending the event closes new reservations and hides temporary
            profiles from customer discovery. Existing merchant business
            profiles survive. No event checkout, real booking, or publication
            service is connected.
          </p>
          <button
            className="space-secondary"
            onClick={() => {
              if (
                confirm(
                  "Reset the market fixture? Local booth assignments and drafts will be cleared.",
                )
              ) {
                setData(normalizeMarket(seedMarket()));
                setDraft(null);
                setSelected(null);
                setNotice(
                  "Market reset to its deterministic fixture. Restaurant orders and profile are unchanged.",
                );
              }
            }}
          >
            Reset market demo
          </button>
          <h3>Recent local activity</h3>
          {data.audit.slice((page - 1) * 5, page * 5).map((a, i) => (
            <p key={i}>{a.text}</p>
          ))}
          <Pager page={page} setPage={setPage} total={data.audit.length} />
        </section>
      )}
    </main>
  );
}
function Pager({ page, setPage, total }) {
  const pages = Math.max(1, Math.ceil(total / 5));
  return (
    <div className="market-pager">
      <span>
        {total} records · Page {Math.min(page, pages)} of {pages}
      </span>
      <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        Previous
      </button>
      <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
        Next
      </button>
    </div>
  );
}
function BoothList({ booths, profiles, selected, select, page, setPage }) {
  return (
    <section className="booth-list" aria-label="Accessible booth list">
      <div>
        <h2>Every spot, at a glance.</h2>
        <p>A keyboard-friendly alternative to the map.</p>
      </div>
      {booths.slice((page - 1) * 5, page * 5).map((b) => (
        <button
          className={selected === b.id ? "selected" : ""}
          key={b.id}
          onClick={() => select(b.id)}
        >
          <strong>{b.id}</strong>
          <span>
            {profiles.find((p) => p.id === b.merchant)?.name || b.category}
          </span>
          <small>
            {b.blocked ? "Unavailable" : b.merchant ? "Occupied" : "Available"}
          </small>
          <ArrowRight size={15} />
        </button>
      ))}
      {!booths.length && <p>No matching booths. Try another search.</p>}
      <Pager page={page} setPage={setPage} total={booths.length} />
    </section>
  );
}
