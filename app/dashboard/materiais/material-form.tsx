"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  createMaterial,
  type MaterialActionState,
} from "./actions";

const initialState: MaterialActionState = {
  success: false,
  message: "",
};

const categoryGroups = [
  {
    label: "Redes sociais",
    options: [
      {
        value: "instagram_post",
        label: "Post para Instagram",
      },
      {
        value: "instagram_story",
        label: "Story",
      },
      {
        value: "facebook_post",
        label: "Post para Facebook",
      },
      {
        value: "whatsapp",
        label: "Material para WhatsApp",
      },
    ],
  },
  {
    label: "Materiais físicos",
    options: [
      {
        value: "santinho",
        label: "Santinho",
      },
      {
        value: "adesivo",
        label: "Adesivo",
      },
      {
        value: "banner",
        label: "Banner",
      },
      {
        value: "faixa",
        label: "Faixa",
      },
      {
        value: "cartaz",
        label: "Cartaz",
      },
      {
        value: "flyer",
        label: "Flyer",
      },
      {
        value: "panfleto",
        label: "Panfleto",
      },
    ],
  },
  {
    label: "Outros",
    options: [
      {
        value: "other",
        label: "Outro",
      },
    ],
  },
];

const statusOptions = [
  {
    value: "pending",
    label: "Em aprovação",
  },
  {
    value: "approved",
    label: "Aprovado",
  },
  {
    value: "archived",
    label: "Arquivado",
  },
];

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    createMaterial,
    initialState
  );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [state.success]);

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
  }

  function removeFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Adicionar material
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Cadastre uma arte para redes sociais ou um material
          físico da campanha.
        </p>
      </div>

      {state.message ? (
        <div
          className={[
            "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <X className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="material-name"
          className="text-sm font-medium text-slate-700"
        >
          Nome do material
        </label>

        <input
          id="material-name"
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder="Ex.: Arte da caminhada no Centro"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="material-description"
          className="text-sm font-medium text-slate-700"
        >
          Descrição
        </label>

        <textarea
          id="material-description"
          name="description"
          rows={4}
          maxLength={500}
          placeholder="Inclua orientações de uso, campanha ou observações importantes."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="material-category"
            className="text-sm font-medium text-slate-700"
          >
            Categoria
          </label>

          <select
            id="material-category"
            name="category"
            required
            defaultValue=""
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>

            {categoryGroups.map((group) => (
              <optgroup
                key={group.label}
                label={group.label}
              >
                {group.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="material-status"
            className="text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="material-status"
            name="status"
            defaultValue="approved"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100/70">
        <input
          type="checkbox"
          name="is_official"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
        />

        <span>
          <span className="block text-sm font-medium text-slate-800">
            Marcar como material oficial
          </span>

          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Materiais oficiais poderão receber destaque na
            biblioteca.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">
          Arquivo
        </span>

        <label
          htmlFor="material-file"
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
  event.preventDefault();
  setIsDragging(false);

  const file = event.dataTransfer.files[0];

  if (!file) {
    return;
  }

  handleFile(file);

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  if (fileInputRef.current) {
    fileInputRef.current.files = dataTransfer.files;
  }
}}
          className={[
            "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
            isDragging
              ? "border-slate-950 bg-slate-100"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/70",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            id="material-file"
            name="file"
            type="file"
            required
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(event) =>
              handleFile(event.target.files?.[0])
            }
          />

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <UploadCloud className="h-6 w-6 text-slate-700" />
          </span>

          <span className="mt-4 text-sm font-semibold text-slate-800">
            Arraste um arquivo ou clique para selecionar
          </span>

          <span className="mt-2 text-xs leading-5 text-slate-500">
            JPG, PNG, WEBP ou PDF. Tamanho máximo de 15 MB.
          </span>
        </label>
      </div>

      {selectedFile ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            {selectedFile.type === "application/pdf" ? (
              <FileText className="h-5 w-5 text-slate-700" />
            ) : (
              <FileImage className="h-5 w-5 text-slate-700" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={removeFile}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Remover arquivo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando material...
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            Cadastrar material
          </>
        )}
      </button>
    </form>
  );
}