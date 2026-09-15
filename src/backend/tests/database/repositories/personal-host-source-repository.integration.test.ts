import { afterEach, describe, expect, it } from "vitest";
import { PersonalHostSourceRepository } from "../../../database/repositories/personal-host-source-repository.js";
import { TestSqliteDatabase } from "./test-support.js";

describe("PersonalHostSourceRepository", () => {
  let adapter: TestSqliteDatabase | null = null;
  afterEach(async () => {
    await adapter?.close();
    adapter = null;
  });

  it("keeps one source identity per destination user and preserves metadata", async () => {
    adapter = new TestSqliteDatabase();
    const context = await adapter.connect();
    await adapter.exec(`
      INSERT INTO users (id, username, password_hash, is_admin, is_oidc) VALUES ('u', 'user', 'hash', 0, 0);
      INSERT INTO ssh_data (id, user_id, name, ip, port, username, auth_type) VALUES (7, 'u', 'copy', '10.0.0.7', 22, 'operator', 'none');
    `);
    const repo = new PersonalHostSourceRepository(context);
    const created = await repo.create({
      userId: "u",
      personalHostId: 7,
      sourceSharedHostId: 42,
      sourceSnapshotAt: "2026-09-15T00:00:00.000Z",
    });
    expect(created).toMatchObject({
      userId: "u",
      personalHostId: 7,
      sourceSharedHostId: 42,
      sourceType: "shared-host-import",
    });
    await expect(repo.findByUserAndSource("u", 42)).resolves.toMatchObject({
      personalHostId: 7,
    });
  });
});
