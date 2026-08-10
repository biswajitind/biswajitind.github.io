# Tua War Story Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive, illustrated single-page reading experience for *Tua War* at `public/stories/tuawar.html`.

**Architecture:** Keep the repository dependency-free with one semantic HTML page, one focused stylesheet, one progressively enhanced JavaScript file, and local optimized artwork. A Node script using only built-in modules will verify story fidelity, structure, accessibility hooks, and assets.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, local WebP artwork, local SVG decoration, Node.js built-ins for verification.

## Global Constraints

- Leave `index.html` and `public/stories/tuawar.md` unchanged.
- Publish at `public/stories/tuawar.html`; keep supporting files under `public/stories/assets/tuawar/`.
- Preserve the complete story wording and section order.
- Use a culturally neutral, ancient and timeless visual language.
- Add no runtime dependencies, frameworks, audio, carousel, modal, games, narration, localization, sharing tools, or CMS.
- Keep all essential content usable without JavaScript.
- Support widths from 320px upward without horizontal scrolling.
- Honor `prefers-reduced-motion` and provide readable fallbacks for missing images, fonts, JavaScript, and motion APIs.

## File Map

- Create `public/stories/tuawar.html` — semantic page and complete story.
- Create `public/stories/assets/tuawar/story.css` — layout, palette, typography, texture, motion, responsive rules.
- Create `public/stories/assets/tuawar/story.js` — reading progress and optional reveal enhancement.
- Create `public/stories/assets/tuawar/river-divider.svg` — hand-drawn section ornament.
- Create four 1600×900 WebP images: `tua-river.webp`, `luro-returns.webp`, `food-war.webp`, and `numo-celebration.webp`.
- Create `scripts/verify-tuawar.mjs` — dependency-free content and structural checks.

---

### Task 1: Semantic Story Page and Content Verification

**Files:**
- Create: `public/stories/tuawar.html`
- Create: `scripts/verify-tuawar.mjs`
- Read: `public/stories/tuawar.md`

**Interfaces:**
- Consumes: headings and paragraphs in `public/stories/tuawar.md`.
- Produces: `<article id="story">` containing five ordered `.story-section` elements, four `<figure class="story-illustration">` elements, `#reading-progress`, and local CSS/JS references.

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-tuawar.mjs` using only `node:assert/strict`, `node:fs`, and `node:path`:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const markdownPath = resolve(root, 'public/stories/tuawar.md');
const htmlPath = resolve(root, 'public/stories/tuawar.html');
const html = readFileSync(htmlPath, 'utf8');
const markdown = readFileSync(markdownPath, 'utf8');

const decode = (value) => value
  .replaceAll('&ldquo;', '“').replaceAll('&rdquo;', '”')
  .replaceAll('&rsquo;', '’').replaceAll('&amp;', '&')
  .replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const stripTags = (value) => decode(value.replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ').trim();
const markdownProse = markdown.split('\n')
  .filter((line) => line.trim() && !line.startsWith('#') && line !== '*First draft*')
  .join(' ').replace(/\s+/g, ' ').trim();
const articleMatch = html.match(/<article id="story"[\s\S]*?<\/article>/);

assert(articleMatch, 'missing #story article');
assert.equal(stripTags(articleMatch[0]), markdownProse, 'HTML prose differs from Markdown');
assert.equal((html.match(/class="story-section/g) || []).length, 5);
assert.equal((html.match(/class="story-illustration/g) || []).length, 4);
assert.match(html, /id="reading-progress"/);
assert.match(html, /aria-label="Reading progress"/);
assert.match(html, /assets\/tuawar\/story\.css/);
assert.match(html, /assets\/tuawar\/story\.js/);

for (const asset of ['tua-river.webp', 'luro-returns.webp', 'food-war.webp', 'numo-celebration.webp']) {
  assert(existsSync(resolve(root, 'public/stories/assets/tuawar', asset)), `missing ${asset}`);
}
console.log('Tua War page verification passed.');
```

- [ ] **Step 2: Run it and verify failure**

Run: `node scripts/verify-tuawar.mjs`

Expected: FAIL because `public/stories/tuawar.html` does not exist.

- [ ] **Step 3: Create the semantic HTML page**

Create `public/stories/tuawar.html` with this shell:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#3b2d24">
  <meta name="description" content="Tua War — a children's story about the smallest warrior with the largest appetite.">
  <title>Tua War — A Story from Long Ago</title>
  <link rel="stylesheet" href="assets/tuawar/story.css">
  <script src="assets/tuawar/story.js" defer></script>
</head>
<body>
  <div class="reading-progress" role="progressbar" aria-label="Reading progress"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <span id="reading-progress"></span>
  </div>
  <header class="story-hero">
    <div class="hero-art" role="img" aria-label="The village of Tua beside a winding river at dawn"></div>
    <div class="hero-copy">
      <p class="eyebrow">A story from long ago</p>
      <h1>Tua War</h1>
      <p class="dek">The first and greatest war the people of Tua had ever seen.</p>
      <a class="begin-link" href="#story">Begin the story <span aria-hidden="true">↓</span></a>
    </div>
  </header>
  <main><article id="story" aria-label="Tua War story"></article></main>
  <footer class="story-footer"><p>The story continues in memory.</p></footer>
