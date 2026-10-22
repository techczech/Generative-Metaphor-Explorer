// Optional browser smoke check. Use an installed Playwright module and bundled headless shell.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.METAPHORNIK_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,...(process.env.METAPHORNIK_HEADLESS_SHELL?{executablePath:process.env.METAPHORNIK_HEADLESS_SHELL}:{})});
const base=process.env.METAPHORNIK_TEST_URL || 'http://127.0.0.1:3000';
const example=JSON.parse(readFileSync(new URL('../portable/example-metaphornik-results.json',import.meta.url),'utf8'));
try {
 const context=await browser.newContext({acceptDownloads:true});
 const page=await context.newPage();page.setDefaultTimeout(10000);
 process.on('uncaughtExceptionMonitor', async error => { console.error('Browser failure:',error.message); });
 console.log('Browser: app loaded; checking key setup and result journeys.');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let requests=0;let errorStatus=0;
 // Fail closed: only the local app and explicitly mocked provider routes may load.
 await context.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 await context.route(/https:\/\/(?:api\.openai\.com|generativelanguage\.googleapis\.com)\//,async route=>{
  requests++;const request=route.request();const body=request.headers()['content-type']?.includes('application/json') ? request.postDataJSON() : null;console.log('Mock provider request:',new URL(request.url()).pathname);
  if(errorStatus){await route.fulfill({status:errorStatus,json:{error:{message:'fake-key-must-not-appear'}}});return;}
  if(request.url().includes('/images/')){await route.fulfill({json:{data:[{b64_json:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1cAAAAASUVORK5CYII='}]}});return;}
  if(request.url().includes('/chat/completions')){
   const result=structuredClone(Object.values(example.analyses)[0].analysis);
   result.sourceDomain.facts=result.sourceDomain.facts.map(f=>f.text);result.targetDomain.facts=result.targetDomain.facts.map(f=>f.text);
   await route.fulfill({json:{choices:[{finish_reason:'stop',message:{content:body.response_format?JSON.stringify({result}):'## Insights\nMocked provider consequences.'}}]}});return;
  }
  await route.fulfill({json:{candidates:[{content:{parts:[{text:'## Insights\nMocked Gemini consequences.'}]}}]}});
 });
 await page.goto(base);await page.getByRole('button',{name:/Analyze$/}).click();
 await page.getByText(/Add your OpenAI API key/).waitFor();assert.equal(requests,0);
 await page.locator('summary').filter({hasText:'Provider settings'}).click();
 await page.getByLabel('API key',{exact:true}).fill('fake-key-for-browser-test');await page.getByRole('button',{name:'Apply settings',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Settings applied.'}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('metaphornik-provider-settings-v1')),null);
 await page.getByRole('button',{name:/Analyze$/}).click();
 console.log('Browser: analysing with mocked OpenAI.');
 await page.getByText('Choosing a route',{exact:true}).first().waitFor().catch(async error=>{console.error('Browser body:',await page.locator('body').innerText());console.error('Page errors:',errors);throw error;});
 await page.getByText('Mocked provider consequences.',{exact:true}).waitFor().catch(async error=>{console.error('Browser body:',await page.locator('body').innerText());console.error('Page errors:',errors);throw error;});
 await page.getByRole('button',{name:/Generate Image$/}).click();
 await page.getByRole('button',{name:/Apply Edit$/}).waitFor();
 await page.getByPlaceholder("Describe your edits (e.g., 'make it black and white')").fill('Make it blue');
 await page.getByRole('button',{name:/Apply Edit$/}).click();await page.getByText('Last prompt: "Make it blue"',{exact:true}).waitFor();
 const saved=await page.evaluate(()=>localStorage.getItem('metaphorAnalyses'));assert.ok(!saved.includes('fake-key-for-browser-test'));
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Save offline HTML viewer',exact:true}).click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'metaphornik-results.html');
 await page.getByLabel(/Remember this key/).check();await page.getByRole('button',{name:'Apply settings',exact:true}).click();await page.reload();await page.locator('summary').filter({hasText:'Provider settings'}).click();assert.equal(await page.getByLabel('API key',{exact:true}).inputValue(),'fake-key-for-browser-test');
 await page.getByRole('button',{name:'Clear key and reset settings',exact:true}).click();assert.equal(await page.getByLabel('API key',{exact:true}).inputValue(),'');assert.equal(await page.evaluate(()=>localStorage.getItem('metaphornik-provider-settings-v1')),null);
 // Re-import the canonical example without a key, then load without any provider request.
 await page.locator('input[type=file]').setInputFiles(new URL('../portable/example-metaphornik-results.json',import.meta.url).pathname);
 await page.getByRole('button',{name:/Saved$/}).click();const before=requests;await page.getByRole('button',{name:'Learning is a journey',exact:true}).click();await page.getByText('Learners can revise their route.',{exact:true}).waitFor();assert.equal(requests,before);
 const hostile=structuredClone(example);const hostileRecord=Object.values(hostile.analyses)[0];
 const attack='<img src=x onerror="globalThis.metaphornikPwned=true">';
 hostileRecord.analysis.mappingSets.push({...structuredClone(hostileRecord.analysis.mappingSets[0]),name:'Second perspective'});
 hostileRecord.exploredPerspectives[0].consequences=['## Hostile text\n'+attack];
 hostileRecord.exploredPerspectives[0].generatedDocuments[0].content=attack;
 hostileRecord.exploredPerspectives.push({mappingSetIndex:1,consequences:[attack]});
 hostileRecord.comparisons=[{perspectiveIndices:[0,1],aiSummary:attack,userNotes:attack,timestamp:1}];
 await page.locator('input[type=file]').setInputFiles({name:'hostile-results.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(hostile))});
 await page.getByRole('button',{name:/Saved$/}).click();await page.getByRole('button',{name:'Learning is a journey',exact:true}).click();
 await page.getByText(attack,{exact:true}).first().waitFor();assert.equal(await page.locator('img[src="x"]').count(),0);
 await page.getByRole('button',{name:/Compare Perspectives$/}).click();await page.getByRole('button').filter({hasText:'Choosing a route'}).first().click();await page.getByRole('button').filter({hasText:'Second perspective'}).first().click();
 await page.getByText('Comparative Analysis',{exact:true}).waitFor();assert.equal(await page.locator('textarea[placeholder^="Record your own"]').inputValue(),attack);assert.equal(await page.evaluate(()=>globalThis.metaphornikPwned),undefined);assert.equal(await page.locator('img[src="x"]').count(),0);
 // Key and quota failures remain actionable without exposing provider response bodies.
 await page.getByLabel('API key',{exact:true}).fill('fake-key-for-browser-test');await page.getByRole('button',{name:'Apply settings',exact:true}).click();errorStatus=401;
 await page.getByRole('button',{name:/Analyze$/}).click();await page.getByText(/Key rejected or model access denied/).waitFor();assert.ok(!(await page.locator('body').innerText()).includes('fake-key-must-not-appear'));
 assert.deepEqual(errors,[]);
 await context.close();
 // Open the packaged viewer from disk, with network disabled.
 const offline=await browser.newContext({offline:true});const viewer=await offline.newPage();
 await viewer.goto(pathToFileURL(new URL('../dist/metaphornik-example.html',import.meta.url).pathname).href);
 await viewer.getByRole('heading',{name:'Learning is a journey',exact:true}).waitFor();assert.equal(await viewer.locator('details').count(),1);
 await viewer.locator('summary').click();assert.equal(await viewer.locator('details').getAttribute('open'),null);await viewer.locator('summary').click();
 await viewer.getByRole('button',{name:'Save results JSON',exact:true}).waitFor();assert.equal(await viewer.locator('script[src]').count(),0);await offline.close();
 console.log('Browser smoke passed: own-key setup, memory default, explicit persistence/reset, mocked analysis, image generation and image editing, no-key import/load, hostile consequence/document/comparison text, HTML download, redacted 401 error, offline file viewer. No real provider calls.');
} finally { await browser.close(); }
