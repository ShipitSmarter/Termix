import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const api = vi.hoisted(() => ({
  getSharedHosts: vi.fn(),
  getSharedHostSelections: vi.fn(),
  getSharedHostImportMetadata: vi.fn(),
  importSharedHosts: vi.fn(),
  selectSharedHost: vi.fn(),
  removeSharedHostSelection: vi.fn(),
}));

vi.mock("@/main-axios", () => api);
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

import { SharedHostsCatalog } from "../../sidebar/SharedHostsCatalog";

const host = (id: number) => ({
  id,
  name: `host-${id}`,
  ip: `10.0.0.${id}`,
  port: 22,
  username: "operator",
  folder: null,
  tags: null,
  permissionLevel: "connect" as const,
  expiresAt: null,
  grantedBy: "owner",
  ownerUsername: "owner",
});

function resolvedRows(
  selections: unknown[] = [],
  imports: unknown[] = [],
  sharedHosts = [host(1)],
) {
  api.getSharedHosts.mockResolvedValue({ sharedHosts });
  api.getSharedHostSelections.mockResolvedValue({ selections });
  api.getSharedHostImportMetadata.mockResolvedValue({ imports });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SharedHostsCatalog rendered behavior", () => {
  it("shows the explanatory copy and independent action states", async () => {
    resolvedRows(
      [{ id: 1, userId: "u", hostId: 1, folder: null }],
      [
        {
          sourceSharedHostId: 1,
          importedHostId: 9,
          sourceSnapshotAt: "now",
          sourceType: "shared-host-import",
        },
      ],
    );

    render(<SharedHostsCatalog onClose={vi.fn()} />);

    expect(
      await screen.findByText(/credentials are never copied/i),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Already imported" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "In Shared Hosts" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("supports neither action independently and refreshes after each action", async () => {
    resolvedRows();
    api.importSharedHosts.mockResolvedValue({
      results: [
        { sourceSharedHostId: 1, status: "created", importedHostId: 10 },
      ],
    });
    api.selectSharedHost.mockResolvedValue({ selection: {} });

    const user = userEvent.setup();
    render(<SharedHostsCatalog onClose={vi.fn()} />);
    const importButton = await screen.findByRole("button", {
      name: "Import to My Hosts",
    });
    const useButton = screen.getByRole("button", { name: "Use shared host" });
    expect(importButton.getAttribute("aria-pressed")).toBe("false");
    expect(useButton.getAttribute("aria-pressed")).toBe("false");

    await user.click(importButton);
    await waitFor(() =>
      expect(api.importSharedHosts).toHaveBeenCalledWith([1]),
    );
    await waitFor(() => expect(api.getSharedHosts).toHaveBeenCalledTimes(2));

    await user.click(useButton);
    await waitFor(() =>
      expect(api.selectSharedHost).toHaveBeenCalledWith(1, null),
    );
    await waitFor(() => expect(api.getSharedHosts).toHaveBeenCalledTimes(3));
  });

  it("renders loading and error recovery states", async () => {
    let rejectLoad!: (error: Error) => void;
    api.getSharedHosts.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectLoad = reject;
      }),
    );
    api.getSharedHostSelections.mockReturnValue(new Promise(() => undefined));
    api.getSharedHostImportMetadata.mockReturnValue(
      new Promise(() => undefined),
    );

    render(<SharedHostsCatalog onClose={vi.fn()} />);
    expect(screen.getByText("Loading shared hosts…")).toBeTruthy();
    rejectLoad(new Error("network"));
    expect(
      await screen.findByText("Unable to load shared hosts."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
