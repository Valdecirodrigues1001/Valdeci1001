"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignSettings } from "../types";
import { updateCampaignSettings } from "../actions";

type SeoSettingsFormProps = {
  campaign: CampaignSettings;
};

export default function SeoSettingsForm({
  campaign,
}: SeoSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    custom_domain: campaign.custom_domain ?? "",
    seo_title: campaign.seo_title ?? "",
    seo_description: campaign.seo_description ?? "",
    seo_keywords: campaign.seo_keywords ?? "",
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

  function sanitizeDomain(value: string) {
    return value
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/g, "")
      .toLowerCase();
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateCampaignSettings({
        custom_domain:
          sanitizeDomain(form.custom_domain) || null,
        seo_title: form.seo_title.trim() || null,
        seo_description:
          form.seo_description.trim() || null,
        seo_keywords:
          form.seo_keywords.trim() || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setForm((current) => ({
        ...current,
        custom_domain: sanitizeDomain(
          current.custom_domain
        ),
      }));

      toast.success(result.message);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">
          SEO e domínio
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure como a Landing Page será apresentada
          no Google, WhatsApp e outras plataformas.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <label
            htmlFor="custom_domain"
            className="text-sm font-medium text-slate-700"
          >
            Domínio personalizado
          </label>

          <input
            id="custom_domain"
            type="text"
            value={form.custom_domain}
            onChange={(event) =>
              updateField(
                "custom_domain",
                event.target.value
              )
            }
            placeholder="valdecirodrigues.com.br"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <p className="text-xs text-slate-500">
            Informe somente o domínio, sem https:// e
            sem barras.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="seo_title"
              className="text-sm font-medium text-slate-700"
            >
              Título SEO
            </label>

            <span
              className={`text-xs ${
                form.seo_title.length > 60
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {form.seo_title.length}/60
            </span>
          </div>

          <input
            id="seo_title"
            type="text"
            value={form.seo_title}
            onChange={(event) =>
              updateField(
                "seo_title",
                event.target.value
              )
            }
            placeholder="Valdeci Rodrigues | Site oficial"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <p className="text-xs text-slate-500">
            Recomendação: até 60 caracteres.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="seo_description"
              className="text-sm font-medium text-slate-700"
            >
              Descrição SEO
            </label>

            <span
              className={`text-xs ${
                form.seo_description.length > 160
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {form.seo_description.length}/160
            </span>
          </div>

          <textarea
            id="seo_description"
            rows={4}
            value={form.seo_description}
            onChange={(event) =>
              updateField(
                "seo_description",
                event.target.value
              )
            }
            placeholder="Conheça a trajetória, as propostas e as notícias da campanha."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <p className="text-xs text-slate-500">
            Recomendação: até 160 caracteres.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="seo_keywords"
            className="text-sm font-medium text-slate-700"
          >
            Palavras-chave
          </label>

          <textarea
            id="seo_keywords"
            rows={3}
            value={form.seo_keywords}
            onChange={(event) =>
              updateField(
                "seo_keywords",
                event.target.value
              )
            }
            placeholder="candidato, deputado federal, propostas, campanha"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <p className="text-xs text-slate-500">
            Separe cada expressão por vírgula.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Prévia no Google
          </p>

          <div className="mt-4 max-w-2xl">
            <p className="truncate text-sm text-emerald-700">
              {form.custom_domain
                ? `https://${sanitizeDomain(
                    form.custom_domain
                  )}`
                : "https://seudominio.com.br"}
            </p>

            <p className="mt-1 text-xl text-blue-700">
              {form.seo_title ||
                campaign.public_name ||
                "Site oficial da campanha"}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {form.seo_description ||
                "A descrição da Landing Page aparecerá aqui."}
            </p>
          </div>
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
            : "Salvar SEO e domínio"}
        </button>
      </div>
    </form>
  );
}