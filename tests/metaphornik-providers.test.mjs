import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { defaults,configureProvider,getSettings,restoreProvider,clearProvider } from '../services/providerSettings.ts';
import { getProviderClient } from '../services/providerClient.ts';
const blockedFetch=async()=>{throw new Error('Real network disabled in provider tests');};
globalThis.fetch=blockedFetch;
afterEach(()=>{globalThis.fetch=blockedFetch;clearProvider();});
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};};
const json=value=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
const schema={type:'ARRAY',items:{type:'STRING'}};
const call=()=>getProviderClient().models.generateContent({contents:'Unchanged prompt',config:{responseSchema:schema,responseMimeType:'application/json'}});
test('memory-only default, explicit persistence, opt-out and clear',()=>{
 const s=storage();configureProvider({...defaults('openai'),apiKey:'fake-key'},s);assert.equal(s.map.size,0);
 configureProvider({...getSettings(),remember:true},s);assert.equal(s.map.size,1);clearProvider();restoreProvider(s);assert.equal(getSettings().apiKey,'fake-key');
 configureProvider({...getSettings(),remember:false},s);assert.equal(s.map.size,0);clearProvider(s);assert.equal(getSettings().apiKey,'');
});
test('missing keys fail before fetch',()=>{let called=false;globalThis.fetch=()=>{called=true;};assert.throws(()=>getProviderClient(),/Add your/);assert.equal(called,false);});
test('OpenAI uses bearer header, wrapped structured outputs, and preserves prompt',async()=>{
 configureProvider({...defaults('openai'),apiKey:'fake-key'});
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.openai.com/v1/chat/completions');assert.ok(!url.includes('fake-key'));assert.equal(init.headers.Authorization,'Bearer fake-key');const body=JSON.parse(init.body);assert.equal(body.messages[0].content,'Unchanged prompt');assert.equal(body.response_format.json_schema.schema.properties.result.type,'array');assert.ok(!init.body.includes('fake-key'));return json({choices:[{finish_reason:'stop',message:{content:'{"result":["new fact"]}'}}]});};
 assert.equal((await call()).text,'["new fact"]');
});
test('Gemini direct request uses header key and native array schema',async()=>{
 configureProvider({...defaults('gemini'),apiKey:'fake-key'});
 globalThis.fetch=async(url,init)=>{assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'));assert.ok(!url.includes('fake-key'));assert.equal(init.headers['x-goog-api-key'],'fake-key');assert.deepEqual(JSON.parse(init.body).contents,[{parts:[{text:'Unchanged prompt'}]}]);return json({candidates:[{content:{parts:[{text:'["new fact"]'}]}}]});};assert.equal((await call()).text,'["new fact"]');
});
test('provider errors redact raw responses and identify key and quota failures',async()=>{
 configureProvider({...defaults('openai'),apiKey:'fake-key'});
 for(const [status,pattern] of [[401,/Key rejected/],[429,/quota/],[404,/model unavailable/]]){globalThis.fetch=async()=>new Response('fake-key secret raw body',{status});await assert.rejects(call(),e=>pattern.test(e.message)&&!e.message.includes('fake-key'));}
});
test('incomplete or malformed model output is rejected',async()=>{
 configureProvider({...defaults('openai'),apiKey:'fake-key'});
 for(const message of [{finish_reason:'length',message:{content:'{}'}},{finish_reason:'stop',message:{content:'{"result":[42]}'}}]){globalThis.fetch=async()=>json({choices:[message]});await assert.rejects(call(),/incomplete|invalid structured/);}
});
test('OpenAI image generation and multipart edit preserve image content',async()=>{
 configureProvider({...defaults('openai'),apiKey:'fake-key'});
 for(const edit of [false,true]){globalThis.fetch=async(url,init)=>{assert.equal(url,`https://api.openai.com/v1/images/${edit?'edits':'generations'}`);if(edit){assert.ok(init.body instanceof FormData);assert.equal(init.body.get('image').type,'image/png');assert.equal(init.body.get('prompt'),'draw');}else{assert.equal(JSON.parse(init.body).model,'gpt-image-1');}return json({data:[{b64_json:'AAAA'}]});};
 const response=await getProviderClient().models.generateContent({contents:{parts:[...(edit?[{inlineData:{data:'AAAA',mimeType:'image/png'}}]:[]),{text:'draw'}]},config:{responseModalities:['IMAGE']}});assert.equal(response.candidates[0].content.parts[0].inlineData.data,'AAAA');}
});
test('Gemini image edits preserve inline input and modalities',async()=>{
 configureProvider({...defaults('gemini'),apiKey:'fake-key'});globalThis.fetch=async(url,init)=>{assert.ok(url.includes('gemini-2.5-flash-image'));const body=JSON.parse(init.body);assert.equal(body.contents[0].parts[0].inlineData.data,'AAAA');assert.deepEqual(body.generationConfig.responseModalities,['IMAGE']);return json({candidates:[{content:{parts:[{inlineData:{data:'AAAA',mimeType:'image/png'}}]}}]});};await getProviderClient().models.generateContent({contents:{parts:[{inlineData:{data:'AAAA',mimeType:'image/png'}},{text:'edit'}]},config:{responseModalities:['IMAGE']}});
});
test('blocked storage still permits in-memory configuration and memory reset',()=>{
 const s={removeItem:()=>{throw new Error('blocked');}};
 assert.throws(()=>configureProvider({...defaults('openai'),apiKey:'fake-key'},s));assert.equal(getSettings().apiKey,'fake-key');
 assert.throws(()=>clearProvider(s));assert.equal(getSettings().apiKey,'');
});
test('Gemini incomplete output and transport failures stay clear and redact raw errors',async()=>{
 configureProvider({...defaults('gemini'),apiKey:'fake-key'});
 globalThis.fetch=async()=>json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial'}]}}]});await assert.rejects(call(),/blocked or incomplete/);
 globalThis.fetch=async()=>{throw new Error('raw error containing fake-key');};await assert.rejects(call(),e=>e.message.includes('could not reach')&&!e.message.includes('fake-key'));
});