</body>
</html>
```

Insert every source paragraph verbatim. Group the unheaded opening and each of the four Markdown-headed chapters into five `.story-section` sections. Use semantic `h2` elements and plain paragraphs. Add four figures at narrative boundaries with explicit `width="1600"`, `height="900"`, concise alt text, and lazy loading. The hero uses `tua-river.webp`; figures use the other three images plus a differently cropped repeat of `tua-river.webp`.

- [ ] **Step 4: Add temporary image fixtures and pass the verifier**

Use four tiny valid WebP fixtures at the required paths only long enough to run:

Run: `node scripts/verify-tuawar.mjs`

Expected: `Tua War page verification passed.`

Remove fixtures before committing.

- [ ] **Step 5: Commit**

```bash
git add public/stories/tuawar.html scripts/verify-tuawar.mjs
git commit -m "feat: add semantic Tua War story page"
```

### Task 2: Original Artwork and Decorative Motif

**Files:**
- Create: `public/stories/assets/tuawar/tua-river.webp`
- Create: `public/stories/assets/tuawar/luro-returns.webp`
- Create: `public/stories/assets/tuawar/food-war.webp`
- Create: `public/stories/assets/tuawar/numo-celebration.webp`
- Create: `public/stories/assets/tuawar/river-divider.svg`

**Interfaces:**
- Consumes: filenames and 1600:900 ratio from Task 1.
- Produces: four optimized illustrations and one CSS-ready decorative SVG.

- [ ] **Step 1: Load the image-generation skill and generate a coherent set**

Use this shared direction in every prompt:

```text
Children's storybook illustration, timeless culturally neutral ancient village,
soft charcoal linework with watercolor and natural mineral pigments on aged
parchment, muted ochre clay charcoal faded olive and river blue palette,
warm gentle expressions, wide cinematic landscape composition, atmospheric
but uncluttered, no text, no symbols, no weapons, no identifiable historical
culture, no modern objects, consistent recurring characters and architecture.
```

Scene requirements:

- `tua-river.webp`: dawn panorama, village on both banks, winding central river, rounded clay-and-stone homes, trees and broad quiet sky with title space.
- `luro-returns.webp`: patched traveler beneath a tree, salt-streaked hair, cloth-wrapped seeing tube, delighted children, goat on distant hill.
- `food-war.webp`: joyful villagers tossing fruit, loaves, cakes, and leaf packets across the river; harmless dynamic arcs; Numo near his elder sister.
- `numo-celebration.webp`: Numo calmly eating a pear at sunset, pleasantly exhausted villagers resting, proud sister beside him, communal dancing in the distance.

- [ ] **Step 2: Inspect every image at full size**

Reject and regenerate any image with inconsistent recurring characters, text, weapons, culturally specific architecture/dress, distorted faces/hands, frightening expressions, or photographic rendering.

- [ ] **Step 3: Optimize accepted images**

Convert to 1600×900 WebP at quality 82–86. Keep each below 500 KB where possible without visible banding or damaged linework.

Run: `file public/stories/assets/tuawar/*.webp`

Expected: four WebP images, each 1600×900.

- [ ] **Step 4: Create the divider**

Create a transparent 320×44 SVG with one irregular charcoal river line, two faded-olive leaves, and three ochre dots. Use only `#514238`, `#747054`, and `#b56f42`; keep it below 5 KB.

- [ ] **Step 5: Verify and commit**

Run: `node scripts/verify-tuawar.mjs`

Expected: PASS.

```bash
git add public/stories/assets/tuawar
git commit -m "feat: add original Tua War story artwork"
```

### Task 3: Living Story Scroll Styling

**Files:**
- Create: `public/stories/assets/tuawar/story.css`
- Modify: `scripts/verify-tuawar.mjs`

**Interfaces:**
- Consumes: HTML classes and artwork paths from Tasks 1–2.
- Produces: design tokens, parchment treatment, day-to-dusk progression, image framing, focus states, and responsive/reduced-motion behavior.

- [ ] **Step 1: Add failing CSS checks**

Read `story.css` and add:

```js
for (const token of ['--parchment', '--clay', '--charcoal', '--river', '--olive']) {
  assert(css.includes(token), `missing CSS token ${token}`);
}
assert.match(css, /@media\s*\(max-width:\s*40rem\)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /max-width:\s*72ch/);
```

- [ ] **Step 2: Run and verify failure**

Run: `node scripts/verify-tuawar.mjs`

Expected: FAIL because `story.css` is absent.

- [ ] **Step 3: Implement the visual system**

Begin with:

```css
:root {
  --parchment: #ead9b7;
  --parchment-light: #f4e8cd;
  --clay: #b56f42;
  --ochre: #c9964a;
  --charcoal: #302821;
  --river: #55737a;
  --olive: #747054;
  --dusk: #4a3d43;
  --story-width: 68ch;
}
```

Implement a local-only layered parchment texture; full-height contrast-safe hero; prose at `clamp(1.08rem, 1rem + .35vw, 1.28rem)` and `line-height: 1.78`; maximum measure 72ch; selectable drop cap; feathered image edges; SVG section dividers; morning-to-afternoon-to-sunset-to-dusk backgrounds; pointer-safe decoration; high-contrast `:focus-visible`; mobile stacking and reduced decoration below 40rem; and complete motion removal under `prefers-reduced-motion: reduce`.

Use Georgia/Cambria for prose and Palatino/Book Antiqua for display. Add no network font requests. Content remains visible by default; only `.js .reveal` may start hidden.

- [ ] **Step 4: Verify**

Run: `node scripts/verify-tuawar.mjs`

Expected: PASS.

Run: `rg -n 'https?://|overflow-x|prefers-reduced-motion|focus-visible|max-width' public/stories/assets/tuawar/story.css`

Expected: no external URL and explicit overflow, reduced-motion, focus, and width rules.

- [ ] **Step 5: Commit**

```bash
git add public/stories/assets/tuawar/story.css scripts/verify-tuawar.mjs
git commit -m "feat: style the Tua War living story scroll"
```

### Task 4: Progressive Reading Enhancements

**Files:**
- Create: `public/stories/assets/tuawar/story.js`
- Modify: `scripts/verify-tuawar.mjs`

**Interfaces:**
- Consumes: `#story`, `.reading-progress`, `#reading-progress`, and `.reveal`.
- Produces: `updateProgress(): void`, a 0–100 `aria-valuenow`, and optional reveal behavior.

- [ ] **Step 1: Add failing JavaScript checks**

```js
assert.match(js, /documentElement\.classList\.add\(['"]js['"]\)/);
assert.match(js, /requestAnimationFrame/);
assert.match(js, /aria-valuenow/);
assert.match(js, /IntersectionObserver/);
assert.match(js, /prefers-reduced-motion/);
```

- [ ] **Step 2: Run and verify failure**

Run: `node scripts/verify-tuawar.mjs`

Expected: FAIL because `story.js` is absent.

- [ ] **Step 3: Implement enhancement**

In an IIFE:

1. Add `.js` to `document.documentElement`.
2. Compute progress from the top and bottom of `#story`, clamped to 0–100.
3. Set the span transform and parent progressbar `aria-valuenow`.
4. Throttle scroll/resize work through one `requestAnimationFrame` token.
5. Detect `matchMedia('(prefers-reduced-motion: reduce)')`.
6. When motion is allowed and `IntersectionObserver` exists, observe `.reveal`, add `.is-visible`, then unobserve.
7. Otherwise reveal everything immediately.
8. Calculate initial progress on `DOMContentLoaded`.

Do not block links, selection, scrolling, or story access.

- [ ] **Step 4: Verify**

Run: `node scripts/verify-tuawar.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/stories/assets/tuawar/story.js scripts/verify-tuawar.mjs
git commit -m "feat: add accessible reading enhancements"
```

### Task 5: Browser QA, Accessibility, and Final Polish

**Files:**
- Modify if defects are found: `public/stories/tuawar.html`
- Modify if defects are found: `public/stories/assets/tuawar/story.css`
- Modify if defects are found: `public/stories/assets/tuawar/story.js`
- Modify if defects are found: `scripts/verify-tuawar.mjs`

**Interfaces:**
- Consumes: complete page from Tasks 1–4.
- Produces: visually verified, keyboard-accessible final page with no known console or structural errors.

- [ ] **Step 1: Serve and open the page**

Start a local static server at the repository root and open `/public/stories/tuawar.html`. Confirm no console errors and HTTP 200 for every local asset.

- [ ] **Step 2: Inspect representative screenshots**

Test 390×844, 768×1024, 1440×1000, and 1920×1080. At each size verify no horizontal scroll, clipped text, excessive line length, poor image crop, unclear heading, or obscuring progress bar. Fix and recapture any defect.

- [ ] **Step 3: Test accessibility and fallbacks**

Verify keyboard focus; image alt text; changing progressbar value; reduced-motion behavior; complete content with JavaScript disabled; stable layout and useful alt text when one image is blocked; and no horizontal scroll at 200% zoom on a 1280px viewport.

- [ ] **Step 4: Run final checks**

Run: `node scripts/verify-tuawar.mjs`

Run: `git diff --check`

Run: `git status --short`

Expected: verifier passes, no whitespace errors, and only intentional QA fixes remain.

- [ ] **Step 5: Commit any polish**

If QA changed files:

```bash
git add public/stories/tuawar.html public/stories/assets/tuawar/story.css public/stories/assets/tuawar/story.js scripts/verify-tuawar.mjs
git commit -m "fix: polish Tua War reading experience"
```

Do not create an empty commit.

- [ ] **Step 6: Confirm scope**

Run: `git diff bc2727e0901c59bcca939c7bf3abc0bf6a23d864..HEAD --stat`

Expected: only design/plan documentation, story page, story assets, and verifier are added; `index.html` and `public/stories/tuawar.md` are absent.
