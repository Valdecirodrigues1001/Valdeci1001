import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  hasPermission,
  type CampaignRole,
  type Permission,
} from "@/lib/permissions";

export type CurrentCampaignAccess = {
  userId: string;
  campaignId: string;
  membershipId: string;
  role: CampaignRole;
};

export async function getCurrentCampaignAccess(): Promise<
  CurrentCampaignAccess | null
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership, error } = await supabase
    .from("campaign_members")
    .select(`
      id,
      campaign_id,
      role
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao verificar acesso à campanha:",
      error
    );

    return null;
  }

  if (!membership) {
    return null;
  }

  return {
    userId: user.id,
    campaignId: membership.campaign_id,
    membershipId: membership.id,
    role: membership.role as CampaignRole,
  };
}

export async function requireCampaignAccess() {
  const access = await getCurrentCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  return access;
}

export async function requirePermission(
  permission: Permission
) {
  const access = await requireCampaignAccess();

  if (!hasPermission(access.role, permission)) {
    redirect("/dashboard");
  }

  return access;
}

export async function checkPermission(
  permission: Permission
) {
  const access = await getCurrentCampaignAccess();

  if (!access) {
    return {
      allowed: false,
      access: null,
    };
  }

  return {
    allowed: hasPermission(
      access.role,
      permission
    ),
    access,
  };
}

type AuthorizedActionContext = {
  authorized: true;
  access: CurrentCampaignAccess;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

type UnauthorizedActionContext = {
  authorized: false;
  access: null;
  supabase: null;
};

/*
 * Helper para Server Actions de escrita.
 *
 * Diferente de requirePermission, não faz redirect
 * (Server Actions retornam estado de erro), e já
 * devolve um client Supabase pronto para uso, evitando
 * uma segunda chamada a auth.getUser() na própria action.
 */
export async function authorizeAction(
  permission: Permission
): Promise<
  AuthorizedActionContext | UnauthorizedActionContext
> {
  const { allowed, access } =
    await checkPermission(permission);

  if (!allowed || !access) {
    return {
      authorized: false,
      access: null,
      supabase: null,
    };
  }

  return {
    authorized: true,
    access,
    supabase: await createClient(),
  };
}