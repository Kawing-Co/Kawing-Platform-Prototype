// Kawing design system entry. Imported last so its cascade layer wins over legacy sheets.
import "./tokens.css";
import "./base.css";
import "./type.css";
import "./shell.css";
import "./entry.css";
import "./merchant.css";
import "./floor.css";
import { initTactile } from "./tactile.js";
import { initReveal } from "./reveal.js";

const start = () => { initTactile(); initReveal(); };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();

import "./mobile-demo.css";

import "./booth-map.css";

import "./lottie-motion.css";

import "./neutral.css";
