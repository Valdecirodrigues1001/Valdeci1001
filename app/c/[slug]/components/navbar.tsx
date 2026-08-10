"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type NavbarProps = {
  landingPage: {
    slug: string;
    public_name: string;
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;

    show_about: boolean;
    show_proposals: boolean;
    show_news: boolean;
    show_agenda: boolean;
    show_gallery: boolean;
    show_support_form: boolean;
  };
  showMaterials?: boolean;
  showLeaders?: boolean;
};

type NavigationItem = {
  label: string;
  href: string;
  visible: boolean;
};

export function Navbar({
  landingPage,
  showMaterials = true,
  showLeaders = true,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const primaryColor =
    landingPage.primary_color || "#0F172A";

  const secondaryColor =
    landingPage.secondary_color || "#D4AF37";

  const accentColor =
    landingPage.accent_color || "#FFFFFF";

  const navigationItems: NavigationItem[] = [
    {
      label: "Início",
      href: "#inicio",
      visible: true,
    },
    {
      label: "Sobre",
      href: "#sobre",
      visible: landingPage.show_about,
    },
    {
      label: "Propostas",
      href: "#propostas",
      visible: landingPage.show_proposals,
    },
    {
      label: "Notícias",
      href: "#noticias",
      visible: landingPage.show_news,
    },
    {
      label: "Agenda",
      href: "#agenda",
      visible: landingPage.show_agenda,
    },
    {
      label: "Galeria",
      href: "#galeria",
      visible: landingPage.show_gallery,
    },
    {
      label: "Materiais",
      href: "#materiais",
      visible: showMaterials,
    },
    {
      label: "Lideranças",
      href: "#liderancas",
      visible: showLeaders,
    },
  ];

  const visibleItems = navigationItems.filter(
    (item) => item.visible
  );

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{
        backgroundColor: primaryColor,
        borderColor: `${accentColor}20`,
      }}
    >
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-6 lg:px-8">
        <Link
          href={`/c/${landingPage.slug}#inicio`}
          className="flex min-w-0 items-center gap-3"
          onClick={closeMenu}
        >
          {landingPage.logo_url ? (
            <img
              src={landingPage.logo_url}
              alt={`Logo da campanha de ${landingPage.public_name}`}
              className="h-11 w-auto max-w-40 object-contain"
            />
          ) : (
            <span
              className="truncate text-lg font-bold"
              style={{ color: accentColor }}
            >
              {landingPage.public_name}
            </span>
          )}
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegação principal"
        >
          {visibleItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10"
              style={{ color: accentColor }}
            >
              {item.label}
            </a>
          ))}

          {landingPage.show_support_form && (
            <a
              href="#apoie"
              className="ml-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:brightness-95"
              style={{
                backgroundColor: secondaryColor,
                color: primaryColor,
              }}
            >
              Quero apoiar
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden"
          style={{
            color: accentColor,
            borderColor: `${accentColor}35`,
          }}
          aria-label={
            isOpen ? "Fechar menu" : "Abrir menu"
          }
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="border-t px-5 pb-5 pt-3 lg:hidden"
          style={{
            backgroundColor: primaryColor,
            borderColor: `${accentColor}20`,
          }}
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1"
            aria-label="Navegação mobile"
          >
            {visibleItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                style={{ color: accentColor }}
              >
                {item.label}
              </a>
            ))}

            {landingPage.show_support_form && (
              <a
                href="#apoie"
                onClick={closeMenu}
                className="mt-3 rounded-xl px-5 py-3 text-center text-sm font-bold"
                style={{
                  backgroundColor: secondaryColor,
                  color: primaryColor,
                }}
              >
                Quero apoiar
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}