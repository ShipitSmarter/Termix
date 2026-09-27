import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WebEndpoint } from "@/types/index";

const isElectron = vi.hoisted(() => vi.fn(() => false));
vi.mock("@/lib/electron", () => ({ isElectron }));

const tunnelPost = vi.hoisted(() => vi.fn());
vi.mock("@/main-axios", () => ({
  tunnelApi: { post: tunnelPost },
  handleApiError: (error: unknown) => {
    throw new Error(`generic: ${String(error)}`);
  },
}));

function endpoint(overrides: Partial<WebEndpoint> = {}): WebEndpoint {
  return {
    id: "e1",
    label: "Proxmox",
    scheme: "https",
    port: 8006,
    path: "/",
    access: "tunnel",
    render: "external",
    bindHost: "0.0.0.0",
    ...overrides,
  };
}

const host = { id: "7", ip: "192.168.1.10" };

let pageHostname = "localhost";
const realLocation = window.location;
const windowOpen = vi.fn();

beforeEach(() => {
  pageHostname = "localhost";
  isElectron.mockReturnValue(false);
  tunnelPost.mockReset();
  tunnelPost.mockResolvedValue({ data: { port: 41234 } });
  Object.defineProperty(window, "location", {
    configurable: true,
    get: () => ({ ...realLocation, hostname: pageHostname }),
  });
  vi.stubGlobal("open", windowOpen);
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: realLocation,
  });
  vi.unstubAllGlobals();
  windowOpen.mockReset();
});

describe("openWebEndpointTunnel", () => {
  it("posts a path relative to the tunnel base, never one starting /ssh", async () => {
    // tunnelApi's baseURL already includes /ssh; a leading "/ssh" here would
    // resolve to /ssh/ssh/... and 404 on every call. Asserted on the captured
    // runtime argument rather than by scanning source, so quoting style and
    // indirection cannot fool it.
    const { openWebEndpointTunnel } = await import("@/api/web-endpoint-api");
    await openWebEndpointTunnel(7, "e1");

    expect(tunnelPost.mock.calls[0][0]).not.toMatch(/^\/ssh\//);
    expect(tunnelPost).toHaveBeenCalledWith("/tunnel/web-endpoint/open", {
      hostId: 7,
      endpointId: "e1",
    });
  });

  it("returns the port", async () => {
    const { openWebEndpointTunnel } = await import("@/api/web-endpoint-api");
    await expect(openWebEndpointTunnel(7, "e1")).resolves.toBe(41234);
  });

  it("preserves the backend's reason instead of the generic message", async () => {
    // 502 is this route's likeliest real failure and carries the actionable
    // cause. Collapsing it into "Server error occurred" defeats the
    // per-failure-mode messaging entirely.
    const axiosError = Object.assign(new Error("Request failed"), {
      isAxiosError: true,
      response: {
        status: 502,
        data: { error: "Timed out reaching the endpoint port" },
      },
    });
    tunnelPost.mockRejectedValue(axiosError);
    const { openWebEndpointTunnel, WebEndpointTunnelError } =
      await import("@/api/web-endpoint-api");

    await expect(openWebEndpointTunnel(7, "e1")).rejects.toThrow(
      /Timed out reaching the endpoint port/,
    );
    await expect(openWebEndpointTunnel(7, "e1")).rejects.toBeInstanceOf(
      WebEndpointTunnelError,
    );
  });

  it("falls back to the shared handler when the body carries no string reason", async () => {
    // A body shaped { error: <object> } would otherwise render as
    // "[object Object]" to the user.
    tunnelPost.mockRejectedValue(
      Object.assign(new Error("boom"), {
        isAxiosError: true,
        response: { status: 500, data: { error: { nested: true } } },
      }),
    );
    const { openWebEndpointTunnel } = await import("@/api/web-endpoint-api");
    await expect(openWebEndpointTunnel(7, "e1")).rejects.toThrow(/generic:/);
  });

  it("treats a missing port as a failure rather than returning undefined", async () => {
    tunnelPost.mockResolvedValue({ data: {} });
    const { openWebEndpointTunnel } = await import("@/api/web-endpoint-api");
    await expect(openWebEndpointTunnel(7, "e1")).rejects.toThrow(/no port/);
  });
});

describe("requireNumericHostId", () => {
  it("accepts a saved host id and rejects a quick-connect one", async () => {
    const { requireNumericHostId } = await import("@/api/web-endpoint-api");
    expect(requireNumericHostId("7")).toBe(7);
    for (const bad of ["quick-connect-1", "", "0", "-3", "abc"]) {
      expect(() => requireNumericHostId(bad)).toThrow(/saved host/);
    }
  });
});

/**
 * "Open externally" is not the safer path. The cookie jar belongs to the
 * browser either way, so a tunnel URL on the host string serving Termix hands
 * the tunnelled service this session exactly as an embedded frame would.
 */
describe("openWebEndpointExternally", () => {
  it("refuses shared-cookie browser windows before opening a tunnel", async () => {
    const { openWebEndpointExternally } =
      await import("@/api/web-endpoint-api");
    await expect(openWebEndpointExternally(host, endpoint())).rejects.toThrow(
      /desktop app/,
    );
    expect(windowOpen).not.toHaveBeenCalled();
    expect(tunnelPost).not.toHaveBeenCalled();
  });
  it("opens desktop endpoints through the isolated-window bridge", async () => {
    isElectron.mockReturnValue(true);
    const invoke = vi.fn().mockResolvedValue({ success: true });
    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: { invoke },
    });
    const { openWebEndpointExternally } =
      await import("@/api/web-endpoint-api");
    await openWebEndpointExternally(host, endpoint({ ignoreCert: true }));
    expect(invoke).toHaveBeenCalledWith("open-isolated-web-endpoint", {
      url: "https://127.0.0.1:41234/",
      ignoreCert: true,
    });
    expect(windowOpen).not.toHaveBeenCalled();
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });
});

