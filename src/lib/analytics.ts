export type AnalyticsEvent =
  | 'cta_click'
  | 'contact_click'
  | 'case_view'
  | 'service_view'
  | 'manifesto_play'
  | 'manifesto_complete'
  | 'manifesto_skip'
  | 'manifesto_error';
export function track(event: AnalyticsEvent, detail: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent('lime:analytics', { detail: { event, ...detail } }));
}
