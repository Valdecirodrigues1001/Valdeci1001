import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLocationDot,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import type { LandingData } from "../types";

type FooterProps = {
  landing: LandingData;
};

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, "");
}

function getSocialUrl(
  directUrl: string | null,
  socialUrl?: string | null
) {
  return directUrl || socialUrl || null;
}

export default function Footer({
  landing,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = landing.whatsapp
    ? `https://wa.me/${normalizeWhatsApp(landing.whatsapp)}`
    : null;

  const instagramUrl = getSocialUrl(
    landing.instagram_url,
    landing.socials?.instagram
  );

  const facebookUrl = getSocialUrl(
    landing.facebook_url,
    landing.socials?.facebook
  );

  const youtubeUrl = getSocialUrl(
    landing.youtube_url,
    landing.socials?.youtube
  );

  const tiktokUrl = landing.tiktok_url;

  const xUrl = landing.x_url;

  const linkedinUrl = landing.socials?.linkedin || null;

  const hasSocialLinks =
    landing.show_social_links &&
    Boolean(
      instagramUrl ||
        facebookUrl ||
        youtubeUrl ||
        tiktokUrl ||
        xUrl ||
        linkedinUrl
    );

  const hasContactInformation = Boolean(
    landing.whatsapp ||
      landing.email ||
      landing.city ||
      landing.state
  );

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        backgroundColor: "#0F172A",
        color: "#FFFFFF",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(
            circle at top right,
            ${landing.secondary_color} 0%,
            transparent 55%
          )`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-40 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: `${landing.secondary_color}14`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h3 className="text-3xl font-black tracking-tight">
              {landing.public_name}
            </h3>

            {landing.hero_subtitle && (
              <p className="mt-4 max-w-md text-base leading-8 text-white/70">
                {landing.hero_subtitle}
              </p>
            )}

            {hasSocialLinks && (
              <div className="mt-8 flex flex-wrap gap-3">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <FaInstagram className="h-5 w-5" />
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <FaFacebookF className="h-5 w-5" />
                  </a>
                )}

                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <FaYoutube className="h-5 w-5" />
                  </a>
                )}

                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <FaTiktok className="h-5 w-5" />
                  </a>
                )}

                {xUrl && (
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <FaXTwitter className="h-5 w-5" />
                  </a>
                )}

                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <span className="text-sm font-black">in</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4
              className="text-lg font-black"
              style={{
                color: landing.secondary_color,
              }}
            >
              Contato
            </h4>

            {hasContactInformation ? (
              <div className="mt-6 space-y-5">
                {landing.whatsapp && whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/80 transition hover:text-white"
                  >
                    <FaWhatsapp
                      className="h-5 w-5 shrink-0"
                      style={{
                        color: landing.secondary_color,
                      }}
                    />

                    <span>{landing.whatsapp}</span>
                  </a>
                )}

                {landing.email && (
                  <a
                    href={`mailto:${landing.email}`}
                    className="flex items-center gap-3 break-all text-white/80 transition hover:text-white"
                  >
                    <FaEnvelope
                      className="h-5 w-5 shrink-0"
                      style={{
                        color: landing.secondary_color,
                      }}
                    />

                    <span>{landing.email}</span>
                  </a>
                )}

                {(landing.city || landing.state) && (
                  <div className="flex items-center gap-3 text-white/80">
                    <FaLocationDot
                      className="h-5 w-5 shrink-0"
                      style={{
                        color: landing.secondary_color,
                      }}
                    />

                    <span>
                      {[landing.city, landing.state]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-white/60">
                Os canais oficiais de contato serão disponibilizados em breve.
              </p>
            )}
          </div>

          <div>
            <h4
              className="text-lg font-black"
              style={{
                color: landing.secondary_color,
              }}
            >
              Navegação
            </h4>

            <nav
              aria-label="Navegação do rodapé"
              className="mt-6 flex flex-col gap-3 text-white/70"
            >
              <a
                href="#inicio"
                className="w-fit transition hover:text-white"
              >
                Início
              </a>

              {landing.show_about && (
                <a
                  href="#sobre"
                  className="w-fit transition hover:text-white"
                >
                  Sobre
                </a>
              )}

              {landing.show_proposals && (
                <a
                  href="#propostas"
                  className="w-fit transition hover:text-white"
                >
                  Propostas
                </a>
              )}

              {landing.show_agenda && (
                <a
                  href="#eventos"
                  className="w-fit transition hover:text-white"
                >
                  Agenda
                </a>
              )}

              {landing.show_gallery && (
                <a
                  href="#galeria"
                  className="w-fit transition hover:text-white"
                >
                  Galeria
                </a>
              )}

              {landing.show_news && (
                <a
                  href="#noticias"
                  className="w-fit transition hover:text-white"
                >
                  Notícias
                </a>
              )}

              {landing.show_support_form && (
                <a
                  href="#apoie"
                  className="w-fit transition hover:text-white"
                >
                  Apoie
                </a>
              )}
            </nav>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} {landing.public_name}. Todos os direitos
              reservados.
            </p>

            <p>Site oficial da campanha</p>
          </div>
        </div>
      </div>
    </footer>
  );
}