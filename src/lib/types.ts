export interface SiteSettings {
  id: number;
  brand_name: string;
  short_mark: string;
  tagline: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_accent: string;
  hero_subtitle: string;
  hero_image_url: string;
  craft_image_url: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  opening_hours: string;
  instagram_handle: string;
  instagram_url: string;
  logo_url: string;
  turnaround_note: string;
  currency_code: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  fabric: string;
  occasion: string;
  price_inr: number;
  price_label: string;
  tailoring_days: number;
  is_customizable: boolean;
  same_design_available: boolean;
  featured: boolean;
  in_stock: boolean;
  sort_order: number;
  description: string;
  craft_notes: string;
  images: string[];
  colors: string[];
  fabric_options: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LookbookEntry {
  id: string;
  title: string;
  season: string;
  story: string;
  fabric_notes: string;
  image_url: string;
  product_id: string | null;
  sort_order: number;
  created_at?: string;
}

export interface CustomMeasurements {
  chest?: string;
  shoulder?: string;
  waist?: string;
  sleeve?: string;
  length?: string;
  trouserWaist?: string;
  trouserLength?: string;
  collar?: string;
}

export type InquiryType = "same_design" | "custom_design" | "bespoke_request";

export type InquiryStatus =
  | "new"
  | "in_discussion"
  | "measuring"
  | "tailoring"
  | "completed";

export interface CustomInquiry {
  id: string;
  inquiry_type: InquiryType;
  product_id: string | null;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  order_mode: string;
  standard_size: string;
  preferred_fabric: string;
  preferred_color: string;
  fit_preference: string;
  measurements: CustomMeasurements;
  notes: string;
  whatsapp_message: string;
  status: InquiryStatus;
  created_at: string;
}

export type DataSourceMode = "supabase" | "demo";

export interface ShowroomSnapshot {
  settings: SiteSettings;
  products: Product[];
  lookbook: LookbookEntry[];
  mode: DataSourceMode;
  supabaseConfigured: boolean;
  schemaReady: boolean;
}
