# Tua War Story Page Design

## Goal

Create a responsive, single-page reading experience for *Tua War* that feels ancient and timeless without borrowing recognizably from Asian, European, American, or other specific historical traditions. The story must remain the focus, with illustrations and motion used as atmosphere rather than spectacle.

The page will be published at `public/stories/tuawar.html`. The existing portfolio homepage and the Markdown source will remain unchanged.

## Creative Direction

The page will use the **Living Story Scroll** concept: a warm parchment reading surface that subtly changes with the story's passage from morning through afternoon, sunset, celebration, and a quiet modern-day ending.

The visual language will combine:

- aged parchment and earth-toned backgrounds;
- charcoal-ink linework and softly painted story illustrations;
- stone, timber, woven fiber, clay, leaves, fruit, and river motifs;
- a muted palette of parchment cream, ochre, clay, charcoal, faded olive, river blue, and dusk amber;
- culturally neutral rounded homes, simple natural garments, baskets, footpaths, and tools.

The artwork must avoid identifiable monuments, religious symbols, armor, weapons, scripts, architectural styles, and costumes tied to a specific civilization.

## Page Structure

### Opening

A full-width illustrated introduction establishes Tua beside its river. The title, short descriptor, and invitation to begin reading sit over a calm, high-contrast area. The opening should feel like entering a remembered tale rather than a conventional website hero.

### Story Body

The complete story will appear in a centered, narrow reading column. Existing Markdown headings define the major sections:

1. Opening cottage scene
2. The Voyager Returns
3. Preparing for War
4. Numo Joins the War
5. Two Hours Later

Section boundaries use restrained illustrated motifs and gradual color shifts. Paragraph order and wording remain faithful to the source.

### Closing

The ending returns visually to the cottage at dusk. Decoration becomes quieter and more spacious around the final lines, reinforcing the mystery of the family records without adding new narrative text.

## Illustration Plan

Create four original, landscape-oriented illustrations in one consistent storybook style:

1. **Tua and the river:** a peaceful settlement spanning both banks at early morning.
2. **Luro returns:** the patched voyager showing children the seeing tube beneath a tree.
3. **The food war:** fruit, loaves, and leaf-wrapped packets flying joyfully over the river, with no weapons or violence.
4. **Numo and the celebration:** the small boy calmly eating as tired participants rest nearby, with a communal celebration suggested in the distance.

The final cottage scene will be handled primarily through layout, color, and small decorative artwork rather than a fifth large illustration. Images will have gentle edges or masks so they blend into the parchment instead of appearing as rectangular photographs.

Small custom motifs—river lines, leaves, fruit, stars, and hand-drawn separators—may be implemented as lightweight local SVG or CSS decoration. They must remain subordinate to the prose.

## Typography and Readability

- Use an expressive serif for titles and section headings and a highly readable serif for the story body.
- Keep the body column approximately 65–72 characters wide on large screens.
- Use comfortable line height and paragraph spacing suitable for shared parent-child reading.
- Give dialogue natural breathing room without altering the story text.
- Preserve strong contrast on every background state.
- Use responsive type sizing so phones remain comfortable without excessive zooming.

The page should remain readable if remote fonts fail, using carefully selected system serif fallbacks.

## Interaction and Motion

Interaction will be intentionally minimal:

- a subtle reading-progress indicator;
- a gentle prompt to begin reading;
- soft reveal transitions for sections and illustrations;
- very restrained background drift or parallax on larger screens only.

All essential content will be visible without JavaScript. Motion will be disabled or simplified when the user prefers reduced motion. No autoplay audio, carousel, modal, or game mechanics will be added.

## Responsive Behavior

Desktop layouts may place illustrations slightly outside the text column to create an expansive story-scroll feeling. Tablet and phone layouts will stack all content in narrative order, crop artwork carefully, enlarge touch-safe controls, and remove nonessential decorative layers.

The design must work at widths from 320px upward without horizontal scrolling. Text will never overlay a visually busy part of an illustration unless a solid contrast layer guarantees readability.

## Technical Approach

The story page will be a self-contained static HTML document consistent with the repository's dependency-free structure. Supporting files will live under `public/stories/assets/tuawar/`.

The implementation will use:

- semantic HTML for the article and section hierarchy;
- local CSS for layout, palette, textures, and responsive behavior;
- minimal vanilla JavaScript for reading progress and intersection-based reveals;
- local optimized image assets with explicit dimensions and responsive loading behavior;
- accessible landmarks, visible focus states, descriptive alternative text, and keyboard-safe behavior.

The Markdown story remains the editorial source but will not be dynamically fetched at runtime, avoiding local-file restrictions and ensuring reliable static hosting.

## Failure and Fallback Behavior

- If JavaScript is unavailable, the complete story and all navigation remain usable.
- If an illustration fails to load, its reserved space and background treatment prevent layout collapse, and alternative text conveys its purpose.
- If custom fonts fail, system serif fallbacks preserve the intended reading hierarchy.
- If motion APIs are unavailable, content appears immediately.

## Verification

Before delivery, verify:

- the complete story text and section order against `public/stories/tuawar.md`;
- layout at representative phone, tablet, laptop, and wide desktop sizes;
- keyboard navigation and visible focus treatment;
- reduced-motion behavior;
- contrast and legibility over all background states;
- clean loading with JavaScript disabled and with missing image/font fallbacks;
- absence of changes to the existing homepage.

## Scope Boundaries

This iteration does not add site-wide navigation, a story catalog, content management, narration, localization, sharing tools, or edits to the story prose. Those can be considered separately after the reading page is complete.
