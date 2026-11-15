import {
  DEFAULT_LOOKBOOK,
  DEFAULT_PRODUCTS,
  DEFAULT_SITE_SETTINGS,
} from "./demo-data";
import { hasSupabaseConfig } from "./supabase/config";
import { createSupabaseServerPublicClient } from "./supabase/server";
import type {
  LookbookEntry,
  Product,
  ShowroomSnapshot,
  SiteSettings,
} from "./types";

function normalizeSettings(raw?: Partial<SiteSettings> | null): SiteSettings {
  if (!raw) return DEFAULT_SITE_SETTINGS;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...raw,
    id: 1,
  };
}

function normalizeProduct(raw: Partial<Product>): Product {
  return {
    id: raw.id ?? crypto.randomUUID(),
    slug: raw.slug ?? "bespoke-garment",
    name: raw.name ?? "Atelier Garment",
    sku: raw.sku ?? "ATL-00",
    category: raw.category ?? "Bespoke Suits",
    fabric: raw.fabric ?? "Atelier Silk & Wool",
    occasion: raw.occasion ?? "Ceremonial & Evening",
    price_inr: Number(raw.price_inr ?? 0),
    price_label: raw.price_label ?? "Made to measure",
    tailoring_days: Number(raw.tailoring_days ?? 14),
    is_customizable: Boolean(raw.is_customizable ?? true),
    same_design_available: Boolean(raw.same_design_available ?? true),
    featured: Boolean(raw.featured ?? false),
    in_stock: Boolean(raw.in_stock ?? true),
    sort_order: Number(raw.sort_order ?? 0),
    description: raw.description ?? "",
    craft_notes: raw.craft_notes ?? "",
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : ["/images/suit-charcoal.jpg"],
    colors:
      Array.isArray(raw.colors) && raw.colors.length > 0
        ? raw.colors
        : ["Atelier Signature"],
    fabric_options:
      Array.isArray(raw.fabric_options) && raw.fabric_options.length > 0
        ? raw.fabric_options
        : [raw.fabric ?? "House Mill Cloth"],
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function normalizeLookbook(raw: Partial<LookbookEntry>): LookbookEntry {
  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? "Atelier Chapter",
    season: raw.season ?? "Atelier Edit",
    story: raw.story ?? "",
    fabric_notes: raw.fabric_notes ?? "",
    image_url: raw.image_url ?? "/images/suit-charcoal.jpg",
    product_id: raw.product_id ?? null,
    sort_order: Number(raw.sort_order ?? 0),
    created_at: raw.created_at,
  };
}

export async function fetchShowroomSnapshotServer(): Promise<ShowroomSnapshot> {
  const configured = hasSupabaseConfig();
  if (!configured) {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      products: DEFAULT_PRODUCTS,
      lookbook: DEFAULT_LOOKBOOK,
      mode: "demo",
      supabaseConfigured: false,
      schemaReady: false,
    };
  }

  const supabase = createSupabaseServerPublicClient();
  if (!supabase) {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      products: DEFAULT_PRODUCTS,
      lookbook: DEFAULT_LOOKBOOK,
      mode: "demo",
      supabaseConfigured: false,
      schemaReady: false,
    };
  }

  try {
    const [settingsRes, productsRes, lookbookRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("lookbook_entries")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    if (settingsRes.error && productsRes.error) {
      return {
        settings: DEFAULT_SITE_SETTINGS,
        products: DEFAULT_PRODUCTS,
        lookbook: DEFAULT_LOOKBOOK,
        mode: "demo",
        supabaseConfigured: true,
        schemaReady: false,
      };
    }

    const products =
      !productsRes.error && Array.isArray(productsRes.data)
        ? productsRes.data.map(normalizeProduct)
        : DEFAULT_PRODUCTS;

    const lookbook =
      !lookbookRes.error && Array.isArray(lookbookRes.data)
        ? lookbookRes.data.map(normalizeLookbook)
        : DEFAULT_LOOKBOOK;

    return {
      settings: normalizeSettings(settingsRes.data),
      products,
      lookbook,
      mode: "supabase",
      supabaseConfigured: true,
      schemaReady: !settingsRes.error && !productsRes.error,
    };
  } catch {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      products: DEFAULT_PRODUCTS,
      lookbook: DEFAULT_LOOKBOOK,
      mode: "demo",
      supabaseConfigured: true,
      schemaReady: false,
    };
  }
}
