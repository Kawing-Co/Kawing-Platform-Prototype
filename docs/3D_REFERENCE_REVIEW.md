# 3D and motion reference review — 2026-11-05

Concept: a miniature café makes one connected visit tangible: table entry → a team
handling the same order → a reason to return. The HTML story and scenario navigation
work before, during and without WebGL. The scene illustrates the proposition; it does
not display live orders or measured business results.

The three repositories supplied by Earl were cloned read-only outside this project
and inspected at these revisions:

| Reference | Revision | Applied lesson |
| --- | --- | --- |
| [latent-spaces/brag](https://github.com/latent-spaces/brag) | `669ab9286aa28b6c3ee30e75f181ee74319d012a` | Product-specific story beats, readable holds and HTML/GSAP composition rendered with Hyperframes/FFmpeg |
| [HardikCoder45/3D-Experiences](https://github.com/HardikCoder45/3D-Experiences) | `32b0362f562d82eaddb44e0dd95542421529853b` | A business-specific spatial metaphor, semantic HTML alongside canvas, explicit scene bounds, capped DPR, on-demand drawing, keyboard/touch controls and fallback |
| [LaeeqtheDev/3d-Interactive-Portfolio](https://github.com/LaeeqtheDev/3d-Interactive-Portfolio) | `e6813e3fcff96806efe0d3720dd65bca7e6f30d0` | Inspectable scenes with story stages; small-screen quality limits; avoid an idle render loop and global keyboard listeners |

`brag` is a video authoring skill, not a 3D engine. Kawing's 12-second in-product film
uses its product-story principles and Hyperframes, rather than claiming a full `/brag`
launch-video run (its default deliverable is 15–25 seconds with share copy/audio).
No reference soundtrack, launch-site layout or bundled asset was copied.

The 3D-Experiences skill and relevant architecture, creative-direction, blueprint and
performance/accessibility guidance were read. Its recommendation to keep the existing
stack and make 3D explain the product informed the small native-WebGL implementation.

The portfolio README explicitly reserves rights to its code, copy and branding. No
portfolio source code, models, shaders, imagery, fonts or personal branding is imported
or redistributed. The 3D-Experiences checkout has no top-level license; its source is
also not copied. Brag has an MIT license; no substantial source is redistributed here.

## Kawing implementation

- `src/SpatialCanvas.jsx`: original procedural geometry. Rounded tabletop and devices,
  coffee and plant; kitchen tickets and receipt printer; loyalty card and illustrative
  bars. Baked directional face lighting; one merged geometry buffer per stage.
- `src/PremiumExperience.jsx`: user-requested lazy scene; Guest/Team/Owner HTML tabs
  and summaries; drag, rotation buttons, detail/full-scene control; focused arrow,
  plus/minus and Home keys. Vertical touch scrolling remains available. No hover-only
  action, scroll capture, global arrow interception or essential canvas-only content.
- Device pixel ratio capped at 1.5. Geometry cached until the story stage changes.
  There is no perpetual frame loop, third-party model download, graphics framework,
  postprocessing stack or hidden texture request. Resize/change triggers one draw.
- WebGL unavailable or context lost: static image and truthful explanation; graphics
  controls disappear, while stage summaries, film and application remain usable.
- Film: original composition in `motion/`, rendered by Hyperframes CLI 0.9.15 and
  optimized by FFmpeg. Playback is optional and never automatic; captions included.

Browser tests verify lazy loading, no repeated idle draws, rotation/zoom/reset keys,
keyboard story-stage selection, GPU-loss fallback and controlled video. Desktop and
mobile screenshots are in `docs/screenshots/premium/`. These checks use Chromium and
software WebGL; physical-device GPU/Safari performance remains unverified.
