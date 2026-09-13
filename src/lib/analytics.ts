export type AnalyticsEvent = 'cta_click' | 'contact_click' | 'case_view' | 'service_view';
export function track(event: AnalyticsEvent, detail: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent('lime:analytics', { detail: { event, ...detail } }));
}
