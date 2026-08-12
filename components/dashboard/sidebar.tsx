"use client";

import {
  CalendarDays,
  ChartNoAxesCombined,
  FileText,
  Gauge,
  Handshake,
  House,
  Images,
  KanbanSquare,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  Settings,
  Target,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/app/dashboard/actions";

import {
  hasPermission,
  type CampaignRole,
  type Permission,
} from "@/lib/permissions";

type SidebarProps = {
  campaignName: string;
  candidateName: string;
  candidatePosition?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  role: CampaignRole;
};

const navigation: Array<{
  label: string;
  href: string;
  icon: React.ElementType;
  permission: Permission;
}> = [
  {
    label: "Visão geral",
    href: "/dashboard",
    icon: Gauge,
    permission: "dashboard.view",
  },
  {
    label: "Apoiadores",
    href: "/dashboard/apoiadores",
    icon: Users,
    permission: "supporters.view",
  },
  {
    label: "CRM político",
    href: "/dashboard/crm",
    icon: KanbanSquare,
    permission: "crm.view",
  },
  {
    label: "Lideranças",
    href: "/dashboard/liderancas",
    icon: Handshake,
    permission: "leaders.view",
  },
  {
    label: "Agenda",
    href: "/dashboard/agenda",
    icon: CalendarDays,
    permission: "events.view",
  },
  {
    label: "Equipe",
    href: "/dashboard/equipe",
    icon: UserRoundCog,
    permission: "team.view",
  },
  {
    label: "Mobilização",
    href: "/dashboard/mobilizacao",
    icon: Megaphone,
    permission: "mobilization.view",
  },
  {
    label: "Propostas",
    href: "/dashboard/propostas",
    icon: Target,
    permission: "proposals.view",
  },
  {
    label: "Materiais",
    href: "/dashboard/materiais",
    icon: Images,
    permission: "materials.view",
  },
  {
    label: "Notícias",
    href: "/dashboard/noticias",
    icon: Newspaper,
    permission: "news.view",
  },
  {
    label: "Comunicação",
    href: "/dashboard/comunicacao",
    icon: FileText,
    permission: "communication.view",
  },
  {
    label: "Landing Page",
    href: "/dashboard/landing-page",
    icon: House,
    permission: "landing.view",
  },
  {
    label: "Relatórios",
    href: "/dashboard/relatorios",
    icon: ChartNoAxesCombined,
    permission: "reports.view",
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    permission: "settings.view",
  },
];

export function Sidebar({
  campaignName,
  candidateName,
  candidatePosition,
  logoUrl,
  primaryColor,
  secondaryColor,
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const allowedNavigation = navigation.filter(
    (item) =>
      hasPermission(role, item.permission)
  );

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={candidateName}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
              style={{
                backgroundColor: secondaryColor,
                color: primaryColor,
              }}
            >
              {candidateName.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Painel da campanha
            </p>

            <p className="mt-1 truncate font-semibold text-white">
              {candidateName}
            </p>

            {candidatePosition ? (
              <p className="truncate text-sm text-white/60">
                {candidatePosition}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-4 truncate text-xs text-white/40">
          {campaignName}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {allowedNavigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
              style={
                active
                  ? {
                      backgroundColor:
                        secondaryColor,
                      color: primaryColor,
                    }
                  : {
                      color:
                        "rgba(255,255,255,0.72)",
                    }
              }
            >
              <Icon size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Sair do sistema
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-white/30">
          Desenvolvido por BP Resultados
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      <aside
        className="fixed inset-y-0 left-0 z-20 hidden w-72 lg:block"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        {sidebarContent}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar menu"
          />

          <aside
            className="relative h-full w-[86%] max-w-72"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}