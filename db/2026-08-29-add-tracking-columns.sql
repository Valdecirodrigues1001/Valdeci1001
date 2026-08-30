-- Colunas de rastreamento / pixels para tráfego pago.
-- Aplicar no Supabase (SQL Editor) antes de usar a aba
-- "Rastreamento e pixels" em Configurações.

alter table public.campaign_landing_pages
  add column if not exists meta_pixel_id text,
  add column if not exists ga4_measurement_id text,
  add column if not exists google_ads_tag_id text,
  add column if not exists google_ads_conversion_label text;
