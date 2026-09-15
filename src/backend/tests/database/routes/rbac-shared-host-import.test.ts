import { describe, expect, it } from "vitest";
import { parseSharedHostImportIds } from "../../../database/routes/rbac.js";

describe("POST /rbac/shared-host-imports request validation", () => {
  it("accepts source IDs only and deduplicates them", () => {
    expect(parseSharedHostImportIds({ sourceHostIds: [4, 4, 9] })).toEqual([
      4, 9,
    ]);
  });

  it.each([
    undefined,
    null,
    {},
    { sourceHostIds: [] },
    { sourceHostIds: ["4"] },
    { sourceHostIds: [0] },
    { sourceHostIds: [1.5] },
    { sourceHostIds: [1], destinationUserId: "other-user" },
  ])("rejects invalid or destination-bearing payload %j", (body) => {
    expect(parseSharedHostImportIds(body)).toBeNull();
  });
});
