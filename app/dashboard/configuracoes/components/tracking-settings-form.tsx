"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignSettings } from "../types";
import { updateCampaignSettings } from "../actions";

type TrackingSettingsFormProps = {
  campaign: CampaignSettings;
  captureUrl: string;
};

export default function TrackingSettingsForm({
  campaign,
  captureUrl,
}: TrackingSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    meta_pixel_id: campaign.meta_pixel_id ?? "",
    ga4_measurement_id:
      campaign.ga4_measurement_id ?? "",
    google_ads_tag_id:
      campaign.google_ads_tag_id ?? "",
    google_ads_conversion_label:
      campaign.google_ads_conversion_label ?? "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateCampaignSettings({
        meta_pixel_id:
          form.meta_pixel_id.trim() || null,
        ga4_measurement_id:
          form.ga4_measurement_id.trim() || null,
        google_ads_tag_id:
          form.google_ads_tag_id.trim() || null,
        google_ads_conversion_label:
          form.google_ads_conversion_label.trim() ||
          null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  const inputClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">
          Rastreamento e pixels
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Para campanhas de tráfego pago. Os pixels são
          carregados na página de captação e a conversão
          é registrada quando o eleitor conclui o
          cadastro.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Página de captação
          </p>

          <p className="mt-2 break-all text-sm text-slate-700">
            {captureUrl}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use este endereço como destino dos anúncios.
            Ele fica fora do índice de busca e direciona
            o eleitor ao grupo da região pelo DDD.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="meta_pixel_id"
            className="text-sm font-medium text-slate-700"
          >
            ID do Meta Pixel (Facebook / Instagram)
          </label>

          <input
            id="meta_pixel_id"
            type="text"
            inputMode="numeric"
            value={form.meta_pixel_id}
            onChange={(event) =>
              updateField(
                "meta_pixel_id",
                event.target.value
              )
            }
            placeholder="1234567890123456"
            className={inputClassName}
          />

          <p className="text-xs text-slate-500">
            Gerenciador de Eventos da Meta → Fontes de
            dados. Dispara o evento{" "}
            <strong>Lead</strong> na conversão.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="ga4_measurement_id"
            className="text-sm font-medium text-slate-700"
          >
            ID de métrica do Google Analytics 4
          </label>

          <input
            id="ga4_measurement_id"
            type="text"
            value={form.ga4_measurement_id}
            onChange={(event) =>
              updateField(
                "ga4_measurement_id",
                event.target.value
              )
            }
            placeholder="G-XXXXXXXXXX"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="google_ads_tag_id"
              className="text-sm font-medium text-slate-700"
            >
              ID da tag do Google Ads
            </label>

            <input
              id="google_ads_tag_id"
              type="text"
              value={form.google_ads_tag_id}
              onChange={(event) =>
                updateField(
                  "google_ads_tag_id",
                  event.target.value
                )
              }
              placeholder="AW-XXXXXXXXX"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="google_ads_conversion_label"
              className="text-sm font-medium text-slate-700"
            >
              Rótulo da conversão do Google Ads
            </label>

            <input
              id="google_ads_conversion_label"
              type="text"
              value={
                form.google_ads_conversion_label
              }
              onChange={(event) =>
                updateField(
                  "google_ads_conversion_label",
                  event.target.value
                )
              }
              placeholder="AbC-D_efG-h12_34-567"
              className={inputClassName}
            />
          </div>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          O rótulo só é necessário para registrar a
          conversão no Google Ads. Ele aparece junto ao
          ID da tag ao criar a ação de conversão.
        </p>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : "Salvar rastreamento"}
        </button>
      </div>
    </form>
  );
}
