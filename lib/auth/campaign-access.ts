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