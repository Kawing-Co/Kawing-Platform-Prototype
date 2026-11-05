import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  Minus,
  Maximize,
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
export const seedMarket = () => ({
  version: 1,
  name: "The Sunday Commons",
  venue: "Riverside Pavilion · Fictional event",
  status: "active",
  booths: Array.from({ length: 10 }, (_, i) => ({
    id: "B" + String(i + 1).padStart(2, "0"),
    x: 5 + (i % 5) * 19,
    y: i < 5 ? 8 : 47,
    w: 14,
    h: 15,
    category:
      i === 1
        ? "Food & drinks"
        : i === 6
          ? "Crafts"
          : i % 2
            ? "Crafts"
            : "Food & drinks",
    blocked: i === 8,
    merchant: i === 1 ? "salo" : i === 6 ? "luna" : null,
  })),
  profiles: [
    {
      id: "salo",
      name: "Salo Kitchen",
      category: "Food & drinks",
      bio: "Fresh, local, made with love. An existing merchant joining the neighborhood market.",
      temporary: false,
    },
    {
      id: "luna",
      name: "Luna Made",
      category: "Crafts",
      bio: "Small-batch ceramics for everyday rituals. Fictional event-only seller.",
      temporary: true,
    },
  ],
  audit: [],
});
export function validateLayout(booths) {
  const ids = new Set();
  for (const b of booths) {
    if (ids.has(b.id)) return "Each booth needs a unique ID.";
    ids.add(b.id);
    if (
      ![b.x, b.y, b.w, b.h].every(Number.isFinite) ||
      b.w < 5 ||
      b.h < 5 ||
      b.x < 0 ||
      b.y < 0 ||
      b.x + b.w > 100 ||
      b.y + b.h > 70
    )
      return (
        b.id +
        ": keep the booth inside the venue with a minimum 5 × 5 footprint."
      );
    if (b.y < 41 && b.y + b.h > 29)
      return b.id + ": keep the central walkway clear.";
    for (const a of booths) {
      if (a.id === b.id) continue;
      if (
        b.x < a.x + a.w &&
        b.x + b.w > a.x &&
        b.y < a.y + a.h &&
        b.y + b.h > a.y
      )
        return b.id + " overlaps " + a.id + ".";
    }
  }
  return "";
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem("kawing-market-v1"));
    if (
      d?.version === 1 &&
      Array.isArray(d.booths) &&
      Array.isArray(d.profiles)
    )
      return d;
  } catch {}
  return seedMarket();
}
export default function Market({ role }) {
  const [data, setData] = useState(load),
    [tab, setTab] = useState("Map"),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [undo, setUndo] = useState([]),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [page, setPage] = useState(1),
    [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 }),
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
    filtered = booths.filter(
      (b) =>
        (
          b.id +
          " " +
          b.category +
          " " +
          (displayProfiles.find((p) => p.id === b.merchant)?.name || "")
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
      ? ["Map", "Layout Editor", "Booths", "Merchants", "Event setup"]
      : role === "merchant"
        ? ["Map", "My participation"]
        : ["Map", "Booth list"];
  return (
    <main className="market-workspace">
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
            <div>
              <button
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <Minus size={17} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              >
                <Plus size={17} />
              </button>
              <button
                aria-label="Fit map"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                <Maximize size={17} />
              </button>
            </div>
          </div>
          <div className="market-map-grid">
            <section className="venue-map" aria-label="Interactive market map">
              <div className="venue-title">
                <span>RIVERSIDE PAVILION</span>
                <small>North entrance ↑</small>
              </div>
              <svg
                viewBox={`${pan.x} ${pan.y} ${100 / zoom} ${70 / zoom}`}
                role="group"
                aria-label="Booth layout"
              >
                <rect width="100" height="70" rx="2" fill="#f1f2e9" />
                <rect x="0" y="29" width="100" height="12" fill="#fffdf7" />
                <path
                  d="M0 35H100"
                  stroke="#d4d9c8"
                  strokeDasharray="1 1"
                  strokeWidth=".25"
                />
                <text
                  x="50"
                  y="36"
                  textAnchor="middle"
                  fontSize="2"
                  fill="#8b977d"
                  letterSpacing=".6"
                >
                  THE COMMON WALKWAY
                </text>
                {booths
                  .filter((v) => filtered.some((f) => f.id === v.id))
                  .map((v) => (
                    <g
                      key={v.id}
                      role="button"
                      tabIndex="0"
                      aria-label={`${v.id} ${v.blocked ? "Unavailable" : v.merchant ? "Occupied" : "Available"}`}
                      onClick={() => setSelected(v.id)}
                      onKeyDown={(e) => {
                        if (["Enter", " "].includes(e.key)) {
                          e.preventDefault();
                          setSelected(v.id);
                        }
                      }}
                      className={
                        "map-booth " +
                        (selected === v.id ? "selected " : "") +
                        (v.blocked
                          ? "blocked"
                          : v.merchant
                            ? "occupied"
                            : "available")
                      }
                    >
                      <rect x={v.x} y={v.y} width={v.w} height={v.h} rx="1.2" />
                      <text
                        x={v.x + v.w / 2}
                        y={v.y + v.h / 2}
                        textAnchor="middle"
                        fontSize="3"
                        fontWeight="600"
                      >
                        {v.id}
                      </text>
                      <text
                        x={v.x + v.w / 2}
                        y={v.y + v.h - 2}
                        textAnchor="middle"
                        fontSize="1.65"
                      >
                        {v.blocked
                          ? "UNAVAILABLE"
                          : v.merchant
                            ? "OCCUPIED"
                            : "AVAILABLE"}
                      </text>
                    </g>
                  ))}
              </svg>
              <div className="map-pan">
                <span>Pan map</span>
                {[
                  ["←", -10, 0],
                  ["↑", 0, -7],
                  ["↓", 0, 7],
                  ["→", 10, 0],
                ].map(([s, x, y]) => (
                  <button
                    key={s}
                    aria-label={"Pan " + s}
                    onClick={() =>
                      setPan((p) => ({
                        x: Math.min(100 - 100 / zoom, Math.max(0, p.x + x)),
                        y: Math.min(70 - 70 / zoom, Math.max(0, p.y + y)),
                      }))
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="map-legend">
                <span>
                  <i />
                  Available
                </span>
                <span>
                  <i />
                  Occupied
                </span>
                <span>
                  <i />
                  Unavailable
                </span>
                <span>
                  <i />
                  Selected
                </span>
              </div>
            </section>
            <aside className="booth-detail">
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
                      onClick={() => setSelected(null)}
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
                    {b.category} · {b.w} × {b.h} layout units
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
                      <h3>A taste of what’s here</h3>
                      {publicProfile.id === "salo" ? (
                        <div className="booth-products">
                          {(
                            commerce?.menu || [
                              {
                                name: "Harvest bowl",
                                price: 285,
                                image: "/images/bowl.jpg",
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
      {(tab === "Merchants" || tab === "My participation") && (
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
                setData(seedMarket());
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
