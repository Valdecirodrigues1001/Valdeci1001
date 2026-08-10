"use client";

import { useEffect, useRef, useState } from "react";

type EventStatusFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  status: string;
};

export function EventStatusForm({
  action,
  status,
}: EventStatusFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedStatus, setSelectedStatus] =
    useState(status);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  return (
    <form ref={formRef} action={action}>
      <select
        name="status"
        value={selectedStatus}
        onChange={(event) => {
          setSelectedStatus(event.target.value);

          window.setTimeout(() => {
            formRef.current?.requestSubmit();
          }, 0);
        }}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#081B33]"
      >
        <option value="scheduled">Agendado</option>
        <option value="confirmed">Confirmado</option>
        <option value="completed">Concluído</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </form>
  );
}