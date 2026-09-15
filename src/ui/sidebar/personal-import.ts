import type { ExportPayload } from "./host-export-payload";

const SECRET_FIELDS = [
  "password",
  "key",
  "keyPassword",
  "sudoPassword",
  "socks5Password",
  "rdpPassword",
  "vncPassword",
  "telnetPassword",
  "credentialId",
  "rdpCredentialId",
  "vncCredentialId",
  "telnetCredentialId",
  "vaultProfileId",
  "credentialAlias",
  "authOverrides",
  "guacamoleConfig",
  "proxmoxConfig",
  "socks5ProxyChain",
  "tunnelConnections",
  "rdpUser",
  "domain",
  "security",
  "ignoreCert",
  "vncUser",
  "telnetUser",
  "keyType",
  "enableRdp",
  "enableVnc",
  "enableTelnet",
];

/**
 * Prepare an export for incremental personal import.
 *
 * Personal imports deliberately never carry credentials or protocol-specific
 * authentication settings. The backend receives only personal host metadata;
 * RDP must be configured manually after import.
 */
export function sanitizePersonalImportPayload(
  payload: ExportPayload,
): ExportPayload {
  const hosts = (payload.hosts ?? []).map((source) => {
    const host = { ...source };
    for (const field of SECRET_FIELDS) delete host[field];
    host.authType = "none";
    if (source.connectionType === "rdp") host.enableRdp = false;
    return host;
  });

  return {
    ...payload,
    hosts,
    credentials: undefined,
  };
}
