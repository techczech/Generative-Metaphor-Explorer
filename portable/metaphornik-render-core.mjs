import { resultEnvelope } from './metaphornik-results.mjs';
export function parseCopy(markdown) {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
  return Object.fromEntries([...body.matchAll(/^# (\w+)\r?\n([\s\S]*?)(?=^# |$(?![\s\S]))/gm)].map(m=>[m[1],m[2].trim()]));
}
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderWithAssets(input, { markdown, css, script }) {
  const envelope=resultEnvelope(input); const copy=parseCopy(markdown);
  const payload=JSON.stringify({analyses:envelope.analyses,copy}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escape(copy.title)}</title><style>${css}</style></head><body><header><h1>${escape(copy.title)}</h1><p>${escape(copy.subtitle)}</p></header><main></main><script id="metaphornik-data" type="application/json">${payload}</script><script>${script}</script></body></html>`;
}
