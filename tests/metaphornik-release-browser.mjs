import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.METAPHORNIK_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.METAPHORNIK_TEST_URL||'http://127.0.0.1:4411';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});const external=[],errors=[];
await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();external.push(u.hostname);return r.abort();});
try{
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.getByRole('button',{name:/Analyze$/}).waitFor();await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.fonts.check('24px "Material Symbols Outlined Variable"')),true);
 mkdirSync('docs/shots-metaphornik-release',{recursive:true});await page.screenshot({path:'docs/shots-metaphornik-release/home-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/shots-metaphornik-release/home-mobile.png',fullPage:true});
 const staticContext=await browser.newContext({javaScriptEnabled:false});const staticPage=await staticContext.newPage();await staticPage.goto(base);assert.equal(await staticPage.getByRole('heading',{level:1}).innerText(),'Metaphornik');assert.match(await staticPage.locator('body').innerText(),/own API key/);await staticContext.close();
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);const receipt={checkedAt:new Date().toISOString(),base,checks:['JavaScript-off readable landing and own-key explanation','bundled icon font','desktop/mobile screenshots','zero external asset requests or page errors'],externalRequests:external,pageErrors:errors};writeFileSync('docs/evidence-metaphornik-release-browser.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{await browser.close();}