describe("openWebEndpointInBrowser", () => {
  it("opens a browser tab with opener isolation", async () => {
    const popup = { location: { href: "" }, close: vi.fn() };
    windowOpen.mockReturnValue(popup);
    const { openWebEndpointInBrowser } = await import("@/api/web-endpoint-api");
    await openWebEndpointInBrowser(
      host,
      endpoint({ access: "direct" }),
      "browser-tab",
    );
    expect(windowOpen).toHaveBeenCalledWith(
      "https://192.168.1.10:8006/",
      "_blank",
      "noopener,noreferrer",
    );
    expect(popup.location.href).toBe("https://192.168.1.10:8006/");
  });

  it("opens a configured reverse proxy origin in a browser tab", async () => {
    const popup = { location: { href: "" }, close: vi.fn() };
    windowOpen.mockReturnValue(popup);
    const { openWebEndpointInBrowser } = await import("@/api/web-endpoint-api");
    await openWebEndpointInBrowser(
      host,
      endpoint({
        access: "proxy",
        proxyScheme: "https",
        proxyHost: "pve1.viya.it",
        proxyPort: 8006,
      }),
      "browser-tab",
    );
    expect(popup.location.href).toBe("https://pve1.viya.it:8006/");
  });

  it("rejects a blocked endpoint before opening a blank browser surface", async () => {
    pageHostname = "192.168.1.10";
    const { openWebEndpointInBrowser } = await import("@/api/web-endpoint-api");
    await expect(
      openWebEndpointInBrowser(
        host,
        endpoint({ access: "direct" }),
        "browser-tab",
      ),
    ).rejects.toThrow("direct-shares-session-cookie");
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it("requests a separate browser window with opener isolation", async () => {
    const popup = { location: { href: "" }, close: vi.fn() };
    windowOpen.mockReturnValue(popup);
    const { openWebEndpointInBrowser } = await import("@/api/web-endpoint-api");
    await openWebEndpointInBrowser(
      host,
      endpoint({ access: "direct" }),
      "browser-window",
    );
    expect(windowOpen).toHaveBeenCalledWith(
      "https://192.168.1.10:8006/",
      "_blank",
      "popup,width=1100,height=800,noopener,noreferrer",
    );
  });
});
