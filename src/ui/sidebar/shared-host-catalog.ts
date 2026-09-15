import type { SharedHostSelection } from "@/api/rbac-api";
import type { SSHHostWithStatus } from "@/main-axios";

export interface SharedHostCatalogEntry {
  id: number;
  name: string | null;
  ip: string;
  port: number;
  username: string;
  folder: string | null;
  tags: string | null;
  permissionLevel: string;
  expiresAt: string | null;
  grantedBy: string;
  ownerUsername: string;
}

export interface SharedHostCatalogRow extends SharedHostCatalogEntry {
  selected: boolean;
  selectedFolder: string | null;
}

/** Convert the credential-free catalog projection into the sidebar host shape. */
export function sharedCatalogHostToSSHHost(
  host: SharedHostCatalogRow,
): SSHHostWithStatus {
  return {
    id: host.id,
    name: host.name ?? host.ip,
    ip: host.ip,
    port: host.port,
    username: host.username,
    folder: host.selectedFolder,
    tags: host.tags ?? undefined,
    authType: "none",
    connectionType: "ssh",
    status: "unknown",
    isShared: true,
    permissionLevel:
      host.permissionLevel as SSHHostWithStatus["permissionLevel"],
    ownerUsername: host.ownerUsername,
  } as unknown as SSHHostWithStatus;
}

export function mergeSharedHostSelections(
  hosts: SharedHostCatalogEntry[],
  selections: SharedHostSelection[],
): SharedHostCatalogRow[] {
  const byHostId = new Map(
    selections.map((selection) => [selection.hostId, selection]),
  );
  return hosts.map((host) => {
    const selection = byHostId.get(host.id);
    return {
      ...host,
      selected: selection !== undefined,
      selectedFolder: selection?.folder ?? null,
    };
  });
}
