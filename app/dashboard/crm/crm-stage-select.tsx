"use client";

import { useState, useTransition } from "react";
import {
  updateSupporterCrmStage,
  type CrmStage,
} from "./actions";

type CrmStageSelectProps = {
  supporterId: string;
  currentStage: CrmStage;
};

const stageOptions: {
  value: CrmStage;
  label: string;
}[] = [
  {
    value: "new",
    label: "Novo contato",
  },
  {
    value: "contact",
    label: "Primeiro contato",
  },
  {
    value: "negotiation",
    label: "Em acompanhamento",
  },
  {
    value: "confirmed",
    label: "Apoio confirmado",
  },
  {
    value: "volunteer",
    label: "Voluntário",
  },
  {
    value: "leader",
    label: "Liderança",
  },
];

export function CrmStageSelect({
  supporterId,
  currentStage,
}: CrmStageSelectProps) {
  const [stage, setStage] =
    useState<CrmStage>(currentStage);

  const [pending, startTransition] =
    useTransition();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newStage =
      event.target.value as CrmStage;

    const previousStage = stage;

    setStage(newStage);

    startTransition(async () => {
      const result =
        await updateSupporterCrmStage(
          supporterId,
          newStage
        );

      if (!result.success) {
        setStage(previousStage);
        alert(
          result.error ??
            "Não foi possível alterar a etapa."
        );
      }
    });
  }

  return (
  <div
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
    }}
    onMouseDown={(event) => {
      event.stopPropagation();
    }}
  >
    <select
      value={stage}
      onChange={handleChange}
      disabled={pending}
      className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#081B33] outline-none transition focus:border-[#081B33] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {stageOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
}