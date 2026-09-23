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
    const imported = await repo.importCopy("recipient", profile.id);
    expect(imported.ownerId).toBe("recipient");
    expect(imported.id).not.toBe(profile.id);
    expect(await repo.listVisible("recipient", [])).toHaveLength(2);
  });

  it("supports user and role grants without exposing private profiles", async () => {
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
