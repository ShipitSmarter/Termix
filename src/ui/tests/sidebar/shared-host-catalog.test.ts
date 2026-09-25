import { describe, expect, it } from "vitest";
import {
  filterHostsForSharedVisibility,
  mergeSharedHostSelections,
  sharedCatalogHostToSSHHost,
} from "../../sidebar/shared-host-catalog";
import { buildHostTree } from "../../sidebar/build-host-tree";

const host = (id: number) => ({
  id,
  name: `host-${id}`,
  ip: "10.0.0.1",
  port: 22,
  username: "operator",
  folder: null,
  tags: null,
  permissionLevel: "connect",
  expiresAt: null,
  grantedBy: "owner",
  ownerUsername: "owner",
});

describe("mergeSharedHostSelections", () => {
  it("normalizes catalog tags for the sidebar host model", () => {
    const projected = sharedCatalogHostToSSHHost({
      ...host(7),
      tags: "production,linux",
      selected: true,
      selectedFolder: null,
    });

    expect(projected.tags).toEqual(["production", "linux"]);
  });

  it("marks only the caller's selected shared hosts and preserves placement", () => {
    expect(
      mergeSharedHostSelections(
        [host(1), host(2)],
        [
          {
            id: 10,
            userId: "user-1",
            hostId: 2,
            folder: "Operations",
            createdAt: "2026-09-15T00:00:00.000Z",
            updatedAt: "2026-09-15T00:00:00.000Z",
          },
        ],
      ),
    ).toMatchObject([
      { id: 1, selected: false, selectedFolder: null },
      { id: 2, selected: true, selectedFolder: "Operations" },
    ]);
  });

  it("keeps granted shared hosts out of My Hosts until selected", () => {
    const selected = {
      ...host(2),
      selected: true,
      selectedFolder: "Operations",
    };
    const projected = sharedCatalogHostToSSHHost(selected);
    const tree = buildHostTree(
      [
        {
          ...projected,
          id: 99,
          name: "personal",
          folder: null,
          isShared: false,
        } as never,
        {
          ...projected,
          id: 2,
          name: "selected-shared",
          folder: "Legacy Folder",
          isShared: true,
        } as never,
        {
          ...projected,
          id: 3,
          name: "unselected-shared",
          folder: null,
          isShared: true,
        } as never,
        {
          ...projected,
          id: 100,
          name: "imported-copy",
          folder: null,
          isShared: false,
        } as never,
      ],
      undefined,
      [selected],
      [
        {
          sourceSharedHostId: 2,
          importedHostId: 100,
          sourceSnapshotAt: "2026-09-16T00:00:00.000Z",
          sourceType: "shared-host-import",
        },
      ],
    );

    expect(tree.children[0]).toMatchObject({
      name: "My Hosts",
      children: [{ name: "personal", isShared: false }],
    });
    expect(tree.children[1]).toMatchObject({
      name: "Shared Hosts",
      children: [
        {
          name: "Operations",
          children: [{ name: "host-2", isShared: true }],
        },
      ],
    });
  });

  it("projects selected hosts into fixed sidebar roots without credentials", () => {
    const selected = {
      ...host(2),
      selected: true,
      selectedFolder: "Operations",
    };
    const projected = sharedCatalogHostToSSHHost(selected);
    const tree = buildHostTree(
      [
        {
          ...projected,
          id: 99,
          name: "personal",
          folder: null,
          isShared: false,
        } as never,
      ],
      undefined,
      [selected],
    );

    expect(tree.children.map((entry) => entry.name)).toEqual([
      "My Hosts",
      "Shared Hosts",
    ]);
    expect(tree.children[1]).toMatchObject({
      children: [
        {
          name: "Operations",
          children: [{ name: "host-2", isShared: true }],
        },
      ],
    });
    expect(projected).not.toHaveProperty("password");
    expect(projected).not.toHaveProperty("key");
  });

  it("hides unselected shared hosts and deduplicates selected imports", () => {
    const hosts = [
      { id: 1, isShared: true, name: "unselected" },
      { id: 2, isShared: true, name: "selected" },
      { id: 10, isShared: false, name: "imported-copy" },
      { id: 11, isShared: false, name: "personal" },
    ];

    expect(
      filterHostsForSharedVisibility(
        hosts,
        [2],
        [
          {
            sourceSharedHostId: 2,
            importedHostId: 10,
            sourceSnapshotAt: "2026-09-16T00:00:00.000Z",
            sourceType: "shared-host-import",
          },
        ],
      ),
    ).toEqual([
      { id: 2, isShared: true, name: "selected" },
      { id: 11, isShared: false, name: "personal" },
    ]);
  });
});
