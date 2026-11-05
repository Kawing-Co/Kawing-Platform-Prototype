// Kawing Studio "Review & publish" checklist (KAWING-DEMO-UX-002 · UX-02).
// Pure: mirrors the rules Studio enforces on save, plus package media quotas.
import { safeUrl } from "./commerce";

export const GALLERY_QUOTA = { basic: 2, growth: 6, bespoke: 12 };

export function studioChecks(draft, brand, tier = "growth") {
  const quota = GALLERY_QUOTA[tier] ?? GALLERY_QUOTA.growth;
  const gallery = (draft.galleryAssets || []).length;
  const enabled = (draft.modules || []).filter((m) => m.enabled).length;
  return [
    {
      id: "name",
      label: "Business name",
      ok: !!brand.name?.trim(),
      hint: "Add a name in Brand.",
    },
    {
      id: "modules",
      label: `${enabled} customer module${enabled === 1 ? "" : "s"} enabled`,
      ok: enabled > 0,
      hint: "Enable at least one module in Modules.",
    },
    {
      id: "review",
      label: "Review link is HTTPS or left blank",
      ok: !draft.reviewUrl || !!safeUrl(draft.reviewUrl, "Google Review"),
      hint: "Fix the Google review destination in Content.",
    },
    {
      id: "social",
      label: "Social links use HTTPS and the matching platform",
      ok: !(draft.socials || []).some((l) => l.url && !safeUrl(l.url, l.platform)),
      hint: "Fix or clear the social destination in Content.",
    },
    {
      id: "promotion",
      label: "Promotion dates are in order",
      ok: !draft.promotion || !(draft.promotion.start > draft.promotion.end),
      hint: "Set the promotion end after its start in Content.",
    },
    {
      id: "gallery",
      label: `${gallery} of ${quota} gallery slots used`,
      ok: gallery <= quota,
      hint: "Your package allows fewer images. Existing images are kept, but remove some before adding more.",
    },
  ];
}
