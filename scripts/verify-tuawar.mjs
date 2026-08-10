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

for (const asset of ['tua-river.webp', 'luro-returns.webp', 'food-war.webp', 'numo-celebration.webp']) {
  assert.match(html, new RegExp(`assets/tuawar/${asset.replace('.', '\\.')}`));
  const assetPath = resolve(assetDirectory, asset);
  assert(existsSync(assetPath), `missing ${asset}`);
  assert.deepEqual(readWebpDimensions(readFileSync(assetPath), asset), { width: 1600, height: 900 });
}

const dividerPath = resolve(assetDirectory, 'river-divider.svg');
assert(existsSync(dividerPath), 'missing river-divider.svg');
const divider = readFileSync(dividerPath, 'utf8');
assert.match(divider, /^<svg\b/, 'river-divider.svg is not an SVG');
assert.match(divider, /\bwidth="320"/);
assert.match(divider, /\bheight="44"/);
assert.match(divider, /\bviewBox="0 0 320 44"/);

console.log('Tua War page verification passed.');
