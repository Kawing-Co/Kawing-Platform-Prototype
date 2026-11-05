import { DeviceFrame } from "./Viewport";
import { devices } from "./experience";
import { TierPanel } from "./AdminSpace";
import React, { useState, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  Check,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Palette,
  Layers,
  Gift,
  Settings2,
  Image,
} from "lucide-react";
import { defaults, config, safeUrl, labels } from "./commerce";
export default function Studio({ data, update, navigate }) {
  const retained = () => {
    try {
      return JSON.parse(localStorage.getItem("kawing-studio-draft"));
    } catch {
      return null;
    }
  };
  const [draft, setDraft] = useState(
      () => retained()?.draft || structuredClone(data.storefront),
    ),
    [brand, setBrand] = useState(() => retained()?.brand || { ...data.brand }),
    [tab, setTab] = useState("Brand"),
    [size, setSize] = useState("phone"),
    [selectedEdit, setSelectedEdit] = useState("brand"),
    [mobilePane, setMobilePane] = useState("edit"),
    [message, setMessage] = useState("");
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(data.storefront) ||
    JSON.stringify(brand) !== JSON.stringify(data.brand);
  useEffect(() => {
    window.kawingStudioDirty = dirty;
    try {
      if (dirty)
        localStorage.setItem(
          "kawing-studio-draft",
          JSON.stringify({ draft, brand }),
        );
      else localStorage.removeItem("kawing-studio-draft");
    } catch {}
    return () => {
      window.kawingStudioDirty = false;
    };
  }, [dirty, draft, brand]);
  useEffect(() => {
    const h = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  function selectPreview(id) {
    setSelectedEdit(id);
    setMobilePane("edit");
    setTab(
      {
        brand: "Brand",
        business: "Business details",
        layout: "Layout",
        gallery: "Media & tier",
        order: "Menu",
        loyalty: "Loyalty",
        wifi: "Content",
        review: "Content",
        promotions: "Content",
        social: "Content",
      }[id] || "Modules",
    );
  }
  useEffect(() => {
    if (tab !== "Content") return;
    const targets = {
      wifi: "Guest Wi-Fi",
      review: "Google review",
      promotions: "Merchant-owned promotion",
      social: "Social links",
    };
    document.querySelectorAll(".studio-controls details").forEach((el) => {
      el.open = targets[selectedEdit]
        ? el.querySelector("summary")?.textContent === targets[selectedEdit]
        : el === document.querySelector(".studio-controls details");
    });
  }, [tab, selectedEdit]);
  const change = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const theme = (k, v) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, [k]: v } }));
  const nested = (k, field, value) =>
    setDraft((d) => ({ ...d, [k]: { ...d[k], [field]: value } }));
  function move(type, delta) {
    const arr = [...draft.modules],
      i = arr.findIndex((m) => m.type === type),
      j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    change(
      "modules",
      arr.map((m, order) => ({ ...m, order })),
    );
  }
  function moduleChange(type, k, v) {
    change(
      "modules",
      draft.modules.map((m) => (m.type === type ? { ...m, [k]: v } : m)),
    );
  }
  function save() {
    if (draft.reviewUrl && !safeUrl(draft.reviewUrl, "Google Review")) {
      setMessage(
        "Enter a valid HTTPS Google review destination, or leave blank for an honest demo.",
      );
      return;
    }
    if (draft.socials.some((l) => l.url && !safeUrl(l.url, l.platform))) {
      setMessage(
        "A social destination is invalid. Use HTTPS and the matching platform host, or leave blank.",
      );
      return;
    }
    if (draft.promotion.start > draft.promotion.end) {
      setMessage("Promotion end date must follow the start date.");
      return;
    }
    const clean = { ...config(draft), tables: { ...data.storefront.tables } };
    update((d) => ({
      ...d,
      savedStudio: { storefront: d.storefront, brand: d.brand },
      storefront: clean,
      brand: { ...brand, accent: clean.theme.primary },
    }));
    setDraft(clean);
    setBrand({ ...brand, accent: clean.theme.primary });
    setMessage(
      "Business Profile design saved. Customer mode now uses this design. Orders and payment records are unchanged.",
    );
  }
  function restore() {
    if (!data.savedStudio) return;
    const saved = structuredClone(data.savedStudio);
    update((d) => ({
      ...d,
      storefront: { ...saved.storefront, tables: { ...d.storefront.tables } },
      brand: saved.brand,
      savedStudio: { storefront: d.storefront, brand: d.brand },
    }));
    setDraft({ ...saved.storefront, tables: { ...data.storefront.tables } });
    setBrand(saved.brand);
    setMessage(
      "Previous saved design restored. Operational records are unchanged.",
    );
  }
  const select = (label, value, options, fn) => (
    <label>
      {label}
      <select value={value} onChange={(e) => fn(e.target.value)}>
        {options.map((v) => (
          <option
            value={Array.isArray(v) ? v[0] : v}
            key={Array.isArray(v) ? v[0] : v}
          >
            {Array.isArray(v) ? v[1] : v}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className={"studio studio-interactive mobile-pane-" + mobilePane}>
      <div className="studio-heading">
        <div>
          <span className="eyebrow">CUSTOMIZATION</span>
          <h1>
            Kawing Studio
            <span className="studio-draft-label">
              {dirty ? "Unsaved draft" : "Saved design"}
            </span>
          </h1>
          <p>
            Design in context. Click a highlighted section in the live preview
            to edit it.
          </p>
        </div>
        <button className="button primary" onClick={save}>
          <Save size={16} /> Save design
        </button>
      </div>
      <div className="studio-toolbar">
        <div
          role="tablist"
          aria-label="Studio sections"
          onKeyDown={(e) => {
            const tabs = [...e.currentTarget.querySelectorAll("[role=tab]")],
              i = tabs.indexOf(document.activeElement);
            let n = i;
            if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
            else if (e.key === "ArrowLeft")
              n = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === "Home") n = 0;
            else if (e.key === "End") n = tabs.length - 1;
            else return;
            e.preventDefault();
            tabs[n].focus();
            tabs[n].click();
          }}
        >
          {[
            "Business details",
            "Brand",
            "Layout",
            "Modules",
            "Content",
            "Loyalty",
            "Operations",
            "Media & tier",
            "Review",
            "Menu",
          ].map((t) => (
            <button
              role="tab"
              aria-selected={tab === t}
              key={t}
              onClick={() => {
                setTab(t);
                setMobilePane("edit");
                setSelectedEdit(
                  t === "Brand" ? "brand" : t === "Layout" ? "layout" : null,
                );
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          className="button secondary"
          onClick={() => navigate("Customer")}
        >
          Open customer experience
        </button>
      </div>
      <div className="studio-mobile-switch">
        <button
          aria-pressed={mobilePane === "edit"}
          onClick={() => setMobilePane("edit")}
        >
          Edit settings
        </button>
        <button
          aria-pressed={mobilePane === "preview"}
          onClick={() => setMobilePane("preview")}
        >
          Live preview
        </button>
      </div>
      <div className="studio-grid">
        <section
          className="studio-controls"
          aria-label={tab + " settings"}
          key={tab}
        >
          <div className="inspector-context">
            <span>EDITING</span>
            <strong>
              {selectedEdit && labels[selectedEdit]
                ? labels[selectedEdit]
                : tab}
            </strong>
            <small>
              {selectedEdit && labels[selectedEdit]
                ? "Selected directly from the preview"
                : "Changes appear in the live draft"}
            </small>
          </div>
          {tab === "Menu" && (
            <>
              <h2>What’s on offer.</h2>
              <p>
                Menu availability is operational: updates apply immediately to
                the customer menu. Presentation drafts do not alter prices.
              </p>
              {data.menu.map((item) => (
                <div className="inspector-menu-item" key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>₱{item.price}</small>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      aria-label={"Studio availability " + item.name}
                      checked={item.available}
                      onChange={(e) =>
                        update((d) => ({
                          ...d,
                          menu: d.menu.map((m) =>
                            m.id === item.id
                              ? { ...m, available: e.target.checked }
                              : m,
                          ),
                        }))
                      }
                    />
                    Available
                  </label>
                </div>
              ))}
            </>
          )}
          {tab === "Business details" && (
            <>
              <h2>Your business, at a glance.</h2>
              <p>
                Business Profile only. No event booth or map is needed for
                Merchant Setup.
              </p>
              {[
                ["name", "Business name"],
                ["category", "Business category"],
                ["bio", "Short business description"],
                ["address", "Business address"],
                ["hours", "Opening hours"],
                ["contact", "Contact information"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    maxLength={key === "bio" ? 220 : 100}
                    value={brand[key] || ""}
                    onChange={(e) =>
                      setBrand({ ...brand, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </>
          )}
          {tab === "Media & tier" && (
            <>
              <TierPanel data={data} update={update} />
              <h3>Approved media library</h3>
              <div className="studio-gallery-editor">
                <p>
                  {(draft.galleryAssets || []).length} of{" "}
                  {data.presentationTier === "basic"
                    ? 2
                    : data.presentationTier === "bespoke"
                      ? 12
                      : 6}{" "}
                  gallery slots used
                </p>
                <div className="studio-images">
                  {(draft.galleryAssets || []).map((src, i) => (
                    <button
                      key={i}
                      aria-label={"Remove gallery image " + (i + 1)}
                      onClick={() =>
                        change(
                          "galleryAssets",
                          draft.galleryAssets.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <img src={src} alt="Demo gallery" />
                    </button>
                  ))}
                </div>
                <button
                  className="button secondary"
                  disabled={
                    (draft.galleryAssets || []).length >=
                    (data.presentationTier === "basic"
                      ? 2
                      : data.presentationTier === "bespoke"
                        ? 12
                        : 6)
                  }
                  onClick={() =>
                    change("galleryAssets", [
                      ...(draft.galleryAssets || []),
                      [
                        "/images/bowl.jpg",
                        "/images/salad.jpg",
                        "/images/drink.jpg",
                      ][(draft.galleryAssets || []).length % 3],
                    ])
                  }
                >
                  Add approved gallery image
                </button>
                <p className="studio-help">
                  Downgrading keeps existing images; adding more is disabled
                  until below the new quota. Click an image to remove it.
                </p>
              </div>
              <p>
                {data.presentationTier === "basic"
                  ? "2"
                  : data.presentationTier === "bespoke"
                    ? "12"
                    : "6"}{" "}
                media slots in this demonstration. No arbitrary executable
                content is accepted.
              </p>
              <p>
                Use the logo and cover selectors under Brand. File uploads and
                server storage are future integrations.
              </p>
              <button
                className="button secondary"
                disabled={data.presentationTier === "basic"}
                onClick={() => {
                  setDraft((d) => ({
                    ...d,
                    theme: {
                      ...d.theme,
                      primary: "#854a36",
                      secondary: "#f0e3d8",
                      typography: "editorial",
                    },
                  }));
                  setMessage(
                    "Mock style suggestion applied to draft. No AI API was called.",
                  );
                }}
              >
                Try a mock style suggestion
              </button>
            </>
          )}
          {tab === "Review" && (
            <>
              <h2>A considered final look.</h2>
              <p>
                Preview the customer experience beside your draft. Saving
                updates this browser only—it does not publish a real business.
              </p>
              <ul className="studio-review-list">
                <li>Business name: {brand.name || "Add a name"}</li>
                <li>Template: {draft.layout}</li>
                <li>
                  {draft.modules.filter((m) => m.enabled).length} approved
                  modules enabled
                </li>
                <li>Payments and external destinations remain simulations</li>
              </ul>
              <button className="button primary" onClick={save}>
                Save demo design
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  try {
                    const v = JSON.parse(
                      localStorage.getItem("kawing-studio-draft"),
                    );
                    if (v) {
                      setDraft(v.draft);
                      setBrand(v.brand);
                      setMessage("Retained draft restored.");
                    }
                  } catch {
                    setMessage("No retained draft available.");
                  }
                }}
              >
                Restore retained draft
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setDraft(structuredClone(data.storefront));
                  setBrand({ ...data.brand });
                  setMessage("Draft reverted to the saved design.");
                }}
              >
                Revert unsaved changes
              </button>
            </>
          )}
          {tab === "Brand" && (
            <>
              <h2>Start with a feeling.</h2>
              <p>
                Choose a designed palette, then make it your own. Preview
                changes are drafts until saved.
              </p>
              <div className="studio-presets">
                {[
                  ["Garden", "#245642", "#e7eee2", "#b4743e", "#f7f7f0"],
                  ["Terracotta", "#854a36", "#f0e3d8", "#915c2b", "#faf5ef"],
                  ["Midnight", "#b8d69c", "#304132", "#d6b78a", "#17251f"],
                ].map(([name, primary, secondary, accent, background]) => (
                  <button
                    key={name}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        theme: {
                          ...d.theme,
                          primary,
                          secondary,
                          accent,
                          background,
                          mode: name === "Midnight" ? "dark" : "light",
                        },
                      }))
                    }
                  >
                    <i style={{ background: primary }} />
                    {name}
                  </button>
                ))}
              </div>
              <label>
                Restaurant name
                <input
                  maxLength={28}
                  value={brand.name}
                  onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                />
              </label>
              <label>
                Your welcome message
                <input
                  maxLength={90}
                  value={brand.tagline}
                  onChange={(e) =>
                    setBrand({ ...brand, tagline: e.target.value })
                  }
                />
              </label>
              <div className="studio-colors">
                {["primary", "secondary", "accent", "background"].map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      type="color"
                      aria-label={k + " color"}
                      value={draft.theme[k]}
                      onChange={(e) => theme(k, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <p className="studio-help">
                Button text automatically switches to a readable light or dark
                color. Background text also adapts.
              </p>
              <div className="swatches">
                {["#245642", "#8b4f36", "#435d88", "#805270"].map((c) => (
                  <button
                    key={c}
                    aria-label={"Use brand color " + c}
                    style={{ background: c }}
                    onClick={() => theme("primary", c)}
                  >
                    {draft.theme.primary === c && <Check size={18} />}
                  </button>
                ))}
              </div>
              {select("Appearance", draft.theme.mode, ["light", "dark"], (v) =>
                theme("mode", v),
              )}
              {select(
                "Typography preset",
                draft.theme.typography,
                ["editorial", "modern", "friendly"],
                (v) => theme("typography", v),
              )}
              <label>
                Logo from demo library
                <div className="studio-images">
                  {["bowl", "salad", "plate"].map((n) => (
                    <button
                      aria-label={"Use " + n + " logo"}
                      aria-pressed={draft.logo === `/images/${n}.jpg`}
                      key={n}
                      onClick={() => change("logo", `/images/${n}.jpg`)}
                    >
                      <img src={`/images/${n}.jpg`} alt={n} />
                    </button>
                  ))}
                </div>
              </label>
              <label>
                Cover image
                <div className="studio-images">
                  {["bowl", "salad", "plate", "drink"].map((n) => (
                    <button
                      aria-label={"Use " + n + " cover"}
                      aria-pressed={draft.cover === `/images/${n}.jpg`}
                      key={n}
                      onClick={() => change("cover", `/images/${n}.jpg`)}
                    >
                      <img src={`/images/${n}.jpg`} alt={n} />
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}
          {tab === "Layout" && (
            <>
              <h2>Three ways to welcome.</h2>
              <div className="studio-layouts">
                {[
                  [
                    "quick",
                    "Quick Actions",
                    "A compact identity, clear ordering, and useful service rows.",
                  ],
                  [
                    "visual",
                    "Visual Storefront",
                    "Image-led hero, featured food, and a richer discovery grid.",
                  ],
                  [
                    "minimal",
                    "Minimal Utility",
                    "A concise identity and practical shortcuts. Less imagery, less scrolling.",
                  ],
                ].map(([id, title, desc]) => (
                  <button
                    key={id}
                    aria-pressed={draft.layout === id}
                    onClick={() => change("layout", id)}
                  >
                    <Layers size={20} />
                    <strong>{title}</strong>
                    <small>{desc}</small>
                    {draft.layout === id && <Check size={17} />}
                  </button>
                ))}
              </div>
              {select(
                "Hero composition",
                draft.theme.hero,
                ["cover", "split"],
                (v) => theme("hero", v),
              )}
              {select(
                "Button style",
                draft.theme.button,
                ["soft", "pill", "square"],
                (v) => theme("button", v),
              )}
              {select(
                "Card style",
                draft.theme.cards,
                ["outlined", "elevated"],
                (v) => theme("cards", v),
              )}
              {select(
                "Section spacing",
                draft.theme.spacing,
                ["compact", "comfortable"],
                (v) => theme("spacing", v),
              )}
              {select(
                "Corner style",
                draft.theme.radius,
                ["rounded", "crisp"],
                (v) => theme("radius", v),
              )}
              {select("Menu display", draft.theme.menu, ["grid", "list"], (v) =>
                theme("menu", v),
              )}
              {select(
                "Module presentation",
                draft.theme.modules,
                ["rows", "cards"],
                (v) => theme("modules", v),
              )}
              <button
                className="button secondary"
                onClick={() => {
                  setDraft(defaults());
                  setMessage(
                    "Default template loaded into draft. Save to apply; orders are untouched.",
                  );
                }}
              >
                <RotateCcw size={15} /> Reset draft to template
              </button>
            </>
          )}
          {tab === "Modules" && (
            <>
              <h2>Everything has its place.</h2>
              <p>
                Show, hide, and move approved modules. Ordering always stays
                available. Hidden modules return when enabled again.
              </p>
              {select(
                "Featured module",
                draft.featured,
                draft.modules
                  .filter((m) => m.enabled)
                  .map((m) => [m.type, m.title]),
                (v) => change("featured", v),
              )}
              {selectedEdit && (
                <button
                  className="button secondary"
                  onClick={() => setSelectedEdit(null)}
                >
                  Show all modules
                </button>
              )}
              <div className="studio-module-list">
                {draft.modules
                  .map((m, i) => ({ ...m, position: i }))
                  .filter((m) => !selectedEdit || m.type === selectedEdit)
                  .map((m) => (
                    <article key={m.id}>
                      <div className="studio-module-title">
                        <strong>{labels[m.type]}</strong>
                        <label className="sf-check">
                          <input
                            type="checkbox"
                            aria-label={"Enable " + labels[m.type]}
                            disabled={m.type === "order"}
                            checked={m.enabled}
                            onChange={(e) =>
                              moduleChange(m.type, "enabled", e.target.checked)
                            }
                          />
                          {m.type === "order" ? "Always available" : "Visible"}
                        </label>
                      </div>
                      <label>
                        Module title
                        <input
                          aria-label={m.type + " module title"}
                          value={m.title}
                          maxLength={50}
                          onChange={(e) =>
                            moduleChange(m.type, "title", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Description
                        <input
                          aria-label={m.type + " module description"}
                          value={m.description}
                          maxLength={100}
                          onChange={(e) =>
                            moduleChange(m.type, "description", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Optional CTA label
                        <input
                          aria-label={m.type + " module CTA"}
                          value={m.cta}
                          maxLength={45}
                          onChange={(e) =>
                            moduleChange(m.type, "cta", e.target.value)
                          }
                        />
                      </label>
                      <div className="reorder">
                        <button
                          aria-label={"Move " + labels[m.type] + " up"}
                          disabled={m.position === 0}
                          onClick={() => move(m.type, -1)}
                        >
                          <ArrowUp size={15} /> Up
                        </button>
                        <button
                          aria-label={"Move " + labels[m.type] + " down"}
                          disabled={m.position === draft.modules.length - 1}
                          onClick={() => move(m.type, 1)}
                        >
                          <ArrowDown size={15} /> Down
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </>
          )}
          {tab === "Content" && (
            <>
              <h2>Useful, personal, honest.</h2>
              <details open>
                <summary>Google review</summary>
                {select(
                  "Google review CTA",
                  draft.reviewLabel,
                  ["Review us on Google", "Share your experience on Google"],
                  (v) => change("reviewLabel", v),
                )}
                <label>
                  Google review HTTPS URL
                  <input
                    value={draft.reviewUrl}
                    onChange={(e) => change("reviewUrl", e.target.value)}
                    placeholder="Blank = explicit demo destination"
                  />
                </label>
                <p className="studio-help">
                  Neutral access for every guest. No review incentives,
                  satisfaction filters, or claims of submitted reviews.
                </p>
              </details>
              <details>
                <summary>Social links</summary>
                {select(
                  "Social display style",
                  draft.socialStyle,
                  ["cards", "icons"],
                  (v) => change("socialStyle", v),
                )}
                {draft.socials.map((l, i) => (
                  <div className="studio-link" key={i}>
                    {select(
                      "Platform " + (i + 1),
                      l.platform,
                      [
                        "Instagram",
                        "Facebook",
                        "TikTok",
                        "YouTube",
                        "Website",
                        "Messenger",
                        "WhatsApp",
                        "Google Maps",
                      ],
                      (v) =>
                        change(
                          "socials",
                          draft.socials.map((s, j) =>
                            j === i ? { ...s, platform: v } : s,
                          ),
                        ),
                    )}
                    <label>
                      Link label
                      <input
                        value={l.label}
                        onChange={(e) =>
                          change(
                            "socials",
                            draft.socials.map((s, j) =>
                              j === i ? { ...s, label: e.target.value } : s,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      {l.platform + " URL"}
                      <input
                        aria-label={l.platform + " URL " + (i + 1)}
                        value={l.url}
                        onChange={(e) =>
                          change(
                            "socials",
                            draft.socials.map((s, j) =>
                              j === i ? { ...s, url: e.target.value } : s,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="sf-check">
                      <input
                        type="checkbox"
                        checked={l.enabled}
                        onChange={(e) =>
                          change(
                            "socials",
                            draft.socials.map((s, j) =>
                              j === i ? { ...s, enabled: e.target.checked } : s,
                            ),
                          )
                        }
                      />{" "}
                      Enabled
                    </label>
                    <div className="reorder">
                      <button
                        aria-label={"Move social link " + (i + 1) + " up"}
                        disabled={i === 0}
                        onClick={() => {
                          const a = [...draft.socials];
                          [a[i], a[i - 1]] = [a[i - 1], a[i]];
                          change("socials", a);
                        }}
                      >
                        <ArrowUp size={14} />
                        Up
                      </button>
                      <button
                        onClick={() =>
                          change(
                            "socials",
                            draft.socials.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="button secondary"
                  disabled={draft.socials.length >= 8}
                  onClick={() =>
                    change("socials", [
                      ...draft.socials,
                      {
                        id: uidForLink(),
                        platform: "Website",
                        label: "Visit our website",
                        url: "",
                        enabled: true,
                      },
                    ])
                  }
                >
                  <Plus size={15} />
                  Add social link
                </button>
              </details>
              <details>
                <summary>Merchant-owned promotion</summary>
                <label className="sf-check">
                  <input
                    type="checkbox"
                    checked={draft.promotion.active}
                    onChange={(e) =>
                      nested("promotion", "active", e.target.checked)
                    }
                  />
                  Active
                </label>
                {select(
                  "Promotion format",
                  draft.promotion.kind,
                  [
                    "Featured product",
                    "Limited-time offer",
                    "Seasonal promotion",
                    "Promotional banner",
                    "Discount code",
                    "New item",
                    "Bundle offer",
                    "Upcoming event",
                  ],
                  (v) => nested("promotion", "kind", v),
                )}
                {["title", "description", "cta", "code", "price"].map((k) => (
                  <label key={k}>
                    {"Promotion " + k}
                    <input
                      maxLength={k === "description" ? 250 : 100}
                      value={draft.promotion[k]}
                      onChange={(e) => nested("promotion", k, e.target.value)}
                    />
                  </label>
                ))}
                {select(
                  "Promotion image",
                  draft.promotion.image,
                  [
                    "/images/bowl.jpg",
                    "/images/drink.jpg",
                    "/images/plate.jpg",
                  ],
                  (v) => nested("promotion", "image", v),
                )}
                {select(
                  "Promotion placement",
                  draft.promotion.placement,
                  ["hub", "after-order"],
                  (v) => nested("promotion", "placement", v),
                )}
                <label>
                  Promotion start
                  <input
                    type="date"
                    value={draft.promotion.start}
                    onChange={(e) =>
                      nested("promotion", "start", e.target.value)
                    }
                  />
                </label>
                <label>
                  Promotion end
                  <input
                    type="date"
                    value={draft.promotion.end}
                    onChange={(e) => nested("promotion", "end", e.target.value)}
                  />
                </label>
                <p className="studio-help">
                  Date visibility is checked against today in UTC. Campaign
                  conditions are illustrative; no automatic pricing changes.
                  Future sponsored placements are a concept only.
                </p>
              </details>
              <details>
                <summary>Guest Wi-Fi</summary>
                <label>
                  Demo network name
                  <input
                    maxLength={50}
                    value={draft.wifi.name}
                    onChange={(e) => nested("wifi", "name", e.target.value)}
                  />
                </label>
                <label>
                  Guest instructions
                  <textarea
                    maxLength={300}
                    value={draft.wifi.instructions}
                    onChange={(e) =>
                      nested("wifi", "instructions", e.target.value)
                    }
                  />
                </label>
                <p className="studio-help">
                  Password is fixed fictional demonstration data. Do not enter
                  real network credentials.
                </p>
              </details>
            </>
          )}
          {tab === "Loyalty" && (
            <>
              <h2>A reason to come back.</h2>
              <label className="sf-check">
                <input
                  type="checkbox"
                  checked={draft.loyalty.enabled}
                  onChange={(e) =>
                    nested("loyalty", "enabled", e.target.checked)
                  }
                />
                Enable loyalty program
              </label>
              <label>
                Stamps required
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={draft.loyalty.threshold}
                  onChange={(e) =>
                    nested("loyalty", "threshold", Number(e.target.value))
                  }
                />
              </label>
              <label>
                Reward description
                <input
                  maxLength={90}
                  value={draft.loyalty.reward}
                  onChange={(e) => nested("loyalty", "reward", e.target.value)}
                />
              </label>
              {select(
                "Loyalty card design",
                draft.loyalty.card,
                ["sage", "ink"],
                (v) => nested("loyalty", "card", v),
              )}
              <h3>Eligible products</h3>
              {data.menu.map((m) => (
                <label className="sf-check" key={m.id}>
                  <input
                    type="checkbox"
                    checked={draft.loyalty.eligible.includes(m.id)}
                    onChange={(e) =>
                      nested(
                        "loyalty",
                        "eligible",
                        e.target.checked
                          ? [...draft.loyalty.eligible, m.id]
                          : draft.loyalty.eligible.filter((id) => id !== m.id),
                      )
                    }
                  />
                  {m.name}
                </label>
              ))}
              <p className="studio-help">
                Limit: one stamp per eligible, completed, cashier-confirmed
                order. Each redemption consumes the configured stamp threshold.
                Refunds reverse earned stamps once. Changes apply to future
                purchases.
              </p>
            </>
          )}
          {tab === "Operations" && (
            <>
              <h2>Entry & payment controls.</h2>
              <p>
                These are operational demo settings, separate from presentation
                drafts. Changes apply immediately to future orders.
              </p>
              {select(
                "Preparation policy",
                data.operations.policy,
                [
                  ["prepaid", "Cashier confirms before preparation"],
                  ["counter", "Allow staff-approved cash at counter"],
                ],
                (v) => update((d) => ({ ...d, operations: { policy: v } })),
              )}
              <h3>Guest entry examples</h3>
              <div className="studio-guest-links">
                <a href="?surface=guest&entry=shared#Customer">
                  Shared merchant link
                </a>
                <a href="?surface=guest&entry=counter#Customer">
                  Counter ordering link
                </a>
                <a href="?surface=guest&entry=takeaway#Customer">
                  Takeaway link
                </a>
                <a href="?surface=guest&entry=nfc&table=08#Customer">
                  NFC example · Table 08
                </a>
              </div>
              <h3>Example table links</h3>
              {Object.entries(data.storefront.tables).map(([id, enabled]) => (
                <div className="studio-table" key={id}>
                  <label className="sf-check">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        update((d) => ({
                          ...d,
                          storefront: {
                            ...d.storefront,
                            tables: {
                              ...d.storefront.tables,
                              [id]: e.target.checked,
                            },
                          },
                        }));
                        setDraft((s) => ({
                          ...s,
                          tables: { ...s.tables, [id]: e.target.checked },
                        }));
                      }}
                    />{" "}
                    Table {id} enabled
                  </label>
                  <a href={`?surface=guest&entry=table&table=${id}#Customer`}>
                    Preview table {id} link
                  </a>
                </div>
              ))}
              <p className="studio-help">
                QR/NFC links provide context, not proof of location or identity.
                A copied table URL grants no staff or payment authority. Staff
                access is a role simulation, not production authorization.
              </p>
            </>
          )}
        </section>
        <aside className="studio-preview studio-viewport">
          <div className="studio-preview-toolbar">
            <div>
              <strong>Interactive canvas</strong>
              <small>
                Click a section to edit · No customer events recorded
              </small>
            </div>
            <label>
              Screen size
              <select
                aria-label="Studio screen size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.detail}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DeviceFrame
            device={size}
            src="/?surface=studio-preview"
            title="Interactive Studio preview"
            payload={{ brand, config: config(draft), menu: data.menu }}
            selected={selectedEdit}
            onSelect={selectPreview}
          />
          <div className="canvas-selection">
            <span className="online-dot" />{" "}
            {selectedEdit
              ? "Selected: " + (labels[selectedEdit] || selectedEdit)
              : "Select an element on the canvas"}
            <button onClick={() => selectPreview("layout")}>Edit layout</button>
          </div>
        </aside>
      </div>
      <div className="studio-save-bar">
        <span role="status">
          {message || "Draft preview · Save when it feels right."}
        </span>
        <div>
          <button
            className="button secondary"
            disabled={!data.savedStudio}
            onClick={restore}
          >
            Restore previous save
          </button>
          <button className="button primary" onClick={save}>
            <Save size={15} />
            Save design
          </button>
        </div>
      </div>
    </div>
  );
}
const uidForLink = () => crypto.randomUUID();
