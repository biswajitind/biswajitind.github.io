import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const markdownPath = resolve(root, 'public/stories/tuawar.md');
const htmlPath = resolve(root, 'public/stories/tuawar.html');
const cssPath = resolve(root, 'public/stories/assets/tuawar/story.css');
const jsPath = resolve(root, 'public/stories/assets/tuawar/story.js');
const html = readFileSync(htmlPath, 'utf8');
const markdown = readFileSync(markdownPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const js = readFileSync(jsPath, 'utf8');

const decode = (value) => value
  .replaceAll('&ldquo;', '“').replaceAll('&rdquo;', '”')
  .replaceAll('&rsquo;', '’').replaceAll('&amp;', '&')
  .replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const stripTags = (value) => decode(value.replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ').trim();
const articleMatch = html.match(/<article id="story"[\s\S]*?<\/article>/);
const assetDirectory = resolve(root, 'public/stories/assets/tuawar');

const parseMarkdownStory = (source) => {
  const sections = [{ heading: null, paragraphs: [] }];
  let currentSection = sections[0];
  let paragraphLines = [];

  const finishParagraph = () => {
    if (paragraphLines.length === 0) return;
    currentSection.paragraphs.push(paragraphLines.join(' ').replace(/\s+/g, ' ').trim());
    paragraphLines = [];
  };

  for (const line of source.replaceAll('\r\n', '\n').split('\n')) {
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      finishParagraph();
      currentSection = { heading: headingMatch[1], paragraphs: [] };
      sections.push(currentSection);
    } else if (!line.trim()) {
      finishParagraph();
    } else if (!line.startsWith('# ') && line !== '*First draft*') {
      paragraphLines.push(line.trim());
    }
  }
  finishParagraph();

  return sections;
};

const parseHtmlStory = (source) => {
  const sourceArticle = source.match(/<article id="story"[\s\S]*?<\/article>/);
  assert(sourceArticle, 'missing #story article');
  const sections = [...sourceArticle[0].matchAll(
    /<section\b[^>]*class="[^"]*\bstory-section\b[^"]*"[^>]*>([\s\S]*?)<\/section>/g,
  )].map(([, section]) => ({
    paragraphs: (section.match(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g) || []).map(stripTags),
  }));

  return {
    headings: [...sourceArticle[0].matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)]
      .map(([, heading]) => stripTags(heading)),
    sections,
  };
};

const assertStoryParity = (markdownSource, htmlSource) => {
  const markdownSections = parseMarkdownStory(markdownSource);
  const htmlStory = parseHtmlStory(htmlSource);
  const markdownHeadings = markdownSections
    .flatMap(({ heading }) => heading === null ? [] : [heading]);

  assert.deepEqual(
    htmlStory.headings,
    markdownHeadings,
    'ordered HTML h2 text differs from ordered Markdown ## headings',
  );
  assert.equal(
    htmlStory.sections.length,
    markdownSections.length,
    'HTML story section count differs from Markdown segment count',
  );
  htmlStory.sections.forEach((section, index) => {
    assert.deepEqual(
      section.paragraphs,
      markdownSections[index].paragraphs,
      `HTML section ${index + 1} paragraphs differ from its Markdown segment`,
    );
  });
};

const collectRevealTargetTags = (source) => [...source.matchAll(/<(([a-z][\w-]*)\b[^>]*)>/gi)]
  .filter(([, openingTag]) => /\bclass="[^"]*\breveal\b[^"]*"/.test(openingTag))
  .map(([, , tagName]) => tagName.toLowerCase());

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
const headingMutation = html.replace(
  '>The Voyager Returns</h2>',
  '>The Voyager Departs</h2>',
);
const proseMutation = html.replace(
  '<p>A river ran through the middle of Tua.</p>',
  '<p>A road ran through the middle of Tua.</p>',
);
assert.notEqual(headingMutation, html, 'heading mutation fixture must alter production HTML');
assert.notEqual(proseMutation, html, 'prose mutation fixture must alter production HTML');
assert.throws(
  () => assertStoryParity(markdown, headingMutation),
  /ordered HTML h2 text differs from ordered Markdown ## headings/,
  'heading mutation must be rejected',
);
assert.throws(
  () => assertStoryParity(markdown, proseMutation),
  /HTML section 2 paragraphs differ from its Markdown segment/,
  'section prose mutation must be rejected',
);
assertStoryParity(markdown, html);

const expectedRevealTargetTags = ['h2', 'figure', 'h2', 'figure', 'h2', 'figure', 'h2', 'figure'];
const productionRevealTargetTags = collectRevealTargetTags(html);
assert.equal(
  productionRevealTargetTags.length,
  expectedRevealTargetTags.length,
  'production HTML must contain exactly eight .reveal targets',
);
assert.deepEqual(
  productionRevealTargetTags,
  expectedRevealTargetTags,
  'production .reveal targets must be the four chapter h2 headings and four story figures',
);
assert.deepEqual(
  collectRevealTargetTags(articleMatch[0]),
  expectedRevealTargetTags,
  'all production .reveal targets must be inside the story article',
);
assert.equal((html.match(/class="story-section/g) || []).length, 5);
assert.equal((html.match(/class="story-illustration/g) || []).length, 4);
assert.match(html, /id="reading-progress"/);
assert.match(html, /aria-label="Reading progress"/);
assert.match(html, /assets\/tuawar\/story\.css/);
assert.match(html, /assets\/tuawar\/story\.js/);
assert.match(js, /documentElement\.classList\.add\(['"]js['"]\)/);
assert.match(js, /requestAnimationFrame/);
assert.match(js, /aria-valuenow/);
assert.match(js, /IntersectionObserver/);
assert.match(js, /prefers-reduced-motion/);

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
