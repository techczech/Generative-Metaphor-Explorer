import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const {chromium}=await import(process.env.METAPHORNIK_PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.METAPHORNIK_HEADLESS_SHELL?{executablePath:process.env.METAPHORNIK_HEADLESS_SHELL}:{})});
const fixture=JSON.parse(readFileSync(new URL('../portable/example-metaphornik-results.json',import.meta.url),'utf8'));
const record=Object.values(fixture.analyses)[0];
record.analysis.mappingSets.push({...structuredClone(record.analysis.mappingSets[0]),name:'Second saved perspective'});
record.exploredPerspectives.push({mappingSetIndex:1,consequences:['Existing second perspective.']});
record.comparisons=[{perspectiveIndices:[0,1],aiSummary:'Existing saved comparison remains usable.',userNotes:'Preserve these notes.',timestamp:1}];
try {
 const context=await browser.newContext();let providerRequests=0;
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
  if(['api.openai.com','generativelanguage.googleapis.com'].includes(url.hostname))providerRequests++;
  return route.abort();
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.METAPHORNIK_TEST_URL || 'http://127.0.0.1:3000');
 await page.locator('input[type=file]').setInputFiles({name:'valid-results.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
 await page.getByRole('button',{name:'Learning is a journey',exact:true}).waitFor();
 const original=await page.evaluate(()=>localStorage.getItem('metaphorAnalyses'));
 for(const field of ['comparisons','generatedDocuments','generatedImage'])for(const value of [false,0,'',null]){
  await page.reload();await page.getByRole('button',{name:'Learning is a journey',exact:true}).waitFor();
  const invalid=structuredClone(fixture);const record=Object.values(invalid.analyses)[0];
  (field==='comparisons'?record:record.exploredPerspectives[0])[field]=value;
  await page.locator('input[type=file]').setInputFiles({name:'invalid-results.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await page.getByText("Failed to import file. Please make sure it's a valid JSON export from this tool.",{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('metaphorAnalyses')),original,`${field}=${JSON.stringify(value)} changed stored results`);
 }
 await page.getByRole('button',{name:'Learning is a journey',exact:true}).click();await page.getByText('Learners can revise their route.',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Compare Perspectives$/}).click();
 await page.getByRole('button').filter({hasText:'Choosing a route'}).first().click();await page.getByRole('button').filter({hasText:'Second saved perspective'}).first().click();
 await page.getByText('Existing saved comparison remains usable.',{exact:true}).waitFor();
 assert.equal(await page.locator('textarea[placeholder^="Record your own"]').inputValue(),'Preserve these notes.');
 assert.equal(await page.evaluate(()=>localStorage.getItem('metaphorAnalyses')),original);assert.equal(providerRequests,0);assert.deepEqual(errors,[]);
 await context.close();
 console.log('Invalid import browser regression passed: 12 falsy optional-field imports rejected, stored results unchanged across reloads, existing perspectives/comparison/notes usable, zero page errors or provider calls.');
}finally{await browser.close();}
