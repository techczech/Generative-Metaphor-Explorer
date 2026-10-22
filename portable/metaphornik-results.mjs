// Dependency-free validation shared by the web app and distributable renderer.
const fail = () => { throw new Error('Invalid Metaphornik results: check the format, fields and mapping indices.'); };
const obj = (v, required, optional = []) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail();
  if (required.some(k => !Object.hasOwn(v,k)) || Object.keys(v).some(k => ![...required,...optional].includes(k))) fail();
};
const string = v => { if (typeof v !== 'string' || v.length > 2000000) fail(); };
const number = v => { if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) fail(); };
const list = (v, check) => { if (!Array.isArray(v) || v.length > 10000) fail(); v.forEach(check); };
const index = (v, length) => { if (!Number.isInteger(v) || v < 0 || v >= length) fail(); };
const optionalBool = (v,k) => { if (k in v && typeof v[k] !== 'boolean') fail(); };
export function validateAnalysis(value) {
  obj(value,['sourceDomain','targetDomain','mappingSets']);
  for (const domain of [value.sourceDomain,value.targetDomain]) {
    obj(domain,['name','facts']); string(domain.name);
    const ids = new Set();
    list(domain.facts, f => { obj(f,['id','text'],['custom']); string(f.id); string(f.text); optionalBool(f,'custom'); if (ids.has(f.id)) fail(); ids.add(f.id); });
  }
  list(value.mappingSets, set => {
    obj(set,['name','description','mappings'],['icon','custom']); string(set.name); string(set.description); optionalBool(set,'custom'); if ('icon' in set) string(set.icon);
    list(set.mappings,m => { obj(m,['sourceFactIndex','targetFactIndex']); index(m.sourceFactIndex,value.sourceDomain.facts.length); index(m.targetFactIndex,value.targetDomain.facts.length); });
  });
  if (!value.mappingSets.length) fail();
  return value;
}
export function validateImage(image) {
  obj(image,['base64Data','mimeType','history']);
  if (!['image/png','image/jpeg','image/webp'].includes(image.mimeType) || typeof image.base64Data !== 'string' || image.base64Data.length > 30000000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.base64Data) || image.base64Data.length % 4 !== 0) fail();
  list(image.history,h => { obj(h,['prompt','timestamp']); string(h.prompt); number(h.timestamp); });
  if (!image.history.length) fail();
}
export function validateResults(input) {
  let values = input;
  if (input?.format === 'metaphornik-results') { obj(input,['format','version','analyses']); if (input.version !== 1) fail(); values = input.analyses; }
  if (!values || typeof values !== 'object' || Array.isArray(values) || Object.keys(values).length > 1000) fail();
  for (const [key,value] of Object.entries(values)) {
    if (['__proto__','constructor','prototype'].includes(key)) fail();
    obj(value,['metaphor','analysis','exploredPerspectives','timestamp'],['comparisons']);
    string(value.metaphor); if (key !== value.metaphor) fail(); number(value.timestamp); validateAnalysis(value.analysis);
    const count = value.analysis.mappingSets.length;
    const seen = new Set();
    list(value.exploredPerspectives,p => {
      obj(p,['mappingSetIndex','consequences'],['generatedDocuments','generatedImage']); index(p.mappingSetIndex,count); if (seen.has(p.mappingSetIndex)) fail(); seen.add(p.mappingSetIndex);
      list(p.consequences,string);
      if (Object.hasOwn(p, 'generatedDocuments')) list(p.generatedDocuments,d => { obj(d,['type','content','timestamp']); string(d.type); string(d.content); number(d.timestamp); });
      if (Object.hasOwn(p, 'generatedImage')) validateImage(p.generatedImage);
    });
    if (Object.hasOwn(value, 'comparisons')) list(value.comparisons,c => {
      obj(c,['perspectiveIndices','aiSummary','userNotes','timestamp']); list(c.perspectiveIndices,i => index(i,count)); string(c.aiSummary); string(c.userNotes); number(c.timestamp);
    });
  }
  // Copy allowlisted, validated data; never return a caller-owned object.
  return JSON.parse(JSON.stringify(values));
}
export function resultEnvelope(input) { return { format:'metaphornik-results', version:1, analyses:validateResults(input) }; }
