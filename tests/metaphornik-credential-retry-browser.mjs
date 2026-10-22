import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const {chromium}=await import(process.env.METAPHORNIK_PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.METAPHORNIK_HEADLESS_SHELL?{executablePath:process.env.METAPHORNIK_HEADLESS_SHELL}:{})});
const base=process.env.METAPHORNIK_TEST_URL || 'http://127.0.0.1:3000';
const fixture=JSON.parse(readFileSync(new URL('../portable/example-metaphornik-results.json',import.meta.url),'utf8'));
const record=Object.values(fixture.analyses)[0];
record.analysis.mappingSets.push({...structuredClone(record.analysis.mappingSets[0]),name:'Unexplored perspective'});
record.analysis.mappingSets.push({...structuredClone(record.analysis.mappingSets[0]),name:'Delayed perspective'});
record.analysis.mappingSets.push({...structuredClone(record.analysis.mappingSets[0]),name:'Later follow-up'});
try {
 const context=await browser.newContext();
 await context.addInitScript(value=>localStorage.setItem('metaphorAnalyses',JSON.stringify(value)),fixture.analyses);
 await context.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 let requests=0;let release;let hold=true;
 await context.route('https://api.openai.com/v1/chat/completions',async route=>{
   requests++;
   if(hold)await new Promise(resolve=>{release=resolve;});
   try {await route.fulfill({json:{choices:[{finish_reason:'stop',message:{content:'Retried selected perspective.'}}]}});}catch{}
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByRole('button',{name:'Learning is a journey',exact:true}).click();await page.getByText('Learners can revise their route.',{exact:true}).waitFor();assert.equal(requests,0);
 await page.getByRole('button').filter({hasText:'Unexplored perspective'}).click();await page.getByText(/Add your API key in Provider settings/).waitFor();assert.equal(requests,0);
 await page.locator('summary').filter({hasText:'Provider settings'}).click();await page.getByLabel('API key',{exact:true}).fill('fake-retry-key');await page.getByRole('button',{name:'Apply settings',exact:true}).click();
 await page.waitForFunction(()=>document.body.innerText.includes('Exploring consequences...'));assert.equal(requests,1);
 // Neither applying identical settings nor unrelated parent renders may duplicate a pending call.
 await page.getByRole('button',{name:'Apply settings',exact:true}).click();await page.getByRole('button',{name:/About$/}).click();await page.getByRole('button',{name:/Explorer$/}).click();assert.equal(requests,1);
 hold=false;release();await page.getByText('Retried selected perspective.',{exact:true}).waitFor();assert.equal(requests,1);
 await page.getByRole('button',{name:'Apply settings',exact:true}).click();assert.equal(requests,1);
 // Start a later perspective, clear its credentials while it is pending, and release the stale response.
 await page.getByRole('button',{name:'Clear key and reset settings',exact:true}).click();
 await page.getByRole('button',{name:/Compare Perspectives$/}).click();
 await page.getByRole('button').filter({hasText:'Delayed perspective'}).click();await page.getByRole('button').filter({hasText:'Later follow-up'}).click();
 hold=true;await page.getByLabel('API key',{exact:true}).fill('fake-retry-key');await page.getByRole('button',{name:'Apply settings',exact:true}).click();
 for(let attempt=0;attempt<100 && requests<2;attempt++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal(requests,2);
 await page.getByRole('button',{name:'Clear key and reset settings',exact:true}).click();release();await page.getByText(/Add your API key in Provider settings/).waitFor();
 await page.getByRole('button',{name:/Cancel$/}).click();await page.getByRole('button').filter({hasText:'Choosing a route'}).first().click();await page.getByText('Learners can revise their route.',{exact:true}).waitFor();assert.equal(requests,2);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('metaphorAnalyses')));assert.ok(!Object.values(saved)[0].exploredPerspectives.some(p=>p.mappingSetIndex===2));
 assert.deepEqual(errors,[]);await context.close();
 console.log('Credential retry browser regression passed: actionable no-key prompt, one automatic retry on setup, no duplicate call on rerender/identical settings, saved content keyless, stale response after clear discarded. No real API calls.');
}finally{await browser.close();}
