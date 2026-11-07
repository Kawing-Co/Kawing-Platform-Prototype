# Prototype assets

Images are downloaded stock photography from Unsplash, used as illustrative menu
photography, not representations of an actual Salo restaurant or exact recipes.
Sources (image URLs preserve Unsplash photo identifiers):

- Harvest bowl: https://images.unsplash.com/photo-1512621776951-a57141f2eefd
- Garden salad: https://images.unsplash.com/photo-1547592180-85f173990554
- Green bowl / market plate: https://images.unsplash.com/photo-1546069901-ba9599a7e63c
- Cooler: https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38
- Mango drink: https://images.unsplash.com/photo-1622597467836-f3285f2131b8

Unsplash license: https://unsplash.com/license. Replace with actual food photography
before any public commercial launch.

DM Sans and Manrope fonts are bundled locally from Google Fonts; SIL Open Font
License notices are in public/fonts. Lucide icons are provided by lucide-react
under its ISC license. No runtime external image or font requests are needed.


Matcha Mood photography (`public/images/matcha/*.jpg`, `public/images/market-*.jpg`,
`salo-table.jpg`) is original, AI-generated imagery created for this prototype (no real
products, people or brands); each photograph has a full-size and a `-sm` variant, and BlurHash
placeholders. Selecting menu options shows the closest photographed variant. Display type is
Cormorant Garamond (SIL OFL, `public/fonts`). The peso sign renders in DM Sans/Manrope, not
Cormorant, which has no ₱ glyph.

the usual. photography (`public/images/usual`): `interior.jpg`, `interior-sm.jpg` and `logo.jpg` are
the owner's own photograph, supplied for this prototype; every drink image is original, AI-generated
editorial imagery in a light concrete-grey style (no real products, people or brands). Where two
drinks look alike (biscoff, seasalt hojicha, matcha crunch) they share one photograph. Display and
body type for this merchant is Jost (SIL OFL, `public/fonts/Jost-OFL.txt`).

Premium experience assets: `public/motion/kawing-story.mp4`, its captions, and
`story-poster.jpg` / `story-scene.jpg` are generated from the original HTML/GSAP
composition in `motion/` and the Matcha Mood photography. Regenerate with
`scripts/render-story.sh`. `motion/gsap.min.js` is GSAP 3.14.2 (copyright and license
URL retained in its header), used only to author the film. The native WebGL scene
is original procedural geometry. BlurHash 2.0.5 is a small MIT-licensed runtime
dependency; hashes are regenerated with `node scripts/create-image-hashes.mjs`.

3D reference provenance and rights boundaries: [3D_REFERENCE_REVIEW.md](3D_REFERENCE_REVIEW.md).
No assets or source from the supplied interactive portfolio are redistributed.


Company identity (owner supplied, 2026-11-07): the five SVGs in public/branding/
are preserved byte-for-byte, including their source comments. Stacked mark and
symbol are alpha-masked in CSS for navy/white display. Flat, depth and reversed
wordmarks retain their original artboards; CSS clips the display to measured glyph
bounds. No font substitution, traced replacement, external asset request or generated
logo is used. The symbol is also the favicon. Source filenames were the supplied
stacked-logo, symbol-concept-b, blended-wordmark-depth, Flat-single-color-wordmark
and White-wordmark-on-dark artifacts. SHA-256:

- kawing-stacked.svg: `f2a5cf66023fe9fcb47325234e28d45281f438e55ef4095e02d3cac3ea23582a`
- kawing-symbol.svg: `036c8883ee5b95ae0764eab6570c897228e1ab8be80e331790a67aa8473eee91`
- kawing-wordmark-depth.svg: `ee2f4bc6a919cf5fcdf32ade5fb0d272d5ee780dcfdc86f25ed13ebe8bdaef91`
- kawing-wordmark-flat.svg: `8d3f878a778c93d9d5f1453aa7e8f514de9afd2017f9416f2e768aa852e3393d`
- kawing-wordmark-reversed.svg: `f652d1fb09c6a0140a1d05be27d9e3111afcca1d3637d9a2f045755a356b0cbf`
