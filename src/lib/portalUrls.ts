/** Canonical production URLs — gateway opens these in new tabs/windows. */
export const APEX_GATEWAY_URL = "https://apex.assps.edu.pk/gateway";
export const SAAS_APP_URL = "https://app.assps.edu.pk";
export const SUPER_APP_URL = "https://api.assps.edu.pk";

export const SAAS_LOGIN_URL = `${SAAS_APP_URL}/login`;
export const SUPER_APP_LOGIN_URL = `${SUPER_APP_URL}/login`;

function openExternalPortal(url: string) {
  if (typeof window === "undefined") return;

  const targetUrl = new URL(url).toString();
  const link = document.createElement("a");
  link.href = targetUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.referrerPolicy = "no-referrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function openSaasLogin() {
  openExternalPortal(SAAS_LOGIN_URL);
}

export function openSuperAppLogin() {
  openExternalPortal(SUPER_APP_LOGIN_URL);
}
