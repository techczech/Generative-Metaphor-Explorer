import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('server HTML shares the About citation record', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /name="DC.type" content="webpage"/);
  assert.match(html, /name="citation_author" content="Lukeš, Dominik"/);
  assert.ok(!html.includes('citation_publication_date'), 'Undated tools do not acquire build dates');
  assert.equal((html.match(/property="og:title"/g) ?? []).length, 1);
  assert.ok(!html.includes('Z3988'));
});
