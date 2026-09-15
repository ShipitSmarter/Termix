import { describe, expect, it } from "vitest";
import {
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
});
