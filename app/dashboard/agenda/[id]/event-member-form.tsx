"use client";

import { useRef } from "react";
import { UserPlus } from "lucide-react";

type TeamMember = {
  user_id: string;
  full_name: string;
};

type EventMemberFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  members: TeamMember[];
};

export function EventMemberForm({
  action,
  members,
}: EventMemberFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <select
        name="user_id"
        required
        defaultValue=""
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
      >
        <option value="" disabled>
          Selecione um integrante
        </option>

        {members.map((member) => (
          <option
            key={member.user_id}
            value={member.user_id}
          >
            {member.full_name}
          </option>
        ))}
      </select>

      {members.length === 0 ? (
        <p className="text-sm leading-6 text-slate-400">
          Todos os integrantes disponíveis já estão
          vinculados.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={members.length === 0}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B33] px-5 font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus size={18} />
        Adicionar participante
      </button>
    </form>
  );
}