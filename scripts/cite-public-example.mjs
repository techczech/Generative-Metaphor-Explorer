// The public example is an authored site page; personal offline exports stay unchanged.
import { readFileSync, writeFileSync } from 'node:fs';
import { citationHead } from '../kit/citation.ts';
const file = new URL('../dist/metaphornik-example.html', import.meta.url);
const page = { title: 'Metaphornik example results', url: 'https://metaphornik.dominiklukes.net/metaphornik-example.html', site: 'Metaphornik', authors: ['Dominik Lukeš'] };
const html = readFileSync(file, 'utf8').replace('</head>', `<link rel="canonical" href="${page.url}"><meta name="description" content="An example of saved conceptual metaphor analyses in Metaphornik.">${citationHead(page)}</head>`);
writeFileSync(file, html);
