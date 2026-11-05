import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Monitor,
  Smartphone,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import StorefrontHub from "./StorefrontHub";
import { config, moduleTypes } from "./commerce";
import { devices, tiers } from "./experience";
export function DeviceFrame({
  device = "phone",
  src,
  title,
  payload,
  onSelect,
  selected,
}) {
  const box = useRef(null),
    frame = useRef(null),
    [scale, setScale] = useState(1),
    [loaded, setLoaded] = useState(false);
  const d = devices.find((v) => v.id === device) || devices[0];
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (box.current)
        setScale(
          Math.min(
            (box.current.clientWidth - 24) / d.w,
            (box.current.clientHeight - 24) / d.h,
            1,
          ),
        );
    });
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [d]);
  useEffect(() => {
    const receive = (e) => {
      if (
        e.origin !== location.origin ||
        e.source !== frame.current?.contentWindow ||
        e.data?.type !== "kawing:select"
      )
        return;
      if (
        ["brand", "layout", "business", "gallery", ...moduleTypes].includes(
          e.data.id,
        )
      )
        onSelect?.(e.data.id);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onSelect]);
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "kawing:preview-data", payload, selected },
      location.origin,
    );
  useEffect(() => {
    if (loaded && payload) send();
  }, [loaded, payload, selected]);
  return (
    <div ref={box} className="device-canvas" data-device={d.id}>
      <div
        className="device-frame"
        style={{ width: d.w * scale, height: d.h * scale }}
      >
        <iframe
          ref={frame}
          src={src}
          title={title}
          width={d.w}
          height={d.h}
          onLoad={() => {
            setLoaded(true);
            send();
          }}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: d.w,
            height: d.h,
          }}
        />
      </div>
      <span className="canvas-caption">
        {d.name} · {d.detail} · {Math.round(scale * 100)}% fit
      </span>
    </div>
  );
}
export function StudioReceiver() {
  const [value, setValue] = useState(null);
  useEffect(() => {
    const receive = (e) => {
      if (
        e.origin !== location.origin ||
        e.source !== parent ||
        e.data?.type !== "kawing:preview-data"
      )
        return;
      const v = e.data.payload;
      if (!v?.brand || !Array.isArray(v.menu)) return;
      setValue({
        brand: v.brand,
        config: config(v.config),
        menu: v.menu,
        selected: e.data.selected,
      });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!value)
    return <div className="frame-loading">Preparing your design…</div>;
  const data = {
    brand: value.brand,
    storefront: value.config,
    menu: value.menu,
    accounts: [],
    orders: [],
    ledger: [],
    feedback: [],
    events: [],
    guestId: null,
  };
  return (
    <div className="studio-frame-content">
      <StorefrontHub
        data={data}
        update={() => {}}
        context={{ kind: "table", table: "05" }}
        setContext={() => {}}
        preview
        configOverride={value.config}
        brandOverride={value.brand}
        selectedEdit={value.selected}
        onEdit={(id) =>
          parent.postMessage({ type: "kawing:select", id }, location.origin)
        }
      />
    </div>
  );
}
export function CustomerPreview({
  merchantId = "salo",
  boothId,
  merchantName = "Salo",
  onBack,
}) {
  const [device, setDevice] = useState("phone"),
    [tier, setTier] = useState("growth"),
    [started, setStarted] = useState(false);
  const q = new URLSearchParams({
    surface: "guest",
    merchant: merchantId,
    entry: boothId ? "counter" : "shared",
    previewTier: tier,
  });
  if (boothId) q.set("marketBooth", boothId);
  return (
    <main className="customer-lab">
      <header className="customer-lab-heading">
        <div>
          <span className="spaces-eyebrow">
            CUSTOMER EXPERIENCE LAB {boothId ? "· BOOTH " + boothId : ""}
          </span>
          <h1>{started ? merchantName : "Choose your point of view."}</h1>
          <p>
            {started
              ? "Browse, order, and track your visit in the selected screen."
              : "Pick a standard screen, then a package to explore. Preview choices never change the merchant’s saved plan or prices."}
          </p>
        </div>
        {onBack && (
          <button className="space-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to map
          </button>
        )}
      </header>
      <div className="customer-lab-toolbar">
        <label>
          Screen size
          <select
            aria-label="Customer screen size"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {d.detail}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preview tier
          <select
            aria-label="Customer preview tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            {tiers.map((t) => (
              <option value={t} key={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <span>Preview only · Not a subscription change</span>
        {!started ? (
          <button className="space-primary" onClick={() => setStarted(true)}>
            Start customer preview <ArrowRight size={16} />
          </button>
        ) : (
          <button className="space-secondary" onClick={() => setStarted(false)}>
            <SlidersHorizontal size={15} />
            Choose again
          </button>
        )}
      </div>
      {!started ? (
        <section className="customer-device-picker">
          <div className="device-options">
            {devices.map((d) => (
              <button
                key={d.id}
                aria-pressed={device === d.id}
                onClick={() => setDevice(d.id)}
              >
                {d.w < 500 ? <Smartphone size={27} /> : <Monitor size={27} />}
                <strong>{d.name}</strong>
                <small>{d.detail}</small>
                {device === d.id && <Check size={17} />}
              </button>
            ))}
          </div>
          <div className="customer-package-options">
            {tiers.map((t) => (
              <button
                key={t}
                aria-pressed={tier === t}
                onClick={() => setTier(t)}
              >
                <span>
                  {t === "basic" ? "01" : t === "growth" ? "02" : "03"}
                </span>
                <h2>{t[0].toUpperCase() + t.slice(1)}</h2>
                <p>
                  {t === "basic"
                    ? "Focused ordering and essential guest services."
                    : t === "growth"
                      ? "Offers, games, and richer merchant presentation."
                      : "The full reusable experience with the merchant’s saved styling."}
                </p>
              </button>
            ))}
          </div>
          <p className="lab-boundary">
            Orders are shared with the selected business’s local operations.
            Wallet selection and customer claims never confirm payment. All
            money and identity flows are simulated.
          </p>
        </section>
      ) : (
        <DeviceFrame
          key={merchantId + ":" + tier}
          device={device}
          src={"/?" + q.toString() + "#Customer"}
          title={"Customer " + merchantName + " " + tier + " preview"}
        />
      )}
    </main>
  );
}
