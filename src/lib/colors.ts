/**
 * Brand colors needed in JS/TS contexts (third-party widget configs, canvas/map
 * markers, etc.) where a CSS `var(--token)` isn't usable. Keep these in sync with
 * the matching custom properties in `src/styles/styles.css` — this file exists so
 * a color change is still a one-file edit on the JS side, mirroring the CSS side.
 */

/** Mirrors `--hero-orange` in styles.css */
export const HERO_ORANGE = '#ff9416'
