"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignSettings } from "../types";
import { updateCampaignSettings } from "../actions";

type CampaignSettingsFormProps = {
  campaign: CampaignSettings;
};

export default function CampaignSettingsForm({
  campaign,
}: CampaignSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    public_name: campaign.public_name ?? "",
    political_position: campaign.political_position ?? "",
    campaign_number: campaign.campaign_number ?? "",
    political_party: campaign.political_party ?? "",
    city: campaign.city ?? "",
    state: campaign.state ?? "",
    slogan: campaign.slogan ?? "",
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
        public_name: form.public_name.trim(),
        political_position:
          form.political_position.trim() || null,
        campaign_number:
          form.campaign_number.trim() || null,
        political_party:
          form.political_party.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        slogan: form.slogan.trim() || null,
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
          Informações da campanha
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure os principais dados de identificação da campanha.
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="public_name"
            className="text-sm font-medium text-slate-700"
          >
            Nome público
          </label>

          <input
            id="public_name"
            type="text"
            value={form.public_name}
            onChange={(event) =>
              updateField(
                "public_name",
                event.target.value
              )
            }
            placeholder="Ex.: Valdeci Rodrigues"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="political_position"
            className="text-sm font-medium text-slate-700"
          >
            Cargo
          </label>

          <input
            id="political_position"
            type="text"
            value={form.political_position}
            onChange={(event) =>
              updateField(
                "political_position",
                event.target.value
              )
            }
            placeholder="Ex.: Deputado Federal"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="campaign_number"
            className="text-sm font-medium text-slate-700"
          >
            Número da campanha
          </label>

          <input
            id="campaign_number"
            type="text"
            inputMode="numeric"
            value={form.campaign_number}
            onChange={(event) =>
              updateField(
                "campaign_number",
                event.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder="Ex.: 1001"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="political_party"
            className="text-sm font-medium text-slate-700"
          >
            Partido
          </label>

          <input
            id="political_party"
            type="text"
            value={form.political_party}
            onChange={(event) =>
              updateField(
                "political_party",
                event.target.value
              )
            }
            placeholder="Ex.: Republicanos"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="city"
            className="text-sm font-medium text-slate-700"
          >
            Cidade
          </label>

          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            placeholder="Ex.: Porto Alegre"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="state"
            className="text-sm font-medium text-slate-700"
          >
            Estado
          </label>

          <input
            id="state"
            type="text"
            maxLength={2}
            value={form.state}
            onChange={(event) =>
              updateField(
                "state",
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 2)
              )
            }
            placeholder="Ex.: RS"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="slogan"
            className="text-sm font-medium text-slate-700"
          >
            Slogan
          </label>

          <input
            id="slogan"
            type="text"
            value={form.slogan}
            onChange={(event) =>
              updateField(
                "slogan",
                event.target.value
              )
            }
            placeholder="Ex.: Representando quem faz o Rio Grande acontecer."
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
            : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}