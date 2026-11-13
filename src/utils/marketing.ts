import { readStorage, writeStorage } from './history';
const incoming = new URLSearchParams(window.location.search).get('marketing_id');
if (incoming) writeStorage('marketing-id', incoming);
const marketingId = incoming || readStorage('marketing-id');
function log(action: string, additional?: unknown): void {
  if (!marketingId) return;
  void fetch(`${process.env.VUE_APP_API_MARKETING}/action`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: marketingId, action, path_from: document.referrer, path_to: window.location.href, additional_data: JSON.stringify(additional) }),
  }).catch(() => { /* Analytics must never interrupt printing. */ });
}
export const log_open_app = () => log('printer webapp open');
export const log_open_history = () => log('printer webapp history');
export const log_open_qr = () => log('printer webapp open qr');
export const log_print = (status: string, pin?: string) => log('printer webapp print', { status, pin });
export const log_print_qr = (pins: string[]) => log('printer webapp print qr', { pins });
export const log_error_qr = (pins: string[], error: unknown) => log('printer webapp print qr error', { pins, error: String(error) });
