import { describe, expect, it } from "vitest";
import { mergeSharedHostSelections } from "../../sidebar/shared-host-catalog";

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

describe("shared host catalog import state", () => {
  it("keeps use and import state independent", () => {
    expect(
      mergeSharedHostSelections(
        [host(1)],
        [
          {
            id: 1,
            userId: "u",
            hostId: 1,
            folder: null,
            createdAt: "now",
            updatedAt: "now",
          },
        ],
        [
          {
            sourceSharedHostId: 1,
            importedHostId: 7,
            sourceSnapshotAt: "now",
            sourceType: "shared-host-import",
          },
        ],
      ),
    ).toMatchObject([
      {
        useSelected: true,
        imported: true,
        importedHostId: 7,
        sourceSnapshotAt: "now",
        conflict: "already-imported",
      },
    ]);
  });
});
