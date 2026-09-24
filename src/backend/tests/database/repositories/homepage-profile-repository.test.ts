import { afterEach, describe, expect, it } from "vitest";
import { HomepageProfileRepository } from "../../../database/repositories/homepage-profile-repository.js";
import { TestSqliteDatabase } from "./test-support.js";

describe("HomepageProfileRepository", () => {
  let adapter: TestSqliteDatabase | null = null;

  afterEach(async () => {
    await adapter?.close();
    adapter = null;
  });

  async function repository() {
    adapter = new TestSqliteDatabase();
    const context = await adapter.connect();
    await adapter.exec(`
      INSERT INTO users (id, username, password_hash)
      VALUES ('owner', 'owner', 'hash'), ('recipient', 'recipient', 'hash');
      INSERT INTO roles (id, name, display_name) VALUES (7, 'role-7', 'Role 7');
    `);
    return new HomepageProfileRepository(context);
  }

  it("creates a named profile with only portable widgets", async () => {
    const repo = await repository();
    const profile = await repo.create("owner", "Team start", {
      entries: [
        { typeId: "clock", title: "UTC", config: {} },
        { typeId: "ssh_terminal", title: "secret", config: { hostId: 1 } },
      ],
      layout: { entries: [], pan: { x: 0, y: 0 }, zoom: 1 },
    });

    expect(profile.name).toBe("Team start");
    expect(profile.items).toHaveLength(1);
    expect(profile.items[0].typeId).toBe("clock");
  });

  it("copies display-only widgets and remaps copied layout item IDs", async () => {
    const repo = await repository();
    const profile = await repo.create("owner", "Portable copy", {
      entries: [
        {
          sourceId: 1001,
          typeId: "folder",
          title: "Links",
          config: { isExpanded: true },
        },
        {
          sourceId: 1002,
          typeId: "countdown",
          title: "Launch",
          config: { label: "Launch" },
        },
        {
          sourceId: 1003,
          typeId: "service_grid",
          title: "Services",
          config: { services: [] },
        },
        {
          sourceId: 1004,
          typeId: "link_tree",
          title: "Bookmarks",
          config: { links: [] },
        },
      ],
      layout: {
        entries: [
          { itemId: 1001, x: 30, y: 60, w: 240, h: 180, zOrder: 1 },
          { itemId: 1002, x: 300, y: 60, w: 240, h: 180, zOrder: 2 },
          { itemId: 1003, x: 30, y: 270, w: 510, h: 180, zOrder: 3 },
          { itemId: 1004, x: 30, y: 480, w: 510, h: 180, zOrder: 4 },
        ],
        pan: { x: 10, y: 20 },
        zoom: 1,
      },
    });

    expect(profile.items.map((item) => item.typeId)).toEqual([
      "folder",
      "countdown",
      "service_grid",
      "link_tree",
    ]);
    expect(profile.layout.entries).toHaveLength(4);
    expect(profile.layout.entries.map((entry) => entry.itemId)).toEqual(
      profile.items.map((item) => item.id),
    );
    expect(profile.layout.entries.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 30, y: 60 },
      { x: 300, y: 60 },
      { x: 30, y: 270 },
      { x: 30, y: 480 },
    ]);
  });

  it("allows authenticated recipients to read live profiles and import copies", async () => {
    const repo = await repository();
    const profile = await repo.create("owner", "Shared", {
      entries: [
        { typeId: "notes", title: "Read me", config: { content: "hi" } },
      ],
      layout: { entries: [], pan: { x: 0, y: 0 }, zoom: 1 },
    });
    await repo.grant(profile.id, { kind: "authenticated" });

    expect(await repo.listVisible("recipient", [])).toHaveLength(1);
    const imported = await repo.importCopy(
      "recipient",
      profile.id,
      "Shared from team",
    );
    expect(imported.ownerId).toBe("recipient");
    expect(imported.name).toBe("Shared from team");
    expect(imported.id).not.toBe(profile.id);
    expect(await repo.listVisible("recipient", [])).toHaveLength(2);
  });

  it("supports renaming and deleting owned profiles", async () => {
    const repo = await repository();
    const profile = await repo.create("owner", "Before", {
      entries: [],
      layout: {},
    });
    await repo.updateName(profile.id, "After");
    expect(
      (await repo.listVisible("owner", [])).find(
        (item) => item.id === profile.id,
      )?.name,
    ).toBe("After");
    await repo.delete(profile.id);
    expect(await repo.listVisible("owner", [])).toHaveLength(0);
  });

  it("supports role grants without exposing private profiles", async () => {
    const repo = await repository();
    const profile = await repo.create("owner", "Role profile", {
      entries: [],
      layout: {},
    });
    await repo.grant(profile.id, { kind: "role", roleId: 7 });

    expect(await repo.listVisible("recipient", [7])).toHaveLength(1);
    expect(await repo.listVisible("recipient", [8])).toHaveLength(0);
  });
});
