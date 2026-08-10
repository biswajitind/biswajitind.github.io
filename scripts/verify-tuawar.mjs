import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
}

console.log('Tua War page verification passed.');
