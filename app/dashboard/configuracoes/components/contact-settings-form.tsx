"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignSettings } from "../types";
import { updateCampaignSettings } from "../actions";

type ContactSettingsFormProps = {
  campaign: CampaignSettings;
};

export default function ContactSettingsForm({
  campaign,
}: ContactSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    whatsapp: campaign.whatsapp ?? "",
    email: campaign.email ?? "",
    instagram_url: campaign.instagram_url ?? "",
    facebook_url: campaign.facebook_url ?? "",
    youtube_url: campaign.youtube_url ?? "",
    tiktok_url: campaign.tiktok_url ?? "",
    x_url: campaign.x_url ?? "",
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
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        instagram_url:
          form.instagram_url.trim() || null,
        facebook_url:
          form.facebook_url.trim() || null,
        youtube_url:
          form.youtube_url.trim() || null,
        tiktok_url:
          form.tiktok_url.trim() || null,
        x_url: form.x_url.trim() || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

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
          Contatos e redes sociais
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure os canais oficiais que serão utilizados na Landing Page.
          Campos em branco não serão exibidos.
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="whatsapp"
            className="text-sm font-medium text-slate-700"
          >
            WhatsApp
          </label>

          <input
            id="whatsapp"
            type="text"
            inputMode="tel"
            value={form.whatsapp}
            onChange={(event) =>
              updateField(
                "whatsapp",
                event.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder="Ex.: 5554999999999"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <p className="text-xs text-slate-500">
            Informe somente números, incluindo país e DDD.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-700"
          >
            E-mail
          </label>

          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            placeholder="contato@campanha.com.br"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="instagram_url"
            className="text-sm font-medium text-slate-700"
          >
            Instagram
          </label>

          <input
            id="instagram_url"
            type="url"
            value={form.instagram_url}
            onChange={(event) =>
              updateField(
                "instagram_url",
                event.target.value
              )
            }
            placeholder="https://instagram.com/candidato"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="facebook_url"
            className="text-sm font-medium text-slate-700"
          >
            Facebook
          </label>

          <input
            id="facebook_url"
            type="url"
            value={form.facebook_url}
            onChange={(event) =>
              updateField(
                "facebook_url",
                event.target.value
              )
            }
            placeholder="https://facebook.com/candidato"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="youtube_url"
            className="text-sm font-medium text-slate-700"
          >
            YouTube
          </label>

          <input
            id="youtube_url"
            type="url"
            value={form.youtube_url}
            onChange={(event) =>
              updateField(
                "youtube_url",
                event.target.value
              )
            }
            placeholder="https://youtube.com/@candidato"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tiktok_url"
            className="text-sm font-medium text-slate-700"
          >
            TikTok
          </label>

          <input
            id="tiktok_url"
            type="url"
            value={form.tiktok_url}
            onChange={(event) =>
              updateField(
                "tiktok_url",
                event.target.value
              )
            }
            placeholder="https://tiktok.com/@candidato"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="x_url"
            className="text-sm font-medium text-slate-700"
          >
            X
          </label>

          <input
            id="x_url"
            type="url"
            value={form.x_url}
            onChange={(event) =>
              updateField(
                "x_url",
                event.target.value
              )
            }
            placeholder="https://x.com/candidato"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
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
            : "Salvar contatos"}
        </button>
      </div>
    </form>
  );
}