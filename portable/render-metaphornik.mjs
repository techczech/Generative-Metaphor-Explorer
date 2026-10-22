#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { renderWithAssets } from './metaphornik-render-core.mjs';
export function renderResults(results) {
  const read = name => readFileSync(new URL(name,import.meta.url),'utf8');
  return renderWithAssets(results,{markdown:read('copy-metaphornik-viewer.md'),css:read('metaphornik-viewer.css'),script:read('metaphornik-viewer.js')});
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if(process.argv.length!==4) throw new Error('Usage: node render-metaphornik.mjs input.json output.html');
    const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
    writeFileSync(process.argv[3],renderResults(input),'utf8');
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
