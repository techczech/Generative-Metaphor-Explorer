const { analyses, copy } = JSON.parse(document.getElementById('metaphornik-data').textContent);
const root = document.querySelector('main');
const el = (tag, text, parent) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; parent?.append(node); return node; };
const toolbar = el('div',undefined,root); toolbar.className='toolbar';
const label = el('label',copy.navigation,toolbar); const select=el('select',undefined,label);
Object.keys(analyses).forEach(k => { const option=el('option',k,select); option.value=k; });
const print=el('button',copy.print,toolbar); print.onclick=()=>window.print();
const download=el('button',copy.download,toolbar); download.onclick=()=>{ const url=URL.createObjectURL(new Blob([JSON.stringify({format:'metaphornik-results',version:1,analyses},null,2)],{type:'application/json'})); const a=el('a');a.href=url;a.download='metaphornik-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); };
const content=el('article',undefined,root);
function render(){
 content.replaceChildren();const data=analyses[select.value];if(!data){el('p',copy.empty,content);return;}
 el('h2',data.metaphor,content);const domains=el('div',undefined,content);domains.className='domains';
 for(const [name,domain] of [[copy.source,data.analysis.sourceDomain],[copy.target,data.analysis.targetDomain]]){const section=el('section',undefined,domains);el('h3',`${name}: ${domain.name}`,section);const ul=el('ol',undefined,section);domain.facts.forEach(f=>el('li',f.text,ul));}
 el('h2',copy.perspectives,content);
 data.analysis.mappingSets.forEach((set,i)=>{const details=el('details',undefined,content);details.open=true;el('summary',set.name,details);el('p',set.description,details);el('h3',copy.mappings,details);const ul=el('ul',undefined,details);set.mappings.forEach(m=>el('li',`${data.analysis.sourceDomain.facts[m.sourceFactIndex].text} → ${data.analysis.targetDomain.facts[m.targetFactIndex].text}`,ul));
 const explored=data.exploredPerspectives.find(p=>p.mappingSetIndex===i);if(!explored)return;
 if(explored.consequences.length){el('h3',copy.consequences,details);explored.consequences.forEach(v=>el('pre',v,details));}
 if(explored.generatedDocuments?.length){el('h3',copy.documents,details);explored.generatedDocuments.forEach(d=>{el('h4',d.type,details);el('pre',d.content,details);});}
 if(explored.generatedImage){el('h3',copy.image,details);const image=el('img',undefined,details);image.alt=set.name;image.src=`data:${explored.generatedImage.mimeType};base64,${explored.generatedImage.base64Data}`;el('h4',copy.history,details);explored.generatedImage.history.forEach(h=>el('pre',h.prompt,details));}
 });
 if(data.comparisons?.length){el('h2',copy.comparisons,content);data.comparisons.forEach(c=>{const s=el('section',undefined,content);el('h3',c.perspectiveIndices.map(i=>data.analysis.mappingSets[i].name).join(' / '),s);el('pre',c.aiSummary,s);el('h4',copy.notes,s);el('pre',c.userNotes,s);});}
}
select.onchange=render;render();
