/**
 * Lightweight checkout funnel analytics.
 * Sends to gtag when NEXT_PUBLIC_GA_ID is set; always logs in dev.
 */
export function trackApexEvent(event, params = {}) {
  if (typeof window === "undefined") return;

  const payload = { event, ...params, surface: "apex", ts: Date.now() };

  if (process.env.NODE_ENV === "development") {
    console.info("[apex-analytics]", payload);
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

export const APEX_EVENTS = {
  VIEW_PRICING: "apex_view_pricing",
  CLICK_CHECKOUT: "apex_click_checkout",
  CHECKOUT_START: "apex_checkout_start",
  CHECKOUT_SUBMIT: "apex_checkout_submit",
  CHECKOUT_SUCCESS: "apex_checkout_success",
  LEAD_SUBMIT: "apex_lead_submit",
};
