"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignSettings } from "../types";
import { updateCampaignSettings } from "../actions";

type BrandingSettingsFormProps = {
  campaign: CampaignSettings;
};

export default function BrandingSettingsForm({
  campaign,
}: BrandingSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    primary_color: campaign.primary_color ?? "#0F172A",
    secondary_color: campaign.secondary_color ?? "#D4AF37",
    contrast_color: campaign.contrast_color ?? "#FFFFFF",
    background_color: campaign.background_color ?? "#FFFFFF",
    text_color: campaign.text_color ?? "#1E293B",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value.toUpperCase(),
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateCampaignSettings({
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        contrast_color: form.contrast_color,
        background_color: form.background_color,
        text_color: form.text_color,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  const colors = [
    {
      key: "primary_color" as const,
      label: "Cor principal",
      description: "Cabeçalho, botões e áreas de destaque.",
    },
    {
      key: "secondary_color" as const,
      label: "Cor secundária",
      description: "Detalhes, ícones e elementos complementares.",
    },
    {
      key: "contrast_color" as const,
      label: "Cor de contraste",
      description: "Textos e elementos sobre fundos escuros.",
    },
    {
      key: "background_color" as const,
      label: "Fundo da página",
      description: "Cor geral de fundo da Landing Page.",
    },
    {
      key: "text_color" as const,
      label: "Cor dos textos",
      description: "Textos principais da página.",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">
          Identidade visual
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure as principais cores utilizadas na Landing Page.
        </p>
      </div>

      <div className="space-y-5 p-6">
        <div
          className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-5"
          style={{
            backgroundColor: form.background_color,
          }}
        >
          <div
            className="flex h-20 items-center justify-center rounded-xl px-3 text-center text-xs font-medium"
            style={{
              backgroundColor: form.primary_color,
              color: form.contrast_color,
            }}
          >
            Principal
          </div>

          <div
            className="flex h-20 items-center justify-center rounded-xl px-3 text-center text-xs font-medium"
            style={{
              backgroundColor: form.secondary_color,
              color: form.primary_color,
            }}
          >
            Secundária
          </div>

          <div
            className="flex h-20 items-center justify-center rounded-xl border border-slate-200 px-3 text-center text-xs font-medium"
            style={{
              backgroundColor: form.contrast_color,
              color: form.text_color,
            }}
          >
            Contraste
          </div>

          <div
            className="flex h-20 items-center justify-center rounded-xl border border-slate-200 px-3 text-center text-xs font-medium"
            style={{
              backgroundColor: form.background_color,
              color: form.text_color,
            }}
          >
            Fundo
          </div>

          <div
            className="flex h-20 items-center justify-center rounded-xl border border-slate-200 px-3 text-center text-xs font-medium"
            style={{
              backgroundColor: form.background_color,
              color: form.text_color,
            }}
          >
            Texto
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {colors.map((color) => (
            <div
              key={color.key}
              className="space-y-2"
            >
              <div>
                <label
                  htmlFor={color.key}
                  className="text-sm font-medium text-slate-700"
                >
                  {color.label}
                </label>

                <p className="mt-0.5 text-xs text-slate-500">
                  {color.description}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={form[color.key]}
                  onChange={(event) =>
                    updateField(
                      color.key,
                      event.target.value
                    )
                  }
                  className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                  aria-label={`Selecionar ${color.label.toLowerCase()}`}
                />

                <input
                  id={color.key}
                  type="text"
                  value={form[color.key]}
                  onChange={(event) =>
                    updateField(
                      color.key,
                      event.target.value
                    )
                  }
                  maxLength={7}
                  placeholder="#000000"
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : "Salvar identidade visual"}
        </button>
      </div>
    </form>
  );
}