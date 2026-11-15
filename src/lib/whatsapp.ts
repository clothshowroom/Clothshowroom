import type { CustomMeasurements, InquiryType, SiteSettings } from "./types";
import { sanitizeWhatsAppDigits } from "./utils";

export interface WhatsAppOrderPayload {
  inquiryType: InquiryType;
  brandName: string;
  productName?: string;
  sku?: string;
  orderMode: "Standard Size" | "Custom Measurements";
  standardSize?: string;
  preferredFabric?: string;
  preferredColor?: string;
  fitPreference?: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  occasionOrDate?: string;
  measurements?: CustomMeasurements;
  notes?: string;
}

export function formatMeasurementsText(m?: CustomMeasurements): string {
  if (!m) return "Will share via WhatsApp / home trial";
  const entries: Array<[string, string | undefined]> = [
    ["Chest", m.chest],
    ["Shoulder", m.shoulder],
    ["Waist", m.waist],
    ["Sleeve", m.sleeve],
    ["Jacket/Kurta Length", m.length],
    ["Trouser Waist", m.trouserWaist],
    ["Trouser Length", m.trouserLength],
    ["Collar/Neck", m.collar],
  ];
  const filled = entries
    .filter(([, val]) => Boolean(val && val.trim()))
    .map(([label, val]) => `${label}: ${val?.trim()}`);
  return filled.length > 0
    ? filled.join(" · ")
    : "Will share measurements with master tailor";
}

export function buildOrderWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const headerTag =
    payload.inquiryType === "same_design"
      ? "ARCHIVE ORDER (SAME AS SHOWN)"
      : payload.inquiryType === "custom_design"
        ? "CATALOGUE CUSTOMISATION ORDER"
        : "NEW BESPOKE TAILORING BRIEF";

  const lines: string[] = [
    `Namaste *${payload.brandName}* Atelier,`,
    `*[${headerTag}]*`,
    "",
  ];

  if (payload.productName) {
    lines.push(
      `• *Design:* ${payload.productName}${payload.sku ? ` (${payload.sku})` : ""}`
    );
  }
  lines.push(`• *Order Mode:* ${payload.orderMode}`);
  if (payload.orderMode === "Standard Size" && payload.standardSize) {
    lines.push(`• *Size:* ${payload.standardSize}`);
  }
  if (payload.preferredFabric) {
    lines.push(`• *Fabric:* ${payload.preferredFabric}`);
  }
  if (payload.preferredColor) {
    lines.push(`• *Shade:* ${payload.preferredColor}`);
  }
  if (payload.fitPreference) {
    lines.push(`• *Silhouette / Fit:* ${payload.fitPreference}`);
  }
  if (payload.occasionOrDate) {
    lines.push(`• *Occasion / Target Date:* ${payload.occasionOrDate}`);
  }
  if (payload.orderMode === "Custom Measurements") {
    lines.push(`• *Measurements:* ${formatMeasurementsText(payload.measurements)}`);
  }

  lines.push("");
  lines.push(`• *Client:* ${payload.customerName || "Atelier Guest"}`);
  if (payload.customerPhone) {
    lines.push(`• *Phone:* ${payload.customerPhone}`);
  }
  if (payload.customerCity) {
    lines.push(`• *City:* ${payload.customerCity}`);
  }
  if (payload.notes?.trim()) {
    lines.push(`• *Tailoring Notes:* ${payload.notes.trim()}`);
  }

  lines.push("");
  lines.push("Please confirm fabric availability & master tailor consultation.");
  return lines.join("\n");
}

export function buildWhatsAppHref(
  settings: Pick<SiteSettings, "whatsapp_number" | "brand_name">,
  message?: string
): string {
  const digits = sanitizeWhatsAppDigits(settings.whatsapp_number || "919800000000");
  const defaultMsg = `Namaste ${settings.brand_name} Atelier, I would like to discuss a bespoke tailored outfit.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || defaultMsg)}`;
}
