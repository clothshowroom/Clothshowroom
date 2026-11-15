-- ============================================================================
-- Bespoke Cloth Showroom & Tailoring Atelier — Complete Supabase Schema
-- Run this SQL inside a BRAND-NEW, isolated Supabase project (SQL Editor).
-- Supports both this web storefront (/ + /admin) and future mobile apps.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Single-row dynamic storefront & brand configuration
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'ATELIER VIVANTA',
  short_mark text not null default 'AV',
  tagline text not null default 'Heritage of Indian Craftsmanship',
  hero_eyebrow text not null default 'Bespoke Couture Tailoring',
  hero_title text not null default 'Legacy of',
  hero_accent text not null default 'Indian Artistry...',
  hero_subtitle text not null default 'Commission any couture silhouette directly as photographed or customize mill silks, zari borders, shade swatches, and master measurements straight via WhatsApp.',
  hero_image_url text not null default '/images/royal-bridal-arch.jpg',
  craft_image_url text not null default '/images/atelier-craft.jpg',
  whatsapp_number text not null default '919800000000',
  phone text not null default '+91 98000 00000',
  email text not null default 'atelier@vivantacouture.example',
  address text not null default 'Haveli 14, Heritage Courtyard, Linking Road',
  city text not null default 'Jaipur · Mumbai',
  opening_hours text not null default 'Tue – Sun · 11:00 AM – 8:30 PM',
  instagram_handle text not null default '@atelier.couture',
  instagram_url text not null default 'https://instagram.com',
  logo_url text default '',
  turnaround_note text not null default '14–21 days bespoke couture tailoring · Worldwide & pan-India courier',
  currency_code text not null default 'INR',
  updated_at timestamptz not null default now()
);

-- 2. Catalogue products (order Same-As-Shown OR Customize fabric/color/measurements)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sku text not null,
  category text not null,
  fabric text not null,
  occasion text not null,
  price_inr integer not null default 0,
  price_label text not null default '',
  tailoring_days integer not null default 14,
  is_customizable boolean not null default true,
  same_design_available boolean not null default true,
  featured boolean not null default false,
  in_stock boolean not null default true,
  sort_order integer not null default 0,
  description text not null,
  craft_notes text not null default '',
  images text[] not null default '{}',
  colors text[] not null default '{}',
  fabric_options text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Editorial lookbook stories linked optionally to catalogue items
create table if not exists public.lookbook_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  season text not null,
  story text not null,
  fabric_notes text not null default '',
  image_url text not null,
  product_id uuid references public.products(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Customer tailoring orders & WhatsApp inquiry audit log
create table if not exists public.custom_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('same_design', 'custom_design', 'bespoke_request')),
  product_id uuid references public.products(id) on delete set null,
  product_name text default '',
  customer_name text not null,
  customer_phone text not null,
  customer_city text default '',
  order_mode text default 'Custom Measurements',
  standard_size text default '',
  preferred_fabric text default '',
  preferred_color text default '',
  fit_preference text default '',
  measurements jsonb not null default '{}'::jsonb,
  notes text default '',
  whatsapp_message text not null,
  status text not null default 'new' check (status in ('new', 'in_discussion', 'measuring', 'tailoring', 'completed')),
  created_at timestamptz not null default now()
);

-- Auto-update timestamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.lookbook_entries enable row level security;
alter table public.custom_inquiries enable row level security;

-- Public read access for storefront & mobile apps
drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated admin manages site_settings" on public.site_settings;
create policy "Authenticated admin manages site_settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated admin manages products" on public.products;
create policy "Authenticated admin manages products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read lookbook_entries" on public.lookbook_entries;
create policy "Public can read lookbook_entries"
  on public.lookbook_entries for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated admin manages lookbook_entries" on public.lookbook_entries;
create policy "Authenticated admin manages lookbook_entries"
  on public.lookbook_entries for all
  to authenticated
  using (true)
  with check (true);

-- Visitors can submit tailoring inquiries; only authenticated admins can read/update/delete them
drop policy if exists "Public can submit custom_inquiries" on public.custom_inquiries;
create policy "Public can submit custom_inquiries"
  on public.custom_inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated admin manages custom_inquiries" on public.custom_inquiries;
create policy "Authenticated admin manages custom_inquiries"
  on public.custom_inquiries for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admin updates custom_inquiries" on public.custom_inquiries;
create policy "Authenticated admin updates custom_inquiries"
  on public.custom_inquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin deletes custom_inquiries" on public.custom_inquiries;
create policy "Authenticated admin deletes custom_inquiries"
  on public.custom_inquiries for delete
  to authenticated
  using (true);

