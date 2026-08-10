"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  LockKeyhole,
} from "lucide-react";

type LandingUrlCardProps = {
  slug: string;
  customDomain: string | null;
  isPublished: boolean;
};

export default function LandingUrlCard({
  slug,
  customDomain,
  isPublished,
}: LandingUrlCardProps) {
  const [copied, setCopied] = useState(false);

  const relativeUrl = `/c/${slug}`;

  const displayUrl = customDomain
    ? customDomain.replace(/^https?:\/\//, "")
    : relativeUrl;

  async function copyUrl() {
    const url =
      typeof window !== "undefined"
        ? customDomain
          ? `https://${displayUrl}`
          : `${window.location.origin}${relativeUrl}`
        : relativeUrl;

    await navigator.clipboard.writeText(url);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Endereço público
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-slate-400" />

            <h2 className="text-xl font-black text-slate-950">
              Link da campanha
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Compartilhe este endereço com os eleitores.
          </p>
        </div>

        {!isPublished && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            <LockKeyhole className="h-3.5 w-3.5" />
            Disponível após publicar
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="min-w-0 flex-1 truncate px-4 py-3 text-sm font-semibold text-slate-700">
            {displayUrl}
          </div>

          <button
            type="button"
            onClick={copyUrl}
            className="flex h-11 w-12 shrink-0 items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-white hover:text-slate-950"
            title="Copiar endereço"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <a
          href={relativeUrl}
          target="_blank"
          rel="noreferrer"
          className={`flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition ${
            isPublished
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "pointer-events-none bg-slate-100 text-slate-400"
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          Visualizar
        </a>
      </div>
    </div>
  );
}