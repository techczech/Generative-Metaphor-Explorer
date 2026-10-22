import React, { useState } from 'react';
import { getSettings, restoreProvider, configureProvider, clearProvider, defaults, Provider } from '../services/providerSettings';
const browserStorage = () => { try { return window.localStorage; } catch { return undefined; } };
export default function ProviderSettings() {
  const [value,setValue]=useState(()=>{try{return restoreProvider(localStorage);}catch{return getSettings();}});
  const [status,setStatus]=useState('');
  const update=(field:string,next:unknown)=>setValue(v=>({...v,[field]:next}));
  return <details className="mb-6 bg-white border border-slate-200 rounded-xl p-4">
    <summary className="font-semibold cursor-pointer">Provider settings — {value.provider === 'openai' ? 'OpenAI' : 'Gemini'}</summary>
    <p className="text-sm text-slate-600 my-3">Use your own API key for text, image generation and image editing. Requests go directly to the selected provider and use your API billing. Saved results can be viewed and exported without a key.</p>
    <form onSubmit={e=>{e.preventDefault();try{configureProvider(value,browserStorage());setStatus('Settings applied.');}catch(error){setStatus(error instanceof Error?error.message:'Could not save settings.');}}} className="grid sm:grid-cols-2 gap-3">
      <label>Provider<select className="block w-full border rounded p-2" value={value.provider} onChange={e=>{const next=defaults(e.target.value as Provider);try{clearProvider(browserStorage());configureProvider(next);}catch{}setValue(next);setStatus('Provider changed. Add its key and apply settings.');}}><option value="openai">OpenAI</option><option value="gemini">Gemini</option></select></label>
      <label>API key<input className="block w-full border rounded p-2" type="password" autoComplete="off" value={value.apiKey} onChange={e=>update('apiKey',e.target.value)}/></label>
      <label>Text model<input className="block w-full border rounded p-2" value={value.textModel} onChange={e=>update('textModel',e.target.value)}/></label>
      <label>Image model<input className="block w-full border rounded p-2" value={value.imageModel} onChange={e=>update('imageModel',e.target.value)}/></label>
      <label className="sm:col-span-2"><input type="checkbox" checked={value.remember} onChange={e=>{update('remember',e.target.checked);if(!e.target.checked){try{configureProvider({...getSettings(),remember:false},browserStorage());}catch{setStatus('Could not remove remembered settings.');}}}}/> Remember this key on this browser (optional; other users and scripts on this device may access it).</label>
      <p className="text-sm text-slate-600 sm:col-span-2">Keys stay in memory unless you choose to remember them. API keys are separate from ChatGPT subscriptions. Model access, including image editing, depends on your provider account.</p>
      <button className="bg-blue-600 text-white rounded p-2" type="submit">Apply settings</button>
      <button className="border rounded p-2" type="button" onClick={()=>{try{setValue(clearProvider(browserStorage()));setStatus('Key cleared from memory and browser storage.');}catch{setValue(getSettings());setStatus('Key cleared from memory. Browser storage is unavailable.');}}}>Clear key and reset settings</button>
      <p role="status" className="sm:col-span-2">{status}</p>
    </form>
  </details>;
}
