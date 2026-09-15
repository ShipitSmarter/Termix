import type { SharedHostSelection } from "@/api/rbac-api";

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
