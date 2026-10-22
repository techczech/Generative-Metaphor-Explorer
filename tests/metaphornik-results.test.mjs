import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateResults, resultEnvelope } from '../portable/metaphornik-results.mjs';
import { renderResults } from '../portable/render-metaphornik.mjs';
import { renderWithAssets } from '../portable/metaphornik-render-core.mjs';
const example=JSON.parse(readFileSync(new URL('../portable/example-metaphornik-results.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(example);
const record=v=>Object.values(v.analyses)[0];
test('legacy records and versioned exports preserve documents, consequences and mapping indices',()=>{
 const values=validateResults(example);assert.deepEqual(resultEnvelope(values),example);assert.deepEqual(validateResults(values),values);
});
test('malformed records, non-finite timestamps, unsupported versions and dangling mappings rejected',()=>{
 for(const mutate of [v=>record(v).analysis.mappingSets[0].mappings[0].targetFactIndex=99,v=>record(v).timestamp=NaN,v=>v.version=2,v=>record(v).exploredPerspectives[0].mappingSetIndex=-1,v=>record(v).analysis.sourceDomain.facts[0].text=42]){const v=clone();mutate(v);assert.throws(()=>validateResults(v));}
});
test('credentials and unknown properties cannot enter exported result fields',()=>{
 const v=clone();record(v).apiKey='fake-test-credential';assert.throws(()=>resultEnvelope(v));
 const other=clone();record(other).analysis.provider={apiKey:'fake-test-credential'};assert.throws(()=>validateResults(other));
});
test('prototype pollution keys and active image MIME types are rejected',()=>{
 assert.throws(()=>validateResults(JSON.parse('{"__proto__":{}}')));
 const v=clone();record(v).exploredPerspectives[0].generatedImage={base64Data:'AAAA',mimeType:'image/svg+xml',history:[{prompt:'test',timestamp:1}]};assert.throws(()=>validateResults(v));
});
test('image payloads and prompt histories survive round trip',()=>{
 const v=clone();record(v).exploredPerspectives[0].generatedImage={base64Data:'AAAA',mimeType:'image/png',history:[{prompt:'test',timestamp:1}]};assert.deepEqual(resultEnvelope(v),v);
});
test('portable viewer is self-contained and escapes hostile result text',()=>{
 const v=clone();record(v).exploredPerspectives[0].consequences=['</script><script>globalThis.pwned=true</script>'];
 const html=renderResults(v);assert.ok(!html.includes('<script>globalThis.pwned'));assert.ok(html.includes('\\u003c/script>'));assert.ok(!/\b(?:src|href)=["']https?:/.test(html));assert.ok(html.includes('textContent'));assert.ok(!html.includes('innerHTML'));
});
test('Markdown is canonical for generated viewer labels',()=>{
 const read=n=>readFileSync(new URL('../portable/'+n,import.meta.url),'utf8');
 const html=renderWithAssets(example,{markdown:read('copy-metaphornik-viewer.md').replace('Metaphornik\n# subtitle','Changed title\n# subtitle'),css:read('metaphornik-viewer.css'),script:read('metaphornik-viewer.js')});
 assert.ok(html.includes('<title>Changed title</title>'));assert.ok(html.includes('<h1>Changed title</h1>'));
});
