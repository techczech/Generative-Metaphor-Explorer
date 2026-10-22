export type Provider = 'openai' | 'gemini';
export interface ProviderSettings { provider: Provider; apiKey: string; textModel: string; imageModel: string; remember: boolean }
export const defaults = (provider: Provider): ProviderSettings => ({ provider, apiKey: '', remember: false,
  textModel: provider === 'openai' ? 'gpt-4.1-mini' : 'gemini-2.5-pro',
  imageModel: provider === 'openai' ? 'gpt-image-1' : 'gemini-2.5-flash-image' });
const STORAGE_KEY = 'metaphornik-provider-settings-v1';
let settings = defaults('openai');
let version = 0;
const listeners = new Set<() => void>();
export const getProviderVersion = () => version;
export function subscribeProviderSettings(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function applySettings(next: ProviderSettings) {
  const changed = (['provider','apiKey','textModel','imageModel'] as const).some(key => settings[key] !== next[key]);
  settings = next;
  if (changed) { version++; listeners.forEach(listener => listener()); }
}
export function getSettings() { return { ...settings }; }
export function configureProvider(next: ProviderSettings, storage?: Storage) {
  if (!['openai', 'gemini'].includes(next.provider)) throw new Error('Choose Gemini or OpenAI.');
  const textModel = next.textModel.trim(), imageModel = next.imageModel.trim(), apiKey = next.apiKey.trim();
  if (![textModel, imageModel].every(v => /^[a-zA-Z0-9._-]+$/.test(v))) throw new Error('Enter valid model IDs.');
  if (/\s/.test(apiKey)) throw new Error('The API key must not contain spaces.');
  // Memory remains usable even when browser storage is blocked.
  applySettings({ ...next, apiKey, textModel, imageModel });
  storage?.removeItem(STORAGE_KEY);
  if (next.remember && !storage) throw new Error('Browser storage is unavailable. Use this key in memory instead.');
  if (next.remember) storage?.setItem(STORAGE_KEY, JSON.stringify({ ...next, apiKey, textModel, imageModel }));
}
export function restoreProvider(storage: Storage) {
  try { const raw = storage.getItem(STORAGE_KEY); if (raw) {
    const value = JSON.parse(raw);
    if (value.remember === true && typeof value.apiKey === 'string' && typeof value.textModel === 'string' && typeof value.imageModel === 'string') configureProvider(value, storage);
  } } catch { storage.removeItem(STORAGE_KEY); }
  return getSettings();
}
export function clearProvider(storage?: Storage) { applySettings(defaults(settings.provider)); storage?.removeItem(STORAGE_KEY); return getSettings(); }
export function requireSettings() {
  const value = getSettings();
  if (!value.apiKey) throw new Error(`Add your ${value.provider === 'openai' ? 'OpenAI' : 'Gemini'} API key in Provider settings to generate content. Saved results need no key.`);
  return value;
}
