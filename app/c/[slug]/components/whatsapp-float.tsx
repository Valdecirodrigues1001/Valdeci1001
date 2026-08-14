import { MessageCircle } from "lucide-react";

import type { LandingData } from "../types";

type WhatsAppFloatProps = {
  landing: LandingData;
};

function normalizeWhatsApp(
  value: string
): string {
  return value.replace(/\D/g, "");
}

export default function WhatsAppFloat({
  landing,
}: WhatsAppFloatProps) {
  if (!landing.whatsapp) {
    return null;
  }

  const message = encodeURIComponent(
    `Olá! Quero acompanhar a campanha de ${landing.public_name} e autorizo o recebimento de informações, novidades e comunicações da campanha pelo WhatsApp.`
  );

  const whatsappUrl =
    `https://wa.me/${normalizeWhatsApp(
      landing.whatsapp
    )}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a campanha pelo WhatsApp"
      title="Falar com a campanha"
      className="fixed bottom-6 right-6 z-[90] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-[#20BD5A]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25"
      />

      <MessageCircle className="relative z-10 h-7 w-7" />
    </a>
  );
}