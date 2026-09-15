import { describe, expect, it } from "vitest";
import {
  buildPersonalHostCopy,
  type SharedHostCopySource,
} from "../../../database/repositories/personal-host-source-repository.js";

describe("personal host source", () => {
  it("copies only safe connection fields and disables credential-bearing protocols", () => {
    const source: SharedHostCopySource = {
      id: 42,
      name: "shared",
      ip: "10.0.0.42",
      port: 2222,
      username: "operator",
      folder: "Ops",
      tags: "prod",
      connectionType: "ssh",
      notes: "safe note",
      enableTerminal: true,
      enableFileManager: true,
      enableTunnel: true,
      enableSsh: true,
      enableRdp: true,
      enableVnc: true,
      enableTelnet: true,
      password: "must-not-be-read",
      key: "must-not-be-read",
      credentialId: 99,
    };

    expect(
      buildPersonalHostCopy("user-1", source, "2026-09-15T00:00:00.000Z"),
    ).toMatchObject({
      userId: "user-1",
      name: "shared (personal copy)",
      ip: "10.0.0.42",
      port: 2222,
      username: "operator",
      folder: null,
      tags: "prod",
      connectionType: "ssh",
      authType: "none",
      enableSsh: true,
      enableRdp: false,
      enableVnc: false,
      enableTelnet: false,
      credentialId: null,
      password: null,
      key: null,
    });
    expect(
      buildPersonalHostCopy("user-1", source, "2026-09-15T00:00:00.000Z"),
    ).not.toHaveProperty("sourceSnapshotAt");
  });
});
