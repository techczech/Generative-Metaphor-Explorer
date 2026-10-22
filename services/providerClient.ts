import { requireSettings } from './providerSettings.ts';

type Schema = { type: string; properties?: Record<string, Schema>; items?: Schema; required?: string[]; description?: string };
function jsonSchema(schema: Schema): object {
  return { ...schema, type: schema.type.toLowerCase(),
    ...(schema.properties ? { properties: Object.fromEntries(Object.entries(schema.properties).map(([k,v]) => [k,jsonSchema(v)])), additionalProperties: false } : {}),
    ...(schema.items ? { items: jsonSchema(schema.items) } : {}) };
}
function check(value: unknown, schema: Schema): void {
  const type = schema.type.toLowerCase();
  if (type === 'array') { if (!Array.isArray(value)) throw new Error('Invalid array'); value.forEach(v => check(v, schema.items!)); }
  else if (type === 'object') { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid object');
    for (const key of schema.required || []) if (!(key in value)) throw new Error('Missing field');
    for (const [key, child] of Object.entries(schema.properties || {})) if (key in value) check((value as any)[key], child);
  } else if (type === 'integer' ? !Number.isInteger(value) : typeof value !== type) throw new Error('Invalid value');
}
async function request(url: string, init: RequestInit, provider: string) {
  let response: Response;
  try { response = await fetch(url, { ...init, signal: AbortSignal.timeout(180000), credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer' }); }
  catch { throw new Error(`${provider}: could not reach the API, or the request timed out. Check your connection and browser access.`); }
  if (!response.ok) {
    const reason = response.status === 401 || response.status === 403 ? 'Key rejected or model access denied. Check your key, API permissions and model access.'
      : response.status === 429 ? 'Rate limit or quota reached. Check API billing and try later.'
      : response.status === 400 || response.status === 404 ? 'Request or model unavailable. Check the model IDs and image permissions in Provider settings.'
      : 'Provider error. Try again later.';
    throw new Error(`${provider} (${response.status}): ${reason}`);
  }
  try { return await response.json(); } catch { throw new Error(`${provider}: returned an unreadable response.`); }
}
export function getProviderClient() {
  const settings = requireSettings();
  return { models: { generateContent: async (args: any): Promise<any> => {
    const image = !!args.config?.responseModalities;
    let text: string | undefined;
    let result: any;
    if (settings.provider === 'gemini') {
      result = await request(`https://generativelanguage.googleapis.com/v1beta/models/${image ? settings.imageModel : settings.textModel}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.apiKey },
        body: JSON.stringify({ contents: typeof args.contents === 'string' ? [{ parts: [{ text: args.contents }] }] : [args.contents],
          ...(args.config ? { generationConfig: args.config } : {}) }) }, 'Gemini');
      const finishReason = result.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') throw new Error('Gemini: generation was blocked or incomplete. Try a different prompt.');
      text = result.candidates?.[0]?.content?.parts?.filter((p: any) => typeof p.text === 'string').map((p: any) => p.text).join('');
    } else if (image) {
      const parts = args.contents.parts;
      const base = parts.find((p: any) => p.inlineData)?.inlineData;
      const prompt = parts.find((p: any) => p.text)?.text;
      let body: BodyInit;
      const headers: Record<string,string> = { Authorization: `Bearer ${settings.apiKey}` };
      if (base) {
        const form = new FormData();
        form.append('model', settings.imageModel); form.append('prompt', prompt);
        const bytes = Uint8Array.from(atob(base.data), c => c.charCodeAt(0));
        form.append('image', new Blob([bytes], { type: base.mimeType }), `perspective.${base.mimeType.split('/')[1]}`);
        body = form;
      } else { headers['Content-Type'] = 'application/json'; body = JSON.stringify({ model: settings.imageModel, prompt, n: 1 }); }
      const data = await request(`https://api.openai.com/v1/images/${base ? 'edits' : 'generations'}`, { method: 'POST', headers, body }, 'OpenAI');
      const encoded = data.data?.[0]?.b64_json;
      if (!encoded) throw new Error('OpenAI: image generation returned no image. Check image model access.');
      result = { candidates: [{ content: { parts: [{ inlineData: { data: encoded, mimeType: 'image/png' } }] } }] };
    } else {
      const schema = args.config?.responseSchema;
      const response = await request('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
        body: JSON.stringify({ model: settings.textModel, messages: [{ role: 'user', content: args.contents }],
          ...(schema ? { response_format: { type: 'json_schema', json_schema: { name: 'metaphornik', strict: true,
            schema: { type: 'object', properties: { result: jsonSchema(schema) }, required: ['result'], additionalProperties: false } } } } : {}) }) }, 'OpenAI');
      const choice = response.choices?.[0];
      if (choice?.message?.refusal || choice?.finish_reason !== 'stop') throw new Error('OpenAI: generation was refused or incomplete. Try a different prompt.');
      text = choice.message.content;
      if (schema) { try { text = JSON.stringify(JSON.parse(text!).result); } catch { throw new Error('OpenAI: returned invalid structured results. Try again.'); } }
      result = {};
    }
    if (!image) {
      if (!text?.trim()) throw new Error(`${settings.provider}: returned no text. The request may have been blocked.`);
      if (args.config?.responseSchema) { try { check(JSON.parse(text), args.config.responseSchema); } catch { throw new Error('The provider returned invalid structured results. Try again.'); } }
      result.text = text;
    }
    return result;
  } } };
}
