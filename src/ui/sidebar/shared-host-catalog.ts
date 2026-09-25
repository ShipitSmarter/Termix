import type {
  SharedHostImportMetadata,
  SharedHostSelection,
} from "@/api/rbac-api";
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
  useSelected?: boolean;
  imported?: boolean;
  importedHostId?: number | null;
  sourceSnapshotAt?: string | null;
  conflict?: "already-imported" | null;
}

/** Convert the catalog projection into the sidebar host shape. */
export function sharedCatalogHostToSSHHost(
  host: SharedHostCatalogRow,
): SSHHostWithStatus {
  const tags = host.tags
    ? host.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  return {
    id: host.id,
    name: host.name ?? host.ip,
    ip: host.ip,
    port: host.port,
    username: host.username,
    folder: host.selectedFolder,
    tags,
    authType: "none",
    connectionType: "ssh",
    status: "unknown",
    isShared: true,
    permissionLevel:
      host.permissionLevel as SSHHostWithStatus["permissionLevel"],
    ownerUsername: host.ownerUsername,
  } as unknown as SSHHostWithStatus;
}

export function filterHostsForSharedVisibility<
  T extends { id: string | number; isShared?: boolean },
>(
  hosts: T[],
  selectedHostIds: Iterable<number>,
  imports: SharedHostImportMetadata[] = [],
): T[] {
  const selected = new Set(selectedHostIds);
  const importedSourceByPersonalId = new Map(
    imports.map((entry) => [entry.importedHostId, entry.sourceSharedHostId]),
  );

  return hosts.filter((host) => {
    const hostId = Number(host.id);
    if (host.isShared && !selected.has(hostId)) return false;

    const importedSourceId = importedSourceByPersonalId.get(hostId);
    return importedSourceId === undefined || !selected.has(importedSourceId);
  });
}

export function mergeSharedHostSelections(
  hosts: SharedHostCatalogEntry[],
  selections: SharedHostSelection[],
  imports: SharedHostImportMetadata[] = [],
): SharedHostCatalogRow[] {
  const byHostId = new Map(
    selections.map((selection) => [selection.hostId, selection]),
  );
  const importsByHostId = new Map(
    imports.map((entry) => [entry.sourceSharedHostId, entry]),
  );
  return hosts.map((host) => {
    const selection = byHostId.get(host.id);
    const imported = importsByHostId.get(host.id);
    return {
      ...host,
      selected: selection !== undefined,
      selectedFolder: selection?.folder ?? null,
      useSelected: selection !== undefined,
      imported: imported !== undefined,
      importedHostId: imported?.importedHostId ?? null,
      sourceSnapshotAt: imported?.sourceSnapshotAt ?? null,
      conflict: imported ? "already-imported" : null,
    };
  });
}
