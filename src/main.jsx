import CompanyWordmark from "./CompanyWordmark";
import { StudioReceiver } from "./Viewport";
import {
  businessKey,
  receiptKey,
  newBusiness,
  projectTier,
  eventOrderError,
} from "./experience";
import Spaces from "./Spaces";
import { announceLocalChange, useCustomize } from "./session";
import AdminSpace from "./AdminSpace";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ChartNoAxesCombined,
  Palette,
  Network,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Bell,
  Wifi,
  WifiOff,
  X,
  Check,
  Play,
  RotateCcw,
  Download,
  Clock3,
  TrendingUp,
  PhilippinePeso,
  ReceiptText,
  Users,
  Leaf,
  ExternalLink,
  CheckCheck,
  Store,
  MonitorSmartphone,
  Menu as MenuIcon,
  Heart,
} from "lucide-react";
import StorefrontHub from "./StorefrontHub";
import Studio from "./Studio";
import Engagement from "./Engagement";
import {
  extend,
  event,
  uid,
  orderAction,
  contextFromUrl,
  paymentLabel,
} from "./commerce";
import "./styles.css";
import "./spaces.css";
import {
  DemoHome,
  GuideRail,
  ViewContext,
  OfflineExperience,
  WalkthroughComplete,
  steps,
} from "./DemoExperience";
import { orderLine } from "./merchant";
import { businessFromSearch, businessOf, isStandard } from "./businesses";
const money = (n) =>
  "₱" +
  n.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
