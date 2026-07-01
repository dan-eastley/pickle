// Authorization core — the single source of truth for "who can do what" ([RAS-3]).
// Isomorphic: imported by the server (`src/api/github.ts`, enforcement — the gate
// of record) and the client (`usePermissions`, to hide/disable controls). Pure
// functions, no I/O, so it unit-tests cleanly.
//
// Two role concepts, kept separate:
//   • Global tier — `admin` (platform super-user) vs member/viewer.
//   • Per-architecture role — owner / contributor / consumer (a membership).
// Effective rights on an architecture = global-admin OR the membership role.

// Actions gate-checked across the app. Values are stable strings (also sent in
// API responses / used as keys), so don't rename casually.
export const ACTIONS = {
  VIEW: 'view',
  ARCHITECTURE_CREATE: 'architecture:create',
  ARCHITECTURE_EDIT: 'architecture:edit',
  TRANSITION_CREATE: 'transition:create',
  TRANSITION_EDIT: 'transition:edit',
  ACCESS_GRANT: 'access:grant',
  GOVERNANCE_WRITE: 'governance:write', // create/edit decisions, discoveries, scouts
  DECISION_ADVANCE: 'decision:advance', // move a decision to the next workflow stage
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

export type ArchitectureRole = 'owner' | 'contributor' | 'consumer'

export const ARCHITECTURE_ROLES: ArchitectureRole[] = ['owner', 'contributor', 'consumer']

export interface PermissionContext {
  authenticated: boolean
  isAdmin: boolean
  roleFor: (architectureId: string) => ArchitectureRole | null
}

/** Can `ctx` perform `action` (optionally scoped to an architecture)? */
export function can(
  ctx: PermissionContext,
  action: string,
  scope: { architectureId?: string } = {}
): boolean {
  if (!ctx || !ctx.authenticated) return false
  if (ctx.isAdmin) return true

  const role = scope.architectureId ? ctx.roleFor(scope.architectureId) : null

  switch (action) {
    // Viewing isn't membership-gated yet (any authenticated user); tighten later.
    case ACTIONS.VIEW:
      return true
    // Self-serve: any authenticated member may create an architecture (and becomes
    // its Owner). Admins can too (handled by the isAdmin short-circuit above).
    case ACTIONS.ARCHITECTURE_CREATE:
      return true
    // Owner-only, per architecture.
    case ACTIONS.ARCHITECTURE_EDIT:
    case ACTIONS.TRANSITION_CREATE:
    case ACTIONS.TRANSITION_EDIT:
    case ACTIONS.ACCESS_GRANT:
    case ACTIONS.DECISION_ADVANCE:
      return role === 'owner'
    // Owner or Contributor.
    case ACTIONS.GOVERNANCE_WRITE:
      return role === 'owner' || role === 'contributor'
    default:
      return false
  }
}

/** Build a `roleFor` lookup from a plain `{ [architectureId]: role }` map. */
export function roleForFromMap(
  memberships: Record<string, ArchitectureRole | string> = {}
): (architectureId: string) => ArchitectureRole | null {
  return (architectureId: string) =>
    (memberships[architectureId] as ArchitectureRole | undefined) ?? null
}

/**
 * Assemble a PermissionContext from the shape the permissions API returns
 * (`{ authenticated, isAdmin, memberships }`).
 */
export function buildContext({
  authenticated = false,
  isAdmin = false,
  memberships = {},
}: {
  authenticated?: boolean
  isAdmin?: boolean
  memberships?: Record<string, ArchitectureRole | string>
} = {}): PermissionContext {
  return { authenticated, isAdmin, roleFor: roleForFromMap(memberships) }
}
