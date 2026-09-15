import { and, eq } from "drizzle-orm";
import { personalHostSources } from "../db/schema.js";
import type { DatabaseContext } from "./database-context.js";
import { insertReturning } from "./returning.js";

export type PersonalHostSource = typeof personalHostSources.$inferSelect;

export interface SharedHostCopySource {
  id: number;
  name: string | null;
  ip: string;
  port: number;
  username: string;
  folder: string | null;
  tags: string | null;
  connectionType?: string | null;
  notes?: string | null;
  enableTerminal?: boolean | null;
  enableFileManager?: boolean | null;
  enableTunnel?: boolean | null;
  enableSsh?: boolean | null;
  enableRdp?: boolean | null;
  enableVnc?: boolean | null;
  enableTelnet?: boolean | null;
}

/** Build a destination without reading any credential-bearing source field. */
export function buildPersonalHostCopy(
  userId: string,
  source: SharedHostCopySource,
  _snapshotAt: string,
): Record<string, unknown> {
  return {
    userId,
    connectionType: source.connectionType ?? "ssh",
    name: `${source.name ?? source.ip} (personal copy)`,
    ip: source.ip,
    port: source.port,
    username: source.username,
    folder: null,
    tags: source.tags,
    notes: source.notes ?? null,
    authType: "none",
    credentialId: null,
    vaultProfileId: null,
    password: null,
    key: null,
    keyPassword: null,
    keyType: null,
    sudoPassword: null,
    autostartPassword: null,
    autostartKey: null,
    autostartKeyPassword: null,
    rdpCredentialId: null,
    rdpPassword: null,
    vncCredentialId: null,
    vncPassword: null,
    telnetCredentialId: null,
    telnetPassword: null,
    socks5Password: null,
    enableSsh: true,
    enableRdp: false,
    enableVnc: false,
    enableTelnet: false,
    enableTerminal: source.enableTerminal ?? true,
    enableFileManager: source.enableFileManager ?? true,
    enableTunnel: source.enableTunnel ?? false,
    enableDocker: false,
    enableProxmox: false,
    enableProxmoxStats: false,
    enableTmuxMonitor: false,
    enableTerminalToolbar: true,
    allowSessionSharing: true,
    showTerminalInSidebar: true,
  };
}

export class PersonalHostSourceRepository {
  constructor(private readonly context: DatabaseContext) {}

  async findByUserAndSource(userId: string, sourceSharedHostId: number) {
    const rows = await this.context.drizzle
      .select()
      .from(personalHostSources)
      .where(
        and(
          eq(personalHostSources.userId, userId),
          eq(personalHostSources.sourceSharedHostId, sourceSharedHostId),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async create(input: {
    userId: string;
    personalHostId: number;
    sourceSharedHostId: number;
    sourceSnapshotAt: string;
  }): Promise<PersonalHostSource> {
    const rows = await insertReturning(
      this.context,
      personalHostSources,
      input,
    );
    return rows[0];
  }

  async listByUserId(userId: string): Promise<PersonalHostSource[]> {
    return this.context.drizzle
      .select()
      .from(personalHostSources)
      .where(eq(personalHostSources.userId, userId));
  }
}
