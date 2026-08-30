"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import type { RegionalGroup } from "../types";
import {
  deleteRegionalGroup,
  saveRegionalGroup,
} from "../actions";

type RegionalGroupsFormProps = {
  groups: RegionalGroup[];
};

const EMPTY_FORM = {
  id: null as string | null,
  name: "",
  ddd: "",
  whatsapp_group_url: "",
};

export default function RegionalGroupsForm({
  groups,
}: RegionalGroupsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditing = form.id !== null;

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(group: RegionalGroup) {
    setForm({
      id: group.id,
      name: group.name,
      ddd: group.ddd ?? "",
      whatsapp_group_url:
        group.whatsapp_group_url ?? "",
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveRegionalGroup({
        id: form.id,
        name: form.name,
        ddd: form.ddd,
        whatsapp_group_url: form.whatsapp_group_url,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
    });
  }

  function handleDelete(group: RegionalGroup) {
    if (
      !window.confirm(
        `Remover o grupo de "${group.name}"?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRegionalGroup(
        group.id
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      if (form.id === group.id) {
        resetForm();
      }
    });
  }

  const inputClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">
          Grupos de WhatsApp por região
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ao se cadastrar pelo site, o eleitor é
          direcionado ao grupo da sua região pelo DDD
          do WhatsApp informado.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {groups.length > 0 ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {groups.map((group) => (
              <li
                key={group.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-900 px-1.5 text-xs font-bold text-white">
                      {group.ddd}
                    </span>

                    <span className="truncate text-sm font-medium text-slate-900">
                      {group.name}
                    </span>
                  </div>

                  {group.whatsapp_group_url ? (
                    <a
                      href={group.whatsapp_group_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-emerald-700 hover:underline"
                    >
                      {group.whatsapp_group_url}
                    </a>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(group)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(group)}
                    disabled={isPending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Nenhum grupo cadastrado. Adicione o primeiro
            abaixo.
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {isEditing
                ? "Editar grupo"
                : "Adicionar grupo"}
            </h3>

            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_100px]">
            <div className="space-y-1.5">
              <label
                htmlFor="region_name"
                className="text-xs font-medium text-slate-600"
              >
                Nome da região
              </label>

              <input
                id="region_name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Ex.: Zona Sul"
                className={inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="region_ddd"
                className="text-xs font-medium text-slate-600"
              >
                DDD
              </label>

              <input
                id="region_ddd"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={form.ddd}
                onChange={(event) =>
                  updateField(
                    "ddd",
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="51"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <label
              htmlFor="region_url"
              className="text-xs font-medium text-slate-600"
            >
              Link do grupo no WhatsApp
            </label>

            <input
              id="region_url"
              type="url"
              value={form.whatsapp_group_url}
              onChange={(event) =>
                updateField(
                  "whatsapp_group_url",
                  event.target.value
                )
              }
              placeholder="https://chat.whatsapp.com/..."
              className={inputClassName}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? null : (
                <Plus className="h-4 w-4" />
              )}
              {isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Adicionar grupo"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
