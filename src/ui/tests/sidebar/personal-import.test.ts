import { describe, expect, it } from "vitest";
import { sanitizePersonalImportPayload } from "../../sidebar/personal-import";

describe("sanitizePersonalImportPayload", () => {
  it("removes credentials and secret-bearing host fields without mutating input", () => {
    const payload = {
      version: "1",
      credentials: [{ alias: "admin", password: "secret" }],
      hosts: [
        {
          name: "app-01",
          ip: "app-01.viya.local",
          username: "operator",
          authType: "password",
          password: "secret",
          key: "PRIVATE KEY",
          keyPassword: "passphrase",
          sudoPassword: "sudo-secret",
          credentialId: "7",
          rdpPassword: "rdp-secret",
          enableRdp: true,
          connectionType: "ssh",
        },
      ],
    };

    const sanitized = sanitizePersonalImportPayload(payload);

    expect(sanitized.credentials).toBeUndefined();
    expect(sanitized.hosts).toEqual([
      {
        name: "app-01",
        ip: "app-01.viya.local",
        username: "operator",
        authType: "none",
        connectionType: "ssh",
      },
    ]);
    expect(payload.hosts[0]).toHaveProperty("password", "secret");
  });

  it("disables RDP for manual post-import configuration", () => {
    const sanitized = sanitizePersonalImportPayload({
      hosts: [
        {
          name: "desktop-01",
          ip: "desktop-01.viya.local",
          connectionType: "rdp",
          enableRdp: true,
          rdpUser: "user",
          rdpPassword: "secret",
          domain: "VIYA",
        },
      ],
    });

    expect(sanitized.hosts).toEqual([
      {
        name: "desktop-01",
        ip: "desktop-01.viya.local",
        connectionType: "rdp",
        authType: "none",
        enableRdp: false,
      },
    ]);
  });
});
