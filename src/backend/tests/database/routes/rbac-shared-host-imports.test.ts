import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  authenticated: true,
  access: { hasAccess: true, isOwner: false },
  visible: true,
  existing: null as { personalHostId: number } | null,
  created: [] as Array<Record<string, unknown>>,
  metadata: [] as Array<Record<string, unknown>>,
}));

vi.mock("../../../utils/auth-manager.js", () => ({
  AuthManager: {
    getInstance: () => ({
      createAuthMiddleware:
        () =>
        (
          req: express.Request & { userId?: string },
          res: express.Response,
          next: express.NextFunction,
        ) => {
          if (!state.authenticated)
            return res.status(401).json({ error: "Not authenticated" });
          req.userId = "recipient";
          next();
        },
      createDataAccessMiddleware:
        () =>
        (
          _req: express.Request,
          _res: express.Response,
          next: express.NextFunction,
        ) =>
          next(),
    }),
  },
}));

vi.mock("../../../utils/permission-manager.js", () => ({
  SHARE_PERMISSION_LEVELS: ["connect", "view", "edit", "manage"],
  PermissionManager: {
    getInstance: () => ({
      canAccessHost: async () => state.access,
      requireAdmin:
        () =>
        (
          _req: express.Request,
          _res: express.Response,
          next: express.NextFunction,
        ) =>
          next(),
      invalidateUserPermissionCache: vi.fn(),
      isAdmin: async () => false,
    }),
  },
}));

vi.mock("../../../database/repositories/factory.js", () => ({
  createCurrentPersonalHostSourceRepository: () => ({
    findByUserAndSource: async () => state.existing,
    create: async (input: Record<string, unknown>) => {
      state.metadata.push({ ...input, sourceType: "shared-host-import" });
      return { ...input, sourceType: "shared-host-import" };
    },
    listByUserId: async (userId: string) =>
      state.metadata.filter((entry) => entry.userId === userId),
  }),
  createCurrentHostRepository: () => ({
    createEncryptedForUser: async (
      _userId: string,
      input: Record<string, unknown>,
    ) => {
      state.created.push(input);
      return { id: 501, ...input };
    },
    deleteForUser: vi.fn(),
  }),
  createCurrentRbacAccessRepository: () => ({
    listSharedHosts: async () =>
      state.visible
        ? [
            {
              id: 42,
              name: "shared-db",
              ip: "10.0.0.42",
              port: 22,
              username: "operator",
              folder: "Ops",
              tags: "prod",
              connectionType: "ssh",
              notes: "safe note",
              enableTerminal: true,
              enableFileManager: true,
              enableTunnel: false,
              password: "must-not-copy",
              key: "must-not-copy",
            },
          ]
        : [],
  }),
  createCurrentRoleRepository: () => ({ listUserRoleIds: async () => [] }),
  createCurrentUserRepository: () => ({
    findById: async () => ({ id: "recipient", username: "recipient" }),
  }),
  createCurrentHostFolderRepository: vi.fn(),
  createCurrentHostResolutionRepository: vi.fn(),
  createCurrentSharedHostAuthOverrideRepository: vi.fn(),
  createCurrentSharedHostSelectionRepository: vi.fn(),
  createCurrentRbacAccessRepositoryUnused: vi.fn(),
  createCurrentSnippetRepository: vi.fn(),
}));

vi.mock("../../../utils/audit-logger.js", () => ({
  getRequestMeta: () => ({ ipAddress: "", userAgent: "" }),
  getAuditUsername: async () => "recipient",
  logAudit: vi.fn(),
}));
vi.mock("../../../utils/logger.js", () => ({
  databaseLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

interface Layer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ handle: express.RequestHandler }>;
  };
}

