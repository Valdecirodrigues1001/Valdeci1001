"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  EyeOff,
  Globe2,
  Loader2,
} from "lucide-react";

import { toggleLandingPublication } from "../actions";

type PublishButtonProps = {
  isPublished: boolean;
};

export default function PublishButton({
  isPublished,
}: PublishButtonProps) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleTogglePublication() {
    setMessage("");

    startTransition(async () => {
      const result = await toggleLandingPublication();

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleTogglePublication}
        disabled={pending}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isPublished
            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : isPublished ? (
          <>
            <EyeOff className="h-4 w-4" />
            Retirar do ar
          </>
        ) : (
          <>
            <Globe2 className="h-4 w-4" />
            Publicar página
          </>
        )}
      </button>

      {message && (
        <p
          className={`mt-3 text-center text-xs font-semibold ${
            success ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}