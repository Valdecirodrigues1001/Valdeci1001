"use client";

import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Users,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

import {
  updateLandingContactAndSocial,
  type LandingPageActionState,
} from "../actions";

const initialState: LandingPageActionState = {
  success: false,
  message: "",
};

type SocialFormProps = {
  landingPage: {
    whatsapp: string | null;
    email: string | null;
    community_group_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    x_url: string | null;
  };
};

type SocialInputProps = {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  defaultValue?: string | null;
  icon: React.ReactNode;
  type?: "text" | "email" | "url" | "tel";
};

function SocialInput({
  name,
  label,
  description,
  placeholder,
  defaultValue,
  icon,
  type = "url",
}: SocialInputProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <label
            htmlFor={name}
            className="text-sm font-bold text-slate-800"
          >
            {label}
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

          <input
            id={name}
            name={name}
            type={type}
            defaultValue={defaultValue || ""}
            placeholder={placeholder}
            className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>
      </div>
    </div>
  );
}

export default function SocialForm({
  landingPage,
}: SocialFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateLandingContactAndSocial,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
            <MessageCircle className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Comunicação pública
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Contatos, comunidade e redes sociais
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
          Informe os canais oficiais da campanha. Os campos
          deixados em branco não serão exibidos na Landing Page.
        </p>
      </div>

      <div className="grid gap-4 p-6 sm:p-8 lg:grid-cols-2">
        <SocialInput
          name="whatsapp"
          label="WhatsApp"
          description="Número oficial para contato com a campanha."
          placeholder="5554999999999"
          defaultValue={landingPage.whatsapp}
          icon={<MessageCircle className="h-5 w-5" />}
          type="tel"
        />

        <SocialInput
          name="email"
          label="E-mail"
          description="E-mail público e oficial da campanha."
          placeholder="contato@campanha.com.br"
          defaultValue={landingPage.email}
          icon={<Mail className="h-5 w-5" />}
          type="email"
        />

        <div className="lg:col-span-2">
          <SocialInput
            name="community_group_url"
            label="Grupo da campanha"
            description="Link do grupo oficial no WhatsApp. O convite será exibido após o apoiador preencher o formulário."
            placeholder="https://chat.whatsapp.com/..."
            defaultValue={landingPage.community_group_url}
            icon={<Users className="h-5 w-5" />}
            type="url"
          />
        </div>

        <SocialInput
          name="instagram_url"
          label="Instagram"
          description="Link completo do perfil oficial."
          placeholder="https://instagram.com/candidato"
          defaultValue={landingPage.instagram_url}
          icon={<FaInstagram className="h-5 w-5" />}
        />

        <SocialInput
          name="facebook_url"
          label="Facebook"
          description="Link completo da página oficial."
          placeholder="https://facebook.com/candidato"
          defaultValue={landingPage.facebook_url}
          icon={<FaFacebook className="h-5 w-5" />}
        />

        <SocialInput
          name="youtube_url"
          label="YouTube"
          description="Link do canal oficial da campanha."
          placeholder="https://youtube.com/@candidato"
          defaultValue={landingPage.youtube_url}
          icon={<FaYoutube className="h-5 w-5" />}
        />

        <SocialInput
          name="tiktok_url"
          label="TikTok"
          description="Link completo do perfil no TikTok."
          placeholder="https://tiktok.com/@candidato"
          defaultValue={landingPage.tiktok_url}
          icon={<FaTiktok className="h-5 w-5" />}
        />

        <div className="lg:col-span-2">
          <SocialInput
            name="x_url"
            label="X"
            description="Link completo do perfil no X."
            placeholder="https://x.com/candidato"
            defaultValue={landingPage.x_url}
            icon={<FaXTwitter className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 sm:px-8">
        {state.message && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar contatos
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}