// Each demonstration business seeds its own record; the browser keeps it under businessKey(id).
// The seed marker means a browser holding an older seed starts fresh instead of showing a mix.
const seedOrdersFor = (b) => {
  const lines = b.seedOrderLines(b.menu);
  return [
    { id: "KW-1048", table: "03", payment: "GCash", status: "new", time: "2 min ago" },
    { id: "KW-1047", table: "08", payment: "Cash", status: "preparing", time: "6 min ago" },
    { id: "KW-1046", table: "01", payment: "GCash", status: "ready", time: "12 min ago" },
  ].map((o) => ({ ...o, items: lines[o.id], total: lines[o.id].reduce((n, i) => n + i.price * i.qty, 0), seed: true }));
};
const freshBusiness = (id) => {
  const b = businessOf(id);
  return extend(
    {
      seed: b.seed,
      brand: { ...b.brand },
      menu: b.menu,
      orders: seedOrdersFor(b),
      offline: false,
      ...(b.storefront ? { storefront: b.storefront } : {}),
    },
    id,
  );
};
function loadBusiness(id) {
  const b = businessOf(id);
  try {
    const v = JSON.parse(localStorage.getItem(businessKey(id)));
    if (v?.seed === b.seed && v.brand && Array.isArray(v.menu) && Array.isArray(v.orders))
      return extend({...v, menu: v.menu.map(item => {
        const current = b.menu.find(next => next.id === item.id);
        // Refresh only retired placeholder imagery; preserve owner edits and transaction state.
        return id === 'blackball' && (item.image?.startsWith('/images/blackball/category-') || (current?.photoRevision === 2 && !item.photoRevision && /^\/images\/blackball\/(breakfast|sandwiches|rice-bowls|salads|pizza|pasta|fries|matcha-tray|reference\/(steak|tea))\.(png|jpg)$/.test(item.image))) && current?.illustrative
          ? {...item, image:current.image, images:current.images, photoExt:current.photoExt, illustrative:true, photoCrop:current.photoCrop, photoRevision:current.photoRevision}
          : item;
      })}, id);
  } catch {}
  return freshBusiness(id);
}
const nav = [
  ["Start here", CircleHelp],
  ["Overview", LayoutDashboard],
  ["Orders", ReceiptText],
  ["Menu", UtensilsCrossed],
  ["Analytics", ChartNoAxesCombined],
  ["Customization", Palette],
  ["Ecosystem", Network],
  ["Payments & offline", WifiOff],
  ["Engagement", Heart],
];
const pages = [
  "Start here",
  "Customer",
  "Overview",
  "Orders",
  "Menu",
  "Analytics",
  "Storefront",
  "Payments & offline",
  "Ecosystem",
  "Walkthrough complete",
  "Engagement",
];
function readPage() {
  if (new URLSearchParams(location.search).get("surface") === "guest")
    return "Customer";
  try {
    const p = decodeURIComponent(location.hash.slice(1));
    return p === "Customization"
      ? "Storefront"
      : pages.includes(p)
        ? p
        : "Start here";
  } catch {
    return "Start here";
  }
}
function readGuide() {
  try {
    const g = JSON.parse(localStorage.getItem("kawing-guide-v1"));
    return g &&
      Number.isInteger(g.step) &&
      g.step >= 0 &&
      g.step < 8 &&
      Array.isArray(g.baselineIds)
      ? g
      : null;
  } catch {
    return null;
  }
}
function App({
  space = "merchant",
  merchantId = "salo",
  merchantProfile = null,
  marketContext = null,
  previewTier = null,
}) {
  const [data, setData] = useState(() => {
      if (isStandard(merchantId)) return loadBusiness(merchantId);
      try {
        const v = JSON.parse(localStorage.getItem(businessKey(merchantId)));
        if (v)
          return extend(
            {
              ...v,
              brand: {
                ...v.brand,
                name: merchantProfile.name,
                tagline: merchantProfile.bio || v.brand.tagline,
                category: merchantProfile.category,
              },
            },
            merchantId,
          );
      } catch {}
      return newBusiness(merchantProfile);
    }),
    [page, setPage] = useState(readPage),
    [guide, setGuide] = useState(readGuide),
    [period, setPeriod] = useState("Today"),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState(null),
    [tour, setTour] = useState(0),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState(""),
    [entryContext, writeEntryContext] = useState(() =>
      marketContext ? { kind: "counter", table: null } : contextFromUrl(),
    ),
    [customerVisit, setCustomerVisit] = useState(0),
    [customizeTick, setCustomizeTick] = useState(0);
  // Session header "Customize": Merchant View opens Kawing Studio at Media & tier.
  useCustomize(() => {
    if (space !== "merchant" || !isStandard(merchantId)) return;
    navigate("Customization");
    setCustomizeTick((t) => t + 1);
  });
  useEffect(() => {
    const onHash = () => {
      setPage(readPage());
      writeEntryContext(contextFromUrl());
      setMobile(false);
      setQuery("");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    // "Storefront" is the legacy internal page id; the public name is Kawing Studio.
    document.title = `Kawing · ${page === "Storefront" ? "Kawing Studio" : page}`;
  }, [page]);
  useEffect(() => {
    try {
      if (guide) localStorage.setItem("kawing-guide-v1", JSON.stringify(guide));
      else localStorage.removeItem("kawing-guide-v1");
    } catch {}
  }, [guide]);
  useEffect(() => {
    try {
      localStorage.setItem(businessKey(merchantId), JSON.stringify(data));
      announceLocalChange();
    } catch {
      setToast("Browser storage unavailable. Changes last for this session.");
    }
  }, [data]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key !== businessKey(merchantId) || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        if (
          next.merchantId === merchantId &&
          Array.isArray(next.orders) &&
          Array.isArray(next.menu)
        )
          setData(extend(next, merchantId));
      } catch {}
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [merchantId]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4200);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const handler = (e) => {
      if (e.key === "Escape") {
        setModal(null);
        return;
      }
      if (e.key === "Tab") {
        const els = [
          ...document.querySelectorAll(
            ".modal button,.modal input,.modal select,.modal textarea,.modal a",
          ),
        ].filter((el) => !el.disabled);
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus?.();
    };
  }, [modal]);
  const notify = (t) => setToast(t);
  const active = data.orders.filter(
    (o) =>
      o.status !== "served" && o.status !== "queued" && o.status !== "refunded",
  );
  const added = data.orders.filter((o) => !o.seed && o.status === "served");
  const addedTotal = added.reduce((s, o) => s + o.total, 0);
  function navigate(p) {
    if (p === "Customization") p = "Storefront";
    if (
      window.kawingStudioDirty &&
      p !== "Storefront" &&
      !confirm(
        "Leave the unsaved Studio draft? Your draft is retained for later.",
      )
    )
      return;
    if (!pages.includes(p)) return;
    if (p === "Customer") setCustomerVisit((v) => v + 1);
    setPage(p);
    setMobile(false);
    setQuery("");
    if (readPage() !== p || !location.hash)
      location.hash = encodeURIComponent(p);
    else window.scrollTo(0, 0);
  }
  function startGuide() {
    try {
      localStorage.removeItem(receiptKey(merchantId));
    } catch {}
    setGuide({
      step: 0,
      paused: false,
      baselineIds: data.orders.map((o) => o.id),
      brand: JSON.stringify(data.brand),
      menu: JSON.stringify(data.menu.map((i) => i.available)),
      offlineId: null,
    });
    setPeriod("Today");
    setEntryContext({ kind: "table", table: "05" });
    navigate("Customer");
  }
  function resumeGuide() {
    if (guide) {
      setGuide((g) => ({ ...g, paused: false }));
      navigate(steps[guide.step].page);
    }
  }
  function advanceGuide(skip = false, direction = 1) {
    const next = guide.step + direction;
    if (next >= steps.length) {
      setGuide(null);
      navigate("Walkthrough complete");
      return;
    }
    setGuide((g) => ({ ...g, step: Math.max(0, next) }));
    navigate(steps[Math.max(0, next)].page);
  }
  function prepareOfflineOrder() {
    if (!data.offline) toggleConnection();
    try {
      localStorage.removeItem(receiptKey(merchantId));
    } catch {}
    setEntryContext({ kind: "table", table: "05" });
    navigate("Customer");
  }
  const guideOrder = guide
    ? data.orders.find(
        (o) => !guide.baselineIds.includes(o.id) && o.id !== guide.offlineId,
      )
    : null;
  const guideDone =
    guide &&
    [
      !!guideOrder,
      guideOrder?.status === "served",
      page === "Overview",
      JSON.stringify(data.brand) !== guide.brand,
      JSON.stringify(data.menu.map((i) => i.available)) !== guide.menu,
      period !== "Today",
      !!guide.offlineId &&
        data.orders.some(
          (o) => o.id === guide.offlineId && o.status !== "queued",
        ) &&
        !data.offline,
      page === "Ecosystem",
    ][guide.step];

  function setEntryContext(c) {
    writeEntryContext(c);
    const u = new URL(location.href);
    u.searchParams.set("entry", c.kind);
    if (c.table) u.searchParams.set("table", c.table);
    else u.searchParams.delete("table");
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  }
  function submit(order) {
    const eventError = eventOrderError(marketContext);
    if (eventError) throw new Error(eventError);
    const existing = data.orders.find(
      (o) => o.submissionId === order.submissionId,
    );
    if (existing) return existing;
    if (
      entryContext.table &&
      data.storefront.tables[entryContext.table] === false
    )
      throw new Error(
        "This example table is disabled. Choose another entry context.",
      );
    const items = order.items.map((i) => {
      const menuItem = data.menu.find((m) => m.id === i.id && m.available);
      if (!menuItem) throw new Error("An item is no longer available.");
      // Authoritative: the unit price is recomputed from the menu item and a cleaned selection.
      return orderLine(menuItem, i.sel, Math.max(1, Math.min(20, i.qty)));
    });
    const created = {
      ...order,
      items,
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
      id: "KW-" + uid().slice(0, 8),
      merchantId,
      sourceEvent: marketContext ? { ...marketContext } : null,
      createdAt: Date.now(),
      guestId: data.guestId,
      loyaltyEligible:
        data.storefront.loyalty.enabled &&
        items.some((i) => data.storefront.loyalty.eligible.includes(i.id)),
      policy: data.operations.policy,
      paymentStatus: "selected",
      context: { ...entryContext },
      table: entryContext.table || entryContext.kind,
      status: data.offline ? "queued" : "new",
      time: "Just now",
    };
    setData((d) =>
      d.orders.some((o) => o.submissionId === created.submissionId)
        ? d
        : event(
            { ...d, orders: [created, ...d.orders] },
            "order_submitted",
            created.id,
          ),
    );
    if (data.offline && guide?.step === 6)
      setGuide((g) => ({ ...g, offlineId: created.id }));
    notify(
      data.offline
        ? "Order saved locally. Reconnect to send to the kitchen."
        : "Order received. Payment preference is awaiting cashier verification.",
    );
    return created;
  }
  function act(id, action) {
    setData((d) => orderAction(d, id, action));
    notify(
      action === "claim"
        ? "Payment claim recorded. Only the cashier can confirm it."
        : action === "confirm"
          ? "Cashier confirmed the simulated payment."
          : action === "refund"
            ? "Demo refund recorded; earned loyalty credit reversed once."
            : "Demo order updated.",
    );
  }
  function toggleConnection() {
    setData((d) => ({
      ...d,
      offline: !d.offline,
      orders: d.offline
        ? d.orders.map((o) =>
            o.status === "queued" ? { ...o, status: "new" } : o,
          )
        : d.orders,
    }));
    notify(
      data.offline
        ? "Back online. All queued orders synced once."
        : "Offline simulation on. New orders will be saved locally.",
    );
  }
  function advance(id) {
    act(id, "advance");
  }
  function exportReport() {
    const csv =
      "Order,Table,Total PHP,Payment,Status\n" +
      data.orders
        .map((o) => [o.id, o.table, o.total, o.payment, o.status].join(","))
        .join("\n");
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.href = url;
    a.download = "kawing-demo-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Demo order report downloaded.");
  }
  const multiplier = period === "Today" ? 1 : period === "This week" ? 7 : 28;
  // illustrative: 48 orders a day at the business's own average basket
  const totalBase = (data.brand.avgBasket || 330) * 48 * multiplier;
  const viewData = previewTier
    ? { ...data, storefront: projectTier(data.storefront, previewTier) }
    : data;
  if (space === "admin") return <AdminSpace data={data} update={setData} />;
  // Guest links expose a customer-only presentation; this is not production authentication.
  if (
    space === "customer" ||
    new URLSearchParams(location.search).get("surface") === "guest"
  )
    return (
      <main className="guest-surface">
        <p className="guest-demo-note">
          Kawing customer preview · Fictional restaurant · No real payments
        </p>
        <StorefrontHub
          data={viewData}
          update={setData}
          onSubmit={submit}
          onAction={act}
          context={entryContext}
          setContext={setEntryContext}
        />
      </main>
    );
  return (
    <div className="app" style={{ "--brand": "var(--k-ink)" }}>
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a
          className="logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Start here");
          }}
        >
          <CompanyWordmark />
        </a>
        <div className="workspace">
          <div className="store-avatar">
            <Leaf size={19} />
          </div>
          <div>
            <strong>{data.brand.name}</strong>
            <small>Merchant workspace</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => navigate(name)}
              className={
                page === name ||
                (page === "Storefront" && name === "Customization")
                  ? "active"
                  : ""
              }
            >
              <Icon size={19} />
              {name}
              {name === "Orders" && (
                <span className="nav-count">{active.length}</span>
              )}
              {name === "Ecosystem" && <span className="soon">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="pilot-card">
            <span className="spark">✳</span>
            <strong>
              Small beginnings.
              <br />
              Bigger possibilities.
            </strong>
            <p>
              Your neighborhood,
              <br />a little more connected.
            </p>
            <button onClick={() => navigate("Ecosystem")}>
              Explore the vision <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className="help-link"
            onClick={() => {
              setTour(0);
              setModal("tour");
            }}
          >
            <CircleHelp size={18} /> A little help?
          </button>
          <div className="profile">
            <div className="avatar">JC</div>
            <div>
              <strong>Jamie Cruz</strong>
              <small>Business owner · Demo</small>
            </div>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <MenuIcon size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>
              {page === "Customer"
                ? "Business Profile preview"
                : page === "Storefront"
                  ? "Customization"
                  : page}
            </strong>
          </div>
          <div className="top-actions">
            <span className="prototype-tag">INTERACTIVE PROTOTYPE</span>
            <button
              className={"connection " + (data.offline ? "offline" : "")}
              onClick={toggleConnection}
            >
              {data.offline ? (
                <WifiOff size={14} />
              ) : (
                <span className="online-dot" />
              )}
              {data.offline ? "Offline demo" : "All systems connected"}
            </button>
            <button
              className="icon-button notification"
              aria-label="View notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={19} />
              <i />
            </button>
          </div>
        </header>
        <div className="demo-bar">
          <button
            className="demo-home-link"
            onClick={() => navigate("Start here")}
          >
            <CircleHelp size={15} /> Demo home
          </button>
          <div>
            <span className="demo-badge">DEMO</span>
            <span>One business. Every side of the experience.</span>
          </div>
          <div className="role-tabs">
            <button
              className={
                ["Overview", "Menu", "Analytics", "Storefront"].includes(page)
                  ? "selected"
                  : ""
              }
              onClick={() => navigate("Overview")}
            >
              Owner workspace
            </button>
            <button
              className={page === "Customer" ? "selected" : ""}
              onClick={() => navigate("Customer")}
            >
              Customer hub <ExternalLink size={12} />
            </button>
            <button
              className={page === "Orders" ? "selected" : ""}
              onClick={() => navigate("Orders")}
            >
              Staff kitchen
            </button>
          </div>
          <button
            className="tour-link"
            onClick={() => {
              setTour(0);
              setModal("tour");
            }}
          >
            <Play size={12} /> Take a tour
          </button>
        </div>
        {data.offline && (
          <div className="offline-banner">
            <WifiOff size={16} /> Offline simulation · Orders are saved on this
            browser. {data.orders.filter((o) => o.status === "queued").length}{" "}
            waiting to sync.
            <button onClick={toggleConnection}>Reconnect</button>
          </div>
        )}
        {guide && !guide.paused ? (
          <GuideRail
            guide={guide}
            done={guideDone}
            navigate={navigate}
            advanceGuide={advanceGuide}
            leaveGuide={() => setGuide((g) => ({ ...g, paused: true }))}
            order={guideOrder}
          />
        ) : (
          page !== "Start here" &&
          page !== "Walkthrough complete" && (
            <div className="context-wrap">
              <ViewContext page={page} navigate={navigate} />
              {guide?.paused && (
                <button
                  className="resume-guide button secondary"
                  onClick={resumeGuide}
                >
                  <Play size={13} /> Resume guided demo · Step {guide.step + 1}{" "}
                  of 8
                </button>
              )}
            </div>
          )
        )}
        {page === "Customer" ? (
          <div className="content customer-content">
            <StorefrontHub
              key={customerVisit}
              data={data}
              update={setData}
              onSubmit={submit}
              onAction={act}
              navigate={navigate}
              context={entryContext}
              setContext={setEntryContext}
              startMenu={!!guide && !guide.paused && guide.step === 0}
            />
          </div>
        ) : (
          <main className="content">
            {page === "Start here" && (
              <DemoHome
                merchantName={data.brand.name}
                navigate={navigate}
                startGuide={startGuide}
                guide={guide}
                resumeGuide={resumeGuide}
              />
            )}
            {page === "Walkthrough complete" && (
              <WalkthroughComplete navigate={navigate} restart={startGuide} />
            )}
            {page === "Payments & offline" && (
              <OfflineExperience
                data={data}
                toggleConnection={toggleConnection}
                navigate={navigate}
                prepareOrder={prepareOfflineOrder}
              />
            )}
            {page === "Overview" && (
              <>
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">YOUR BUSINESS, AT A GLANCE</div>
                    <h1>
                      Good things are growing, Jamie{" "}
                      <span className="sun">☀</span>
                    </h1>
                    <p>
                      Here’s what’s happening at {data.brand.name} today.
                    </p>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setPeriod("Today");
                      notify("Showing today’s illustrative demo activity.");
                    }}
                  >
                    <Clock3 size={15} /> Sunday, November 1{" "}
                    <ChevronDown size={13} />
                  </button>
                </div>
                <div className="welcome-banner">
                  <div className="banner-copy">
                    <span className="banner-label">
                      <span /> MADE FOR YOUR EVERYDAY
                    </span>
                    <h2>
                      Less busywork.
                      <br />
                      More of what you love.
                    </h2>
                    <p>
                      From the first order to the last table.
                      <br />
                      Bring your whole business together with Kawing.
                    </p>
                    <button onClick={() => navigate("Customer")}>
                      Explore your customer experience{" "}
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="banner-art">
                    <div className="art-ring" />
                    <img
                      src={(data.brand.bannerPhoto || data.brand.heroPhoto || "/images/matcha/ritual.jpg").replace(/\.jpg$/, "-sm.jpg")}
                      alt={data.brand.name}
                    />
                    <div className="floating-note">
                      <div className="check-circle">
                        <Check size={15} />
                      </div>
                      <div>
                        <strong>A little more connected.</strong>
                        <small>Every order. Every day.</small>
                      </div>
                    </div>
                    <span className="art-star">✳</span>
                  </div>
                  <span className="banner-number">
                    01 / THE CONNECTED KITCHEN
                  </span>
                </div>
                <div className="section-line">
                  <h3>
                    Today, in a nutshell <span>Illustrative demo data</span>
                  </h3>
                  <select
                    aria-label="Reporting period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option>Today</option>
                    <option>This week</option>
                    <option>This month</option>
                  </select>
                </div>
                <div className="stats-grid">
                  {[
                    [
                      PhilippinePeso,
                      "Total sales",
                      money(totalBase + addedTotal),
                      "18.6%",
                      "vs. previous period",
                      "green",
                    ],
                    [
                      ShoppingBag,
                      "Orders",
                      String(48 * multiplier + added.length),
                      "12.4%",
                      "vs. previous period",
                      "blue",
                    ],
                    [
                      ReceiptText,
                      "Average order",
                      money(
                        Math.round(
                          (totalBase + addedTotal) /
                            (48 * multiplier + added.length),
                        ),
                      ),
                      "5.5%",
                      "vs. previous period",
                      "orange",
                    ],
                    [
                      Users,
                      "Tables occupied",
                      "6 / 12",
                      "50%",
                      "A little room for more",
                      "purple",
                    ],
                  ].map(([Icon, label, value, growth, detail, color]) => (
                    <div className="stat-card" key={label}>
                      <div className="stat-top">
                        <span>{label}</span>
                        <span className={"stat-icon " + color}>
                          <Icon size={17} />
                        </span>
                      </div>
                      <strong className="stat-value">{value}</strong>
                      <div className="stat-foot">
                        <span className="growth">
                          <ArrowUpRight size={13} />
                          {growth}
                        </span>
                        <small>{detail}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dashboard-grid">
                  <section className="panel sales-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Sales overview</h3>
                        <p>A good day, one order at a time.</p>
                      </div>
                      <span className="legend">
                        <i /> Sales
                      </span>
                    </div>
                    <div className="sales-summary">
                      <strong>{money(totalBase + addedTotal)}</strong>
                      <span className="growth">
                        <TrendingUp size={14} />
                        18.6%
                      </span>
                      <small>compared to previous period</small>
                    </div>
                    <SalesChart period={period} />
                  </section>
                  <section className="panel live-panel">
                    <div className="panel-heading">
                      <h3>
                        Live orders <span className="live-dot" />
                      </h3>
                      <button
                        className="text-button"
                        onClick={() => navigate("Orders")}
                      >
                        View all <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="live-orders">
                      {active.slice(0, 3).map((o) => (
                        <button
                          className="live-order"
                          key={o.id}
                          onClick={() => setModal(o)}
                        >
                          <div className="table-tile">
                            {["03", "05", "08"].includes(o.table)
                              ? o.table
                              : "↗"}
                            <small>
                              {["03", "05", "08"].includes(o.table)
                                ? "TABLE"
                                : "PICKUP"}
                            </small>
                          </div>
                          <div className="order-copy">
                            <strong>Order #{o.id.split("-")[1]}</strong>
                            <small>
                              {o.items.reduce((s, i) => s + i.qty, 0)} items ·{" "}
                              {o.time}
                            </small>
                            <Status status={o.status} />
                          </div>
                          <strong className="order-total">
                            {money(o.total)}
                          </strong>
                        </button>
                      ))}
                      {!active.length && (
                        <p className="empty">
                          All caught up. Time for a breather.
                        </p>
                      )}
                    </div>
                    <div className="queue-foot">
                      <span className="online-dot" /> Your kitchen is in the
                      loop.
                    </div>
                  </section>
                </div>
                <div className="dashboard-grid bottom-grid">
                  <section className="panel">
                    <div className="panel-heading">
                      <h3>Made popular by your people</h3>
                      <button
                        className="text-button"
                        onClick={() => navigate("Menu")}
                      >
                        View menu <ArrowRight size={14} />
                      </button>
                    </div>
                    {data.menu.slice(0, 3).map((m, i) => (
                      <div className="popular-row" key={m.id}>
                        <span className="rank">0{i + 1}</span>
                        <img src={m.image} alt="" />
                        <div>
                          <strong>{m.name}</strong>
                          <small>{m.category}</small>
                        </div>
                        <div className="popular-sales">
                          <strong>{24 - i * 6} sold</strong>
                          <small>{money((24 - i * 6) * m.price)}</small>
                        </div>
                        <div className="mini-bars">
                          {[15, 25, 17, 35, 28, 42, 32, 48].map((h, j) => (
                            <i key={j} style={{ height: h - i * 3 }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                  <section className="connection-card">
                    <span className="eyebrow">
                      BUILT FOR LOCAL. READY FOR MORE.
                    </span>
                    <Network size={28} />
                    <h3>A neighborhood of possibilities.</h3>
                    <p>
                      Start with a few great kitchens.
                      <br />
                      Grow into a connected local economy.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => navigate("Ecosystem")}
                    >
                      See the Kawing vision <ArrowUpRight size={16} />
                    </button>
                    <div className="avatar-stack">
                      <span>SK</span>
                      <span>BC</span>
                      <span>LR</span>
                      <small>3–5 pilot establishments · Proposed</small>
                    </div>
                  </section>
                </div>
              </>
            )}
            {page === "Orders" && (
              <>
                <PageHeading
                  eyebrow="THE HEART OF THE KITCHEN"
                  title="Every order, in rhythm."
                  text="A shared view for your team. Customer orders appear here instantly."
                />
                <div className="kitchen-top">
                  <span>
                    <span className="online-dot" /> {active.length} active
                    orders
                  </span>
                  <button
                    className="button primary"
                    onClick={() => navigate("Customer")}
                  >
                    <Plus size={16} /> Create a demo order
                  </button>
                </div>
                <div className="kanban">
                  {["new", "preparing", "ready", "served", "queued", "refunded"]
                    .filter(
                      (s) =>
                        s !== "queued" ||
                        data.orders.some((o) => o.status === "queued"),
                    )
                    .map((status) => (
                      <section className="kanban-column" key={status}>
                        <h3>
                          <Status status={status} />
                          <span>
                            {
                              data.orders.filter((o) => o.status === status)
                                .length
                            }
                          </span>
                        </h3>
                        {data.orders
                          .filter((o) => o.status === status)
                          .map((o) => (
                            <article
                              className={
                                "kitchen-card " +
                                (guideOrder?.id === o.id
                                  ? "guide-highlight"
                                  : "")
                              }
                              key={o.id}
                            >
                              <div className="kitchen-card-head">
                                <strong>
                                  {["03", "05", "08"].includes(o.table)
                                    ? "Table " + o.table
                                    : o.table === "shared"
                                      ? "Pickup"
                                      : o.table + " pickup"}
                                </strong>
                                <span>{o.time}</span>
                              </div>
                              <small>
                                #{o.id}
                                {guideOrder?.id === o.id && (
                                  <b className="your-demo-order">
                                    YOUR WALKTHROUGH ORDER
                                  </b>
                                )}
                              </small>
                              <ul>
                                {o.items.map((i, n) => (
                                  <li key={i.id + ":" + n}>
                                    <b>{i.qty}×</b> {i.name}
                                    {i.summary?.length > 0 && (
                                      <small className="kitchen-opts">
                                        {i.summary.join(" · ")}
                                      </small>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              {o.note && (
                                <p className="order-note">Note: {o.note}</p>
                              )}
                              <div className="kitchen-total">
                                <strong>{money(o.total)}</strong>
                                <span>
                                  {o.payment} · {paymentLabel(o)}
                                </span>
                              </div>
                              {o.paymentStatus === "selected" &&
                                o.payment !== "Cash" && (
                                  <p className="payment-wait">
                                    Awaiting customer payment claim. Selection
                                    alone does not verify a payment.
                                  </p>
                                )}
                              {(o.paymentStatus === "claimed" ||
                                (o.payment === "Cash" &&
                                  o.paymentStatus === "selected")) &&
                                status !== "queued" && (
                                  <button
                                    className="button secondary full"
                                    onClick={() => act(o.id, "review")}
                                  >
                                    Review payment
                                  </button>
                                )}
                              {o.paymentStatus === "reviewing" && (
                                <button
                                  className="button primary full"
                                  onClick={() => act(o.id, "confirm")}
                                >
                                  Confirm payment
                                </button>
                              )}
                              {o.payment === "Cash" &&
                                o.policy === "counter" &&
                                !o.counterApproved &&
                                status === "new" && (
                                  <button
                                    className="button secondary full"
                                    onClick={() => act(o.id, "approve-counter")}
                                  >
                                    Approve pay at counter
                                  </button>
                                )}
                              {status === "served" &&
                                o.paymentStatus === "confirmed" &&
                                !o.seed && (
                                  <button
                                    className="button secondary full"
                                    onClick={() => act(o.id, "refund")}
                                  >
                                    Simulate refund
                                  </button>
                                )}
                              {!["served", "queued", "refunded"].includes(
                                status,
                              ) && (
                                <button
                                  className="button primary full"
                                  disabled={
                                    !(
                                      o.paymentStatus === "confirmed" ||
                                      (o.payment === "Cash" &&
                                        o.policy === "counter" &&
                                        o.counterApproved)
                                    )
                                  }
                                  onClick={() => advance(o.id)}
                                >
                                  {
                                    {
                                      new: "Start preparing",
                                      preparing: "Mark ready",
                                      ready: "Mark served",
                                    }[status]
                                  }
                                  <ArrowRight size={15} />
                                </button>
                              )}
                              {status === "queued" && (
                                <small>
                                  Saved locally · awaiting reconnect
                                </small>
                              )}
                            </article>
                          ))}
                        {!data.orders.some((o) => o.status === status) && (
                          <div className="column-empty">
                            A little quiet here.
                          </div>
                        )}
                      </section>
                    ))}
                </div>
              </>
            )}
            {page === "Menu" && (
              <>
                <PageHeading
                  eyebrow="GOOD FOOD STARTS HERE"
                  title="Your menu, made simple."
                  text="Manage what’s cooking. Availability updates your customer menu immediately."
                />
                <div className="menu-toolbar">
                  <label className="search-box">
                    <Search size={17} />
                    <input
                      aria-label="Search merchant menu"
                      placeholder="Find something on your menu…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <button
                    className="button secondary"
                    onClick={() => navigate("Customer")}
                  >
                    Preview customer menu <ExternalLink size={15} />
                  </button>
                </div>
                <div className="merchant-menu">
                  {data.menu
                    .filter((i) =>
                      i.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((i) => (
                      <article className="menu-card" key={i.id}>
                        <img src={i.image} alt={i.name} />
                        <div>
                          <span className="eyebrow">{i.category}</span>
                          <h3>{i.name}</h3>
                          <p>{i.description}</p>
                          {i.options?.length > 0 && (
                            <p className="menu-opts">
                              {i.options.map((o) => o.label).join(" · ")}
                            </p>
                          )}
                          <div className="menu-card-footer">
                            <strong>{money(i.price)}</strong>
                            <button
                              aria-label={"Toggle availability for " + i.name}
                              aria-pressed={i.available}
                              className={
                                "toggle-label " + (!i.available ? "muted" : "")
                              }
                              onClick={() => {
                                setData((d) => ({
                                  ...d,
                                  menu: d.menu.map((m) =>
                                    m.id === i.id
                                      ? { ...m, available: !m.available }
                                      : m,
                                  ),
                                }));
                                notify(
                                  i.available
                                    ? "Item marked sold out."
                                    : "Item available on your menu.",
                                );
                              }}
                            >
                              <span
                                className={
                                  "switch " + (i.available ? "on" : "")
                                }
                              />
                              {i.available ? "Available" : "Sold out"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
                {!data.menu.some((i) =>
                  i.name.toLowerCase().includes(query.toLowerCase()),
                ) && (
                  <p className="empty">No dishes found. Try another search.</p>
                )}
              </>
            )}
            {page === "Analytics" && (
              <>
                <PageHeading
                  eyebrow="MAKE YOUR NEXT MOVE A GOOD ONE"
                  title="A clearer picture of your business."
                  text="Illustrative insights for your proposal. New demo orders are included in sales."
                />
                <div className="analytics-toolbar">
                  <select
                    aria-label="Analytics period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option>Today</option>
                    <option>This week</option>
                    <option>This month</option>
                  </select>
                  <button className="button secondary" onClick={exportReport}>
                    <Download size={16} /> Export demo orders
                  </button>
                </div>
                <div className="stats-grid analytics-stats">
                  {[
                    ["Revenue", money(totalBase + addedTotal)],
                    ["Orders", 48 * multiplier + added.length],
                    [
                      "Average basket",
                      money(
                        Math.round(
                          (totalBase + addedTotal) /
                            (48 * multiplier + added.length),
                        ),
                      ),
                    ],
                    ["Returning guests", "34%"],
                  ].map(([l, v]) => (
                    <div className="stat-card" key={l}>
                      <span>{l}</span>
                      <strong className="stat-value">{v}</strong>
                      <small>Illustrative {period.toLowerCase()} data</small>
                    </div>
                  ))}
                </div>
                <section className="panel">
                  <div className="panel-heading">
                    <h3>Your sales story</h3>
                    <span className="legend">
                      <i /> {period}
                    </span>
                  </div>
                  <SalesChart period={period} />
                </section>
                <div className="insight-grid">
                  <section className="panel insight">
                    <TrendingUp />
                    <h3>Lunch is your sweet spot.</h3>
                    <p>
                      12–2 PM accounts for 42% of illustrative daily sales. Plan
                      prep and staffing around the rush.
                    </p>
                  </section>
                  <section className="panel insight">
                    <Leaf />
                    <h3>Local favorites, lasting connections.</h3>
                    <p>
                      {data.brand.insight ||
                        "Your best sellers are a good starting point for your next seasonal special."}
                    </p>
                  </section>
                </div>
              </>
            )}
            {page === "Storefront" && (
              <Studio
                data={data}
                update={setData}
                navigate={navigate}
                customizeTick={customizeTick}
              />
            )}
            {page === "Engagement" && (
              <Engagement data={data} update={setData} />
            )}
            {page === "Ecosystem" && (
              <>
                <PageHeading
                  eyebrow="KAWING MEANS CONNECTION"
                  title="A local beginning. A shared future."
                  text="A proposed path from a few neighborhood kitchens to an everyday local-commerce platform."
                />
                <div className="vision-hero">
                  <span className="vision-mark">✳</span>
                  <h2>
                    Good business grows
                    <br />
                    when we grow together.
                  </h2>
                  <p>
                    One simple layer connecting customers, teams, and the
                    businesses that make a neighborhood feel like home.
                  </p>
                  <div className="vision-nodes">
                    {[
                      [Users, "Customers"],
                      [Store, "Local businesses"],
                      [UtensilsCrossed, "Restaurant teams"],
                    ].map(([Icon, l]) => (
                      <span key={l}>
                        <Icon size={20} />
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="roadmap">
                  {[
                    [
                      "01",
                      "Start close to home",
                      "3–5 pilot establishments",
                      "Proposed three-month pilot: validate ordering, retention, kitchen workflows, and owner insights with neighborhood operators.",
                      "Pilot proposal",
                    ],
                    [
                      "02",
                      "Find the repeatable rhythm",
                      "A connected neighborhood",
                      "Refine onboarding, shared discovery, loyalty, and merchant support after learning from the pilot.",
                      "Future exploration",
                    ],
                    [
                      "03",
                      "Grow the circle",
                      "A local-commerce ecosystem",
                      "Explore more merchant types and responsible integrations once the core experience proves its value.",
                      "Long-term vision",
                    ],
                  ].map(([n, t, s, p, tag]) => (
                    <article className="panel roadmap-card" key={n}>
                      <span className="roadmap-number">{n}</span>
                      <span className="status">{tag}</span>
                      <h3>{t}</h3>
                      <strong>{s}</strong>
                      <p>{p}</p>
                    </article>
                  ))}
                </div>
                <div className="vision-note">
                  <CircleHelp size={18} />
                  <p>
                    This is a concept, not a growth claim. Pilot size, insights,
                    and business figures are illustrative. Payment integrations
                    and reliable offline infrastructure require separate
                    validation.
                  </p>
                </div>
              </>
            )}
            <footer>
              <span>
                <span className="footer-mark">✳</span> Good business,
                connected.
              </span>
              <span>
                Kawing concept demo · Made for the possibilities ahead{" "}
                <button onClick={() => setModal("reset")}>
                  <RotateCcw size={12} /> Reset demo
                </button>
              </span>
            </footer>
          </main>
        )}
      </div>
      {guide && !guide.paused && guideDone && (
        <button
          className="guide-mobile-next"
          onClick={() => advanceGuide(false)}
        >
          <Check size={16} />
          <span>
            {guide.step === 7
              ? "Finish walkthrough"
              : `Next: ${steps[guide.step + 1].title}`}
          </span>
          <ArrowRight size={16} />
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "tour"
                ? "Guided demo"
                : modal === "reset"
                  ? "Reset demo"
                  : "Details"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
            {modal === "reset" ? (
              <>
                <RotateCcw className="modal-symbol" />
                <h2>A fresh start?</h2>
                <p>
                  This clears demo orders and customizations on this browser and
                  restores the sample restaurant.
                </p>
                <div className="modal-buttons">
                  <button
                    className="button secondary"
                    onClick={() => setModal(null)}
                  >
                    Keep exploring
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      setData(freshBusiness(merchantId));
                      window.kawingStudioDirty = false;
                      setGuide(null);
                      try {
                        localStorage.removeItem(receiptKey(merchantId));
                        localStorage.removeItem("kawing-studio-draft");
                        Object.keys(localStorage)
                          .filter(
                            (k) =>
                              k.startsWith("kawing-cart-v2:" + merchantId + ":") ||
                              (k.startsWith("kawing-cart-") && !k.startsWith("kawing-cart-v2:")),
                          )
                          .forEach((k) => localStorage.removeItem(k));
                      } catch {}
                      setModal(null);
                      navigate("Start here");
                      notify("Demo restored. Ready for a fresh story.");
                    }}
                  >
                    Reset demo
                  </button>
                </div>
              </>
            ) : modal === "tour" ? (
              <>
                <span className="eyebrow">
                  THE KAWING WALKTHROUGH · {tour + 1} / 5
                </span>
                <div className="tour-icon">
                  {["✳", "↗", "◷", "◈", "◎"][tour]}
                </div>
                <h2>
                  {
                    [
                      "Good business, connected.",
                      "A warm welcome, on any phone.",
                      "A kitchen that stays in sync.",
                      "Make it yours. See what works.",
                      "Small beginnings. Shared possibilities.",
                    ][tour]
                  }
                </h2>
                <p>
                  {
                    [
                      "Meet Kawing: a proposed commerce workspace bringing guests, teams, and local business owners together. Everything here is an interactive simulation.",
                      "Explore the customer menu, build a basket, and place a simulated order. No accounts or real payments are needed.",
                      "Open Staff kitchen to move the same order from received to preparing, ready, and served. Toggle offline to try a local queue.",
                      "Change your Business Profile name and colors, manage menu availability, and explore illustrative analytics that include your demo orders.",
                      "Start with 3–5 pilot establishments, learn with operators, and explore a connected neighborhood. The ecosystem page shares the proposed path.",
                    ][tour]
                  }
                </p>
                <div className="tour-dots">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <button
                      aria-label={"Tour step " + (n + 1)}
                      key={n}
                      className={n === tour ? "current" : ""}
                      onClick={() => setTour(n)}
                    />
                  ))}
                </div>
                <div className="modal-buttons">
                  <button
                    className="button secondary"
                    onClick={() => {
                      navigate(
                        [
                          "Overview",
                          "Customer",
                          "Orders",
                          "Storefront",
                          "Ecosystem",
                        ][tour],
                      );
                      setModal(null);
                    }}
                  >
                    Explore this view
                  </button>
                  <button
                    className="button primary"
                    onClick={() =>
                      tour < 4 ? setTour(tour + 1) : setModal(null)
                    }
                  >
                    {tour < 4 ? "Next" : "Let’s explore"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </>
            ) : modal === "notifications" ? (
              <>
                <Bell className="modal-symbol" />
                <h2>Your business, in the loop.</h2>
                <p>
                  {active.length} active orders in your kitchen.{" "}
                  {data.orders.filter((o) => o.status === "queued").length}{" "}
                  orders waiting for connection.
                </p>
                <div className="notification-row">
                  <span className="online-dot" /> Demo workspace ready. No real
                  transactions.
                </div>
                <button
                  className="button primary"
                  onClick={() => {
                    navigate("Orders");
                    setModal(null);
                  }}
                >
                  View kitchen <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <Status status={modal.status} />
                <h2>Order #{modal.id.split("-")[1]}</h2>
                <p>
                  {modal.context?.table
                    ? "Table " + modal.context.table
                    : modal.table}{" "}
                  · {modal.payment} ·{" "}
                  {modal.payment === "Cash"
                    ? "Collect at counter"
                    : "Simulated payment"}
                </p>
                {modal.items.map((i, n) => (
                  <div className="modal-order-row" key={i.id + ":" + n}>
                    <span>
                      {i.qty} × {i.name}
                      {i.summary?.length > 0 && (
                        <small className="kitchen-opts">
                          {i.summary.join(" · ")}
                        </small>
                      )}
                    </span>
                    <strong>{money(i.price * i.qty)}</strong>
                  </div>
                ))}
                <div className="modal-order-row">
                  <strong>Total</strong>
                  <strong>{money(modal.total)}</strong>
                </div>
                <button
                  className="button primary full"
                  onClick={() => {
                    navigate("Orders");
                    setModal(null);
                  }}
                >
                  Open in kitchen <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function PageHeading({ eyebrow, title, text }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Status({ status }) {
  return (
    <span className={"status " + status}>
      <span />
      {{
        new: "New order",
        preparing: "Preparing",
        ready: "Ready to serve",
        served: "Served",
        queued: "Queued offline",
        refunded: "Refunded",
      }[status] || status}
    </span>
  );
}
function SalesChart({ period }) {
  const values =
    period === "Today"
      ? [
          8, 10, 9, 13, 12, 18, 34, 46, 38, 41, 49, 57, 50, 65, 59, 70, 85, 73,
          83, 94, 80, 72, 82, 77,
        ]
      : period === "This week"
        ? [
            22, 28, 18, 42, 35, 52, 41, 62, 58, 48, 64, 83, 72, 78, 88, 65, 72,
            80, 62, 85, 79, 93, 85, 99,
          ]
        : [
            10, 17, 27, 19, 29, 26, 37, 30, 41, 49, 42, 59, 48, 63, 55, 72, 67,
            78, 70, 88, 82, 94, 86, 99,
          ];
  const points = values
    .map((v, i) => `${58 + i * 26},${184 - v * 1.35}`)
    .join(" ");
  return (
    <div
      className="chart"
      aria-label={"Illustrative sales chart for " + period}
      role="img"
    >
      <svg viewBox="0 0 700 235">
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity=".18" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 80, 130, 180].map((y, i) => (
          <g key={y}>
            <text x="0" y={y + 4} className="chart-label">
              {["₱6k", "₱4k", "₱2k", "₱0"][i]}
            </text>
            <line
              x1="52"
              x2="680"
              y1={y}
              y2={y}
              stroke="#e9ece7"
              strokeDasharray="4 5"
            />
          </g>
        ))}
        <polygon points={"58,184 " + points + " 656,184"} fill="url(#fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {(period === "Today"
          ? ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"]
          : period === "This week"
            ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            : [
                "1 Nov",
                "5 Nov",
                "10 Nov",
                "15 Nov",
                "20 Nov",
                "25 Nov",
                "30 Nov",
              ]
        ).map((l, i) => (
          <text
            key={l}
            x={58 + i * 100}
            y="219"
            className="chart-label"
            textAnchor="middle"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
function RoutedWorkspace(props) {
  const q = new URLSearchParams(location.search),
    id = props.merchantId || q.get("merchant") || businessFromSearch(location.search);
  let profile = props.merchantProfile;
  let ctx = props.marketContext;
  try {
    const m = JSON.parse(localStorage.getItem("kawing-market-v1"));
    if (!isStandard(id) && !profile)
      profile = m?.profiles.find((p) => p.id === id);
    if (q.get("marketBooth"))
      ctx = {
        boothId: q.get("marketBooth"),
        merchantId: id,
        eventId: "commons",
      };
  } catch {}
  if (!isStandard(id) && !profile)
    return (
      <main className="market-panel">
        <h1>Business unavailable</h1>
        <p>
          This merchant profile is no longer part of the local demo. Return to
          the market map.
        </p>
      </main>
    );
  return (
    <App
      {...props}
      merchantId={id}
      merchantProfile={profile}
      marketContext={ctx}
      previewTier={q.get("previewTier")}
    />
  );
}
createRoot(document.getElementById("root")).render(
  new URLSearchParams(location.search).get("surface") === "studio-preview" ? (
    <StudioReceiver />
  ) : (
    <Spaces Workspace={RoutedWorkspace} />
  ),
);

import "./interactive.css";

import "./premium.css";

import "./ds/index.js";
