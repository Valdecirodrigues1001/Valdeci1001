export type CampaignRole =
  | "super_admin"
  | "campaign_admin"
  | "manager"
  | "editor"
  | "viewer";

export type Permission =
  | "dashboard.view"

  | "crm.view"
  | "crm.manage"

  | "supporters.view"
  | "supporters.manage"

  | "volunteers.view"
  | "volunteers.manage"

  | "leaders.view"
  | "leaders.manage"

  | "events.view"
  | "events.manage"

  | "mobilization.view"
  | "mobilization.manage"

  | "proposals.view"
  | "proposals.manage"

  | "news.view"
  | "news.manage"

  | "gallery.view"
  | "gallery.manage"

  | "materials.view"
  | "materials.manage"

  | "communication.view"
  | "communication.manage"

  | "landing.view"
  | "landing.manage"

  | "reports.view"

  | "team.view"
  | "team.manage"

  | "settings.view"
  | "settings.manage";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "crm.view",
  "crm.manage",

  "supporters.view",
  "supporters.manage",

  "volunteers.view",
  "volunteers.manage",

  "leaders.view",
  "leaders.manage",

  "events.view",
  "events.manage",

  "mobilization.view",
  "mobilization.manage",

  "proposals.view",
  "proposals.manage",

  "news.view",
  "news.manage",

  "gallery.view",
  "gallery.manage",

  "materials.view",
  "materials.manage",

  "communication.view",
  "communication.manage",

  "landing.view",
  "landing.manage",

  "reports.view",

  "team.view",
  "team.manage",

  "settings.view",
  "settings.manage",
];

const VIEW_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "crm.view",
  "supporters.view",
  "volunteers.view",
  "leaders.view",
  "events.view",

  "mobilization.view",

  "proposals.view",
  "news.view",
  "gallery.view",
  "materials.view",

  "communication.view",

  "landing.view",

  "reports.view",
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...VIEW_PERMISSIONS,

  "crm.manage",
  "supporters.manage",
  "volunteers.manage",
  "leaders.manage",
  "events.manage",

  "mobilization.manage",

  "communication.manage",
];

const EDITOR_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "events.view",

  "proposals.view",
  "proposals.manage",

  "news.view",
  "news.manage",

  "gallery.view",
  "gallery.manage",

  "materials.view",
  "materials.manage",

  "landing.view",
  "landing.manage",
];

export const ROLE_PERMISSIONS: Record<
  CampaignRole,
  Permission[]
> = {
  super_admin: ALL_PERMISSIONS,
  campaign_admin: ALL_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  editor: EDITOR_PERMISSIONS,
  viewer: VIEW_PERMISSIONS,
};

export function hasPermission(
  role: string | null | undefined,
  permission: Permission
) {
  if (!role) {
    return false;
  }

  if (!(role in ROLE_PERMISSIONS)) {
    return false;
  }

  return ROLE_PERMISSIONS[
    role as CampaignRole
  ].includes(permission);
}

export function hasAnyPermission(
  role: string | null | undefined,
  permissions: Permission[]
) {
  return permissions.some((permission) =>
    hasPermission(role, permission)
  );
}

export function hasAllPermissions(
  role: string | null | undefined,
  permissions: Permission[]
) {
  return permissions.every((permission) =>
    hasPermission(role, permission)
  );
}