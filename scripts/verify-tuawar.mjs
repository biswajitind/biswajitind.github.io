import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const markdownPath = resolve(root, 'public/stories/tuawar.md');
const htmlPath = resolve(root, 'public/stories/tuawar.html');
const cssPath = resolve(root, 'public/stories/assets/tuawar/story.css');
const html = readFileSync(htmlPath, 'utf8');
const markdown = readFileSync(markdownPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');

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
const assetDirectory = resolve(root, 'public/stories/assets/tuawar');

const readWebpDimensions = (buffer, asset) => {
  assert(buffer.length >= 30, `${asset} is too small to be a valid WebP`);
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF', `${asset} is missing its RIFF signature`);
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP', `${asset} is missing its WEBP signature`);

  const chunkType = buffer.toString('ascii', 12, 16);
  if (chunkType === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }
  if (chunkType === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunkType === 'VP8L') {
    assert.equal(buffer[20], 0x2f, `${asset} has an invalid VP8L signature`);
    const dimensions = buffer.readUInt32LE(21);
    return {
      width: (dimensions & 0x3fff) + 1,
      height: ((dimensions >>> 14) & 0x3fff) + 1,
    };
  }

  assert.fail(`${asset} has unsupported WebP chunk type ${JSON.stringify(chunkType)}`);
};

const relativeLuminance = (hex) => {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (foreground, background) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

assert(articleMatch, 'missing #story article');
const articleParagraphs = articleMatch[0].match(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g) || [];
assert.equal(
  articleParagraphs.map(stripTags).join(' ').replace(/\s+/g, ' ').trim(),
  markdownProse,
  'HTML prose differs from Markdown',
);
assert.equal((html.match(/class="story-section/g) || []).length, 5);
assert.equal((html.match(/class="story-illustration/g) || []).length, 4);
assert.match(html, /id="reading-progress"/);
assert.match(html, /aria-label="Reading progress"/);
assert.match(html, /assets\/tuawar\/story\.css/);
assert.match(html, /assets\/tuawar\/story\.js/);

for (const token of ['--parchment', '--clay', '--charcoal', '--river', '--olive']) {
  assert(css.includes(token), `missing CSS token ${token}`);
}
assert.match(css, /@media\s*\(max-width:\s*40rem\)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /max-width:\s*72ch/);

const charcoal = css.match(/--charcoal:\s*(#[\da-f]{6})/i)?.[1];
const sectionFour = css.match(/\.story-section:nth-child\(4\)\s*{([\s\S]*?)}/)?.[1];
const sectionFourWash = sectionFour?.match(/--section-wash:\s*linear-gradient\(([\s\S]*?)\);/)?.[1];
assert(charcoal, 'missing hexadecimal --charcoal value');
assert(sectionFourWash, 'missing section-four linear gradient');
const sectionFourStops = [...sectionFourWash.matchAll(/#[\da-f]{6}/gi)].map(([color]) => color);
assert(sectionFourStops.length >= 2, 'section-four gradient needs at least two color stops');
const sectionFourContrasts = sectionFourStops.map((background) => contrastRatio(charcoal, background));
const minimumSectionFourContrast = Math.min(...sectionFourContrasts);
// Preserve headroom for the 2% dark parchment grain layered above the section wash.
assert(
  minimumSectionFourContrast >= 4.75,
  `section-four base contrast ${minimumSectionFourContrast.toFixed(2)}:1 is below the 4.75:1 texture-safe minimum`,
);

for (const asset of ['tua-river.webp', 'luro-returns.webp', 'food-war.webp', 'numo-celebration.webp']) {
  assert.match(html, new RegExp(`assets/tuawar/${asset.replace('.', '\\.')}`));
  const assetPath = resolve(assetDirectory, asset);
  assert(existsSync(assetPath), `missing ${asset}`);
  assert.deepEqual(readWebpDimensions(readFileSync(assetPath), asset), { width: 1600, height: 900 });
}

const dividerPath = resolve(assetDirectory, 'river-divider.svg');
assert(existsSync(dividerPath), 'missing river-divider.svg');
const divider = readFileSync(dividerPath, 'utf8');
const malformedDividerFixture = '<svg stroke-width="320" data-height="44" data-viewBox="0 0 320 44">';
const dividerRootMatch = divider.match(/^<svg\b[^>]*>/);
const requiredDividerRootAttributes = [
  ['width', /(?:^|\s)width="320"(?=\s|\/?>)/],
  ['height', /(?:^|\s)height="44"(?=\s|\/?>)/],
  ['viewBox', /(?:^|\s)viewBox="0 0 320 44"(?=\s|\/?>)/],
];

assert(dividerRootMatch, 'river-divider.svg is missing its root <svg> opening tag');
for (const [attribute, pattern] of requiredDividerRootAttributes) {
  assert.doesNotMatch(
    malformedDividerFixture,
    pattern,
    `malformed fixture must not satisfy the root ${attribute} requirement`,
  );
  assert.match(dividerRootMatch[0], pattern, `river-divider.svg root is missing ${attribute}`);
}

console.log('Tua War page verification passed.');
