import React from "react";

// Display the original SVGs without rewriting their paths or artboards. The crop
// geometry was measured from the SVG path bounds in the browser's own coordinates.
const art = {
  flat: { width: '128.64%', left: '-14.28%', center: '-50.91%' },
  depth: { width: '107.32%', left: '-4.62%', center: '-48.79%' },
  reversed: { width: '134.2%', left: '-17.15%', center: '-51.72%' },
};
function WordmarkArt({ tone }) {
  const crop = art[tone];
  return <img className={'wordmark-art art-' + tone} src={'/branding/kawing-wordmark-' + tone + '.svg'} alt="" draggable="false" style={{width:crop.width, left:crop.left, transform:'translateY(' + crop.center + ')'}} />;
}
export default function CompanyWordmark({ variant = "compact" }) {
  const reset = (e) => {
    e.currentTarget.style.removeProperty('--logo-x');
    e.currentTarget.style.removeProperty('--logo-y');
  };
  return (
    <span className={'company-wordmark company-mark-' + variant} role="img" aria-label="Kawing & Co."
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--logo-x', ((e.clientX-r.left)/r.width-.5)*2 + 'px');
        e.currentTarget.style.setProperty('--logo-y', ((e.clientY-r.top)/r.height-.5)*1.5 + 'px');
      }} onPointerLeave={reset} onPointerCancel={reset}>
      {variant === 'symbol' ? <span className="brand-symbol" aria-hidden="true" /> : variant === 'wordmark' ? <span className="brand-wordmark" aria-hidden="true"><WordmarkArt tone="flat" /><WordmarkArt tone="depth" /></span> : variant === 'stacked' ? <span className="brand-stacked" aria-hidden="true" /> : variant === 'reversed' ?
        <span className="brand-wordmark brand-reversed" aria-hidden="true"><WordmarkArt tone="reversed" /></span> : <>
          <span className="brand-symbol" aria-hidden="true" />
          <span className="brand-wordmark" aria-hidden="true"><WordmarkArt tone="flat" /><WordmarkArt tone="depth" /></span>
        </>}
      <span className="brand-name">Kawing&amp;Co.</span>
    </span>
  );
}