describe("mounted shared host import routes", () => {
  let router: express.Router;

  beforeEach(async () => {
    vi.resetModules();
    ({ default: router } = await import("../../../database/routes/rbac.js"));
    state.authenticated = true;
    state.access = { hasAccess: true, isOwner: false };
    state.visible = true;
    state.existing = null;
    state.created = [];
    state.metadata = [];
  });

  function route(method: "get" | "post", path: string) {
    const layer = (router as unknown as { stack: Layer[] }).stack.find(
      (candidate) =>
        candidate.route?.path === path && candidate.route.methods[method],
    );
    if (!layer?.route)
      throw new Error(`Missing mounted ${method.toUpperCase()} ${path}`);
    return layer.route.stack.map(({ handle }) => handle);
  }

  async function invoke(
    method: "get" | "post",
    path: string,
    body: unknown = {},
  ) {
    const handlers = route(method, path);
    const req = {
      body,
      headers: {},
      ip: "127.0.0.1",
      method: method.toUpperCase(),
      path,
      app: { get: () => false },
    } as unknown as express.Request;
    const headers = new Map<string, string>();
    return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      let index = 0;
      let status = 200;
      let settled = false;
      const finish = (responseBody: unknown) => {
        if (!settled) {
          settled = true;
          resolve({ status, body: responseBody });
        }
      };
      const res = {
        status(code: number) {
          status = code;
          return this;
        },
        json(responseBody: unknown) {
          finish(responseBody);
          return this;
        },
        send(responseBody: unknown) {
          finish(responseBody);
          return this;
        },
        end() {
          finish(undefined);
          return this;
        },
        setHeader(name: string, value: string) {
          headers.set(name, value);
          return this;
        },
        append(name: string, value: string) {
          headers.set(name, value);
          return this;
        },
        getHeader(name: string) {
          return headers.get(name);
        },
        headersSent: false,
      } as unknown as express.Response;
      const next: express.NextFunction = (error?: unknown) => {
        if (error) return reject(error);
        const handler = handlers[index++];
        if (!handler) return finish(undefined);
        Promise.resolve(handler(req, res, next)).catch(reject);
      };
      next();
    });
  }

  it("scopes metadata to the authenticated user and accepts no destination user", async () => {
    state.metadata = [
      { userId: "recipient", personalHostId: 7, sourceSharedHostId: 42 },
    ];
    const response = await invoke("get", "/shared-host-imports");
    expect(response).toEqual({
      status: 200,
      body: { imports: state.metadata },
    });
  });

  it("rejects malformed payloads through the mounted POST route", async () => {
    const response = await invoke("post", "/shared-host-imports", {
      sourceHostIds: [42],
      conflictPolicy: "overwrite",
    });
    expect(response).toEqual({
      status: 400,
      body: { error: "sourceHostIds must be a non-empty array of host IDs" },
    });
  });

  it("does not create for forbidden, owner, or expired access", async () => {
    for (const access of [
      { hasAccess: false, isOwner: false },
      { hasAccess: true, isOwner: true },
      { hasAccess: false, isOwner: false },
    ]) {
      state.access = access;
      const response = await invoke("post", "/shared-host-imports", {
        sourceHostIds: [42],
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        results: [{ sourceSharedHostId: 42, status: "forbidden" }],
      });
      expect(state.created).toHaveLength(0);
    }
  });

  it("is idempotent and creates only a safe credential-free copy for the recipient", async () => {
    state.existing = { personalHostId: 99 };
    expect(
      await invoke("post", "/shared-host-imports", { sourceHostIds: [42] }),
    ).toEqual({
      status: 200,
      body: {
        results: [
          {
            sourceSharedHostId: 42,
            status: "already-imported",
            importedHostId: 99,
          },
        ],
      },
    });
    expect(state.created).toHaveLength(0);

    state.existing = null;
    const response = await invoke("post", "/shared-host-imports", {
      sourceHostIds: [42],
    });
    expect(response).toMatchObject({
      status: 200,
      body: {
        results: [
          { sourceSharedHostId: 42, status: "created", importedHostId: 501 },
        ],
      },
    });
    expect(state.created[0]).toMatchObject({
      userId: "recipient",
      ip: "10.0.0.42",
      username: "operator",
      credentialId: null,
      authType: "none",
    });
    expect(state.created[0]).not.toHaveProperty("password", "must-not-copy");
    expect(state.created[0]).not.toHaveProperty("key", "must-not-copy");
    expect(state.metadata[0]).toMatchObject({
      userId: "recipient",
      personalHostId: 501,
      sourceSharedHostId: 42,
      sourceType: "shared-host-import",
    });
    expect(state.metadata[0].sourceSnapshotAt).toEqual(expect.any(String));
  });
});
