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

Premium experience assets: `public/motion/kawing-story.mp4`, its captions, and
`story-poster.jpg` / `story-scene.jpg` are generated from the original HTML/GSAP
composition in `motion/` and the Matcha Mood photography. Regenerate with
`scripts/render-story.sh`. `motion/gsap.min.js` is GSAP 3.14.2 (copyright and license
URL retained in its header), used only to author the film. The native WebGL scene
is original procedural geometry. BlurHash 2.0.5 is a small MIT-licensed runtime
dependency; hashes are regenerated with `node scripts/create-image-hashes.mjs`.

3D reference provenance and rights boundaries: [3D_REFERENCE_REVIEW.md](3D_REFERENCE_REVIEW.md).
No assets or source from the supplied interactive portfolio are redistributed.