-- Storage bucket for garment & lookbook photos uploaded from /admin
insert into storage.buckets (id, name, public)
values ('showroom-media', 'showroom-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read showroom-media" on storage.objects;
create policy "Public read showroom-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'showroom-media');

drop policy if exists "Authenticated upload showroom-media" on storage.objects;
create policy "Authenticated upload showroom-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'showroom-media');

drop policy if exists "Authenticated update showroom-media" on storage.objects;
create policy "Authenticated update showroom-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'showroom-media');

drop policy if exists "Authenticated delete showroom-media" on storage.objects;
create policy "Authenticated delete showroom-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'showroom-media');

-- Seed default single-row settings (customize later from /admin)
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Seed initial starter catalogue (editable/deletable from /admin)
insert into public.products (slug, name, sku, category, fabric, occasion, price_inr, price_label, tailoring_days, is_customizable, same_design_available, featured, in_stock, sort_order, description, craft_notes, images, colors, fabric_options)
values
(
  'royal-navy-silk-saree',
  'Royal Navy Silk Saree',
  'VC-01',
  'Sarees & Drapes',
  'Kanjeevaram & Banarasi Silk',
  'Bridal & Reception',
  125000,
  'Handloom Zari',
  18,
  true,
  true,
  true,
  true,
  1,
  'Midnight royal-navy mulberry silk saree handwoven with antique gold kadhua floral motifs and tailored zari blouse.',
  'Custom fitted silk blouse · Real-gold toned zari selvedge · Hand-knotted tassels',
  array['/images/couture-navy-saree.jpg'],
  array['Royal Navy', 'Deep Indigo', 'Peacock Midnight', 'Maroon Noir'],
  array['Pure Katan Banarasi Silk', 'Kanjeevaram Korvai Silk', 'Organza-Silk Blend']
),
(
  'mustard-lehenga-choli',
  'Mustard Lehenga-Choli',
  'VC-02',
  'Bridal & Lehengas',
  'Handloom Raw Silk',
  'Haldi & Mehndi',
  39000,
  'Made to measure',
  16,
  true,
  true,
  true,
  true,
  2,
  'Saffron-mustard 16-kali raw silk lehenga paired with a deep forest emerald velvet choli and gold gota-patti organza dupatta.',
  'Hand-embroidered zardozi & gota · Can-can volume customizable · Zippered pocket included',
  array['/images/couture-mustard-lehenga.jpg'],
  array['Saffron & Emerald', 'Turmeric Gold & Ruby', 'Burnt Apricot & Sage'],
  array['Handloom Raw Silk', 'Chanderi Silk-Cotton', 'Silk Velvet Choli']
),
(
  'raw-silk-salwar-kameez',
  'Raw Silk Salwar Kameez',
  'VC-03',
  'Suit & Kurta Sets',
  'Handloom Raw Silk',
  'Festive & Reception',
  33000,
  'Custom tailored',
  14,
  true,
  true,
  true,
  true,
  3,
  'Cerulean peacock-teal pure raw silk straight kurta tailored with antique gold dabka neckline motifs, ankle trousers, and tissue dupatta.',
  'Full breathable malmal lining · Custom sleeve & neckline depth · Scalloped zari border',
  array['/images/couture-teal-anarkali.jpg'],
  array['Peacock Teal', 'Emerald Bottle Green', 'Rani Rose', 'Champagne'],
  array['Handloom Raw Silk', 'Tussar Matka Silk', 'Pure Muslin Silk']
),
(
  'antique-green-kurta-set',
  'Antique Green Kurta Set',
  'VC-04',
  'Suit & Kurta Sets',
  'Micro-Silk Velvet',
  'Sangeet & Evening',
  33000,
  'Made to measure',
  14,
  true,
  true,
  true,
  true,
  4,
  'Forest-emerald silk velvet kurta and cigarette trousers framed in heritage zardozi yoke embroidery with weightless organza dupatta.',
  'Pure silk-pile velvet · Breathable satin inner finish · Hand-finished hem borders',
  array['/images/couture-emerald-kurta.jpg'],
  array['Forest Emerald', 'Midnight Plum', 'Deep Sapphire', 'Burgundy'],
  array['Micro-Silk Velvet', 'Handloom Raw Silk', 'Heavy Silk Crepe']
),
(
  'antique-silk-kurta-set',
  'Antique Silk Anarkali',
  'VC-05',
  'Suit & Kurta Sets',
  'Tissue Zari Silk',
  'Engagement & Cocktail',
  17000,
  'Bespoke fit',
  12,
  true,
  true,
  true,
  true,
  5,
  'Heirloom champagne tissue silk 14-panel flared anarkali detailed with delicate tonal pearls, kasab border work, and scalloped veil.',
  'Zero-bulk kalidar waist · Custom flare & length · Concealed side closure',
  array['/images/couture-gold-kurta.jpg'],
  array['Antique Champagne', 'Warm Ivory', 'Rose Gold', 'Sage Pistachio'],
  array['Tissue Zari Silk', 'Chanderi Mashru', 'Pure Mulberry Silk']
),
(
  'bronze-olive-couture-drape',
  'Bronze Couture Saree-Gown',
  'VC-06',
  'Sarees & Drapes',
  'Crepe De Chine & Organza',
  'Cocktail Evening',
  42000,
  'Pre-draped cut',
  16,
  true,
  true,
  true,
  true,
  6,
  'Ready-to-wear shaded champagne-bronze to olive satin silk saree gown paired with an embellished corseted couture bodice.',
  'Zero pins needed · Bias-cut fluid pleats · Tailored bodice structure',
  array['/images/couture-drape.jpg'],
  array['Champagne Bronze / Olive', 'Wine / Antique Gold', 'Teal / Brass'],
  array['Silk Crepe de Chine', 'Pure Modal Satin', 'Tissue Organza']
),
(
  'ivory-raw-silk-bandhgala',
  'Ivory Raw-Silk Bandhgala',
  'VC-07',
  'Bespoke Menswear',
  'Handloom Raw Silk',
  'Festive & Reception',
  36000,
  'Made to measure',
  14,
  true,
  true,
  true,
  true,
  7,
  'Architectural stand-collar Jodhpur Bandhgala tailored in unbleached raw silk with antique hammered brass buttons and matched trousers.',
  'Hand-set mandarin collar · Floating canvas chest · Monogrammed lining',
  array['/images/bandhgala-ivory.jpg'],
  array['Heritage Ivory', 'Forest Emerald', 'Sandstone', 'Onyx Black'],
  array['Handloom Raw Silk', 'Textured Tussar Silk', 'Super 150s Wool']
),
(
  'midnight-satin-peak-tuxedo',
  'Midnight Peak-Lapel Tuxedo',
  'VC-08',
  'Bespoke Menswear',
  'Super 150s Italian Wool',
  'Black Tie & Reception',
  48500,
  'Full canvas',
  16,
  true,
  true,
  true,
  true,
  8,
  'Full-canvas evening tuxedo sculpted in deep charcoal Italian worsted wool with silk-satin peak lapels and custom posture balance.',
  'Horsehair chest canvas · Horn hardware · Hand-basted collar roll',
  array['/images/suit-charcoal.jpg'],
  array['Obsidian Charcoal', 'Emerald Noir', 'Midnight Navy'],
  array['Super 150s Italian Wool', 'Vitale Barberis Barathea', 'Silk-Velvet Blend']
)
on conflict (slug) do nothing;

-- Seed initial lookbook chapters if empty
insert into public.lookbook_entries (title, season, story, fabric_notes, image_url, sort_order)
select * from (
  values
    (
      'Chapter I · Royal Courtyard Bridal',
      'Heritage Bridal Edit',
      'Hand-crafted crimson micro-velvet panels embroidered in continuous Mughal palace arches and finished with custom dual-veil calligraphy.',
      'Micro-silk velvet · Antique dabka & zardozi · Sheer silk organza odhni',
      '/images/royal-bridal-arch.jpg',
      1
    ),
    (
      'Chapter II · Kanjeevaram Midnight',
      'Weavers Archive',
      'Loomed across three weeks in deep navy silk, framed with antique gold kadhua motifs and paired with a posture-tailored heirloom blouse.',
      'Pure mulberry silk · Tested zari border · Custom padded & darted choli',
      '/images/couture-navy-saree.jpg',
      2
    ),
    (
      'Chapter III · Saffron & Emerald',
      'Festive Mehndi Edit',
      'Sunlit saffron raw-silk kalis balanced against deep forest emerald velvet, built for effortless swirl and all-evening breathability.',
      '16-kali handloom silk · Gota & mirror trim · Silk velvet structured choli',
      '/images/couture-mustard-lehenga.jpg',
      3
    ),
    (
      'Chapter IV · Jodhpur & Savile Tailoring',
      'Groom & Evening Atelier',
      'Clean unbleached raw-silk Bandhgalas and full-canvas midnight jackets cut from individual kraft paper patterns inside our atelier.',
      'Handloom raw silk · Super 150s wool · Floating horsehair canvas',
      '/images/bandhgala-ivory.jpg',
      4
    )
) as seed(title, season, story, fabric_notes, image_url, sort_order)
where not exists (select 1 from public.lookbook_entries limit 1);
