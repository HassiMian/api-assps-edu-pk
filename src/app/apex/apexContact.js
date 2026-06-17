/** APEX support & sales contact channels */
export const APEX_SUPPORT_EMAIL = "support@apex.assps.edu.pk";
export const APEX_WHATSAPP_E164 = "923452744344";

export function apexWhatsAppUrl(message = "Hello APEX team, I want a school demo.") {
  const text = encodeURIComponent(message);
  return `https://wa.me/${APEX_WHATSAPP_E164}?text=${text}`;
}
