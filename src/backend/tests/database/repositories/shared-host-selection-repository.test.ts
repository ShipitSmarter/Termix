import { afterEach, describe, expect, it } from "vitest";
import { SharedHostSelectionRepository } from "../../../database/repositories/shared-host-selection-repository.js";
import { TestSqliteDatabase } from "./test-support.js";

describe("SharedHostSelectionRepository", () => {
  let adapter: TestSqliteDatabase | null = null;

  afterEach(async () => {
    await adapter?.close();
    adapter = null;
  });

  async function createRepository(): Promise<SharedHostSelectionRepository> {
    adapter = new TestSqliteDatabase();
    const context = await adapter.connect();
    await adapter.exec(`
      INSERT INTO users (id, username, password_hash, is_admin, is_oidc)
      VALUES
        ('user-1', 'alice', 'hash', 0, 0),
        ('owner-1', 'owner', 'hash', 0, 0);
      INSERT INTO ssh_data (id, user_id, name, ip, port, username, auth_type)
      VALUES (42, 'owner-1', 'prod', '10.0.0.42', 22, 'root', 'password');
    `);
    return new SharedHostSelectionRepository(context);
  }

  it("creates a selection with a personal folder and lists it", async () => {
    const repo = await createRepository();

    const created = await repo.upsertForUser("user-1", 42, "Production / Core");

    expect(created).toMatchObject({
      userId: "user-1",
      hostId: 42,
      folder: "Production / Core",
    });
    await expect(repo.listByUserId("user-1")).resolves.toMatchObject([
      { userId: "user-1", hostId: 42, folder: "Production / Core" },
    ]);
  });

  it("updates an existing selection instead of creating a duplicate", async () => {
    const repo = await createRepository();

    const first = await repo.upsertForUser("user-1", 42, "One");
    const second = await repo.upsertForUser("user-1", 42, "Two");

    expect(second.id).toBe(first.id);
    await expect(repo.listByUserId("user-1")).resolves.toHaveLength(1);
    expect(second.folder).toBe("Two");
  });

  it("deletes only the requesting user's selection", async () => {
    const repo = await createRepository();

    await repo.upsertForUser("user-1", 42, null);
    expect(await repo.deleteForUser("owner-1", 42)).toBe(false);
    expect(await repo.deleteForUser("user-1", 42)).toBe(true);
    await expect(repo.listByUserId("user-1")).resolves.toEqual([]);
  });
});
