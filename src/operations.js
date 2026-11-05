export const needTypes = [
  ["tent", "Tent & weather cover"],
  ["power", "Power connection"],
  ["water", "Water access"],
  ["cold", "Cold storage"],
  ["internet", "Connectivity"],
  ["waste", "Waste collection"],
  ["access", "Accessible access"],
];
export function vendorOps(p) {
  const defaults =
    p.id === "salo"
      ? {
          tent: true,
          power: true,
          water: false,
          cold: false,
          internet: false,
          waste: true,
          access: false,
        }
      : {
          tent: true,
          power: false,
          water: false,
          cold: false,
          internet: false,
          waste: true,
          access: false,
        };
  return {
    subscription: p.temporary ? "none" : "existing",
    platformTier: p.temporary ? "none" : "growth",
    eventTier: p.temporary ? "basic" : "growth",
    contact:
      p.id === "salo"
        ? "Jamie · demo@example.test"
        : "Local vendor · vendor@example.test",
    arrival: "08:00",
    notes: "",
    requested: defaults,
    fulfilled: {},
    tentStatus: "requested",
    ...p.ops,
    requested: { ...defaults, ...p.ops?.requested },
    fulfilled: { ...p.ops?.fulfilled },
  };
}
export function normalizeMarket(d) {
  return {
    ...d,
    issues: Array.isArray(d.issues) ? d.issues : [],
    profiles: d.profiles.map((p) => ({ ...p, ops: vendorOps(p) })),
  };
}
export function vendorReadiness(d, id) {
  const p = d.profiles.find((p) => p.id === id);
  if (!p) return { ready: false, checks: [], remaining: 1 };
  const op = vendorOps(p),
    booth = d.booths.find((b) => b.merchant === id && !b.blocked),
    checks = [
      {
        label: "Business identity and contact",
        ok: !!p.name?.trim() && !!op.contact?.trim(),
      },
      { label: "Assigned usable booth", ok: !!booth },
      { label: "Active event", ok: d.status === "active" },
      ...needTypes
        .filter(([k]) => op.requested[k])
        .map(([k, label]) => ({
          label,
          ok: !!op.fulfilled[k] && (k !== "tent" || op.tentStatus === "ready"),
        })),
      {
        label: "No unresolved blocking issues",
        ok: !(d.issues || []).some(
          (i) =>
            i.merchantId === id &&
            i.priority === "blocking" &&
            i.status !== "resolved",
        ),
      },
    ];
  return {
    ready: checks.every((c) => c.ok),
    checks,
    remaining: checks.filter((c) => !c.ok).length,
    booth,
  };
}
export function updateVendor(d, id, patch) {
  return {
    ...d,
    profiles: d.profiles.map((p) =>
      p.id === id ? { ...p, ops: { ...vendorOps(p), ...patch } } : p,
    ),
  };
}
export function resolveIssue(d, id, note) {
  if (!note?.trim()) return d;
  return {
    ...d,
    issues: d.issues.map((i) =>
      i.id === id && i.status !== "resolved"
        ? {
            ...i,
            status: "resolved",
            resolution: note.trim(),
            resolvedAt: Date.now(),
          }
        : i,
    ),
  };
}
export function addIssue(d, record) {
  return {
    ...d,
    issues: [
      {
        id: crypto.randomUUID(),
        status: "open",
        createdAt: Date.now(),
        resolution: "",
        ...record,
      },
      ...(d.issues || []),
    ],
  };
}
