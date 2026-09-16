import { afterEach, describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/main-axios", () => ({
  handleApiError: (error: unknown) => error,
  rbacApi: { post },
}));
vi.mock("@/lib/remote-server-api", () => ({
  getConnectedRemoteApi: vi.fn().mockResolvedValue(null),
  resolveRemoteHostId: vi.fn(),
}));

import { importSharedHosts } from "@/api/rbac-api";

afterEach(() => {
  vi.clearAllMocks();
});

describe("importSharedHosts", () => {
  it("sends only the source host IDs accepted by the backend", async () => {
    post.mockResolvedValue({ data: { results: [] } });

    await importSharedHosts([42]);

    expect(post).toHaveBeenCalledWith("/rbac/shared-host-imports", {
      sourceHostIds: [42],
    });
  });
});
