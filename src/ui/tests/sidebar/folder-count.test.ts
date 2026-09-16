import { describe, expect, it } from "vitest";
import { formatHostCount } from "../../sidebar/tree/FolderItem/FolderItem";

describe("formatHostCount", () => {
  it("renders zero online hosts explicitly", () => {
    expect(formatHostCount({ online: 0, total: 4 })).toBe("0/4");
  });
});
