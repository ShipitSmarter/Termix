import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { HomepageSelector } from "../../../features/homepage/toolbar/HomepageSelector";

const createHomepageProfile = vi.fn();
const importHomepageProfile = vi.fn();
const updateHomepageProfileName = vi.fn();
const deleteHomepageProfile = vi.fn();
const getRoles = vi.fn().mockResolvedValue({ roles: [] });
vi.mock("@/api/homepage-api", () => ({
  createHomepageProfile: (...args: unknown[]) => createHomepageProfile(...args),
  importHomepageProfile: (...args: unknown[]) => importHomepageProfile(...args),
  shareHomepageProfile: vi.fn(),
  updateHomepageProfile: vi.fn(),
  updateHomepageProfileName: (...args: unknown[]) =>
    updateHomepageProfileName(...args),
  deleteHomepageProfile: (...args: unknown[]) => deleteHomepageProfile(...args),
}));
vi.mock("@/api/rbac-api", () => ({
  getRoles: (...args: unknown[]) => getRoles(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps = {
  profiles: [
    {
      id: 4,
      ownerId: "owner",
      name: "Team",
      visibility: "private",
      items: [],
      layout: { entries: [], pan: { x: 0, y: 0 }, zoom: 1 },
      owned: true,
    },
  ],
  selectedId: null,
  onChange: vi.fn(),
  personalWidgets: [],
  personalLayout: { entries: [], pan: { x: 0, y: 0 }, zoom: 1 },
  onProfilesChanged: vi.fn(),
};

describe("HomepageSelector profile management", () => {
  it("keeps an unavailable selection and gives the exact non-blocking notice", () => {
    render(<HomepageSelector {...baseProps} selectedId={99} unavailable />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "99",
    );
    expect((screen.getByRole("status") as HTMLElement).textContent).toContain(
      "This Homepage is unavailable. Select another Homepage.",
    );
  });

  it("creates a named profile from the personal homepage", async () => {
    createHomepageProfile.mockResolvedValue({
      ...baseProps.profiles[0],
      id: 8,
    });
    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    fireEvent.change(screen.getByLabelText("New profile name"), {
      target: { value: "Personal copy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(createHomepageProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Personal copy" }),
      ),
    );
    expect(baseProps.onChange).toHaveBeenCalledWith(8);
  });

  it("closes profile management from its close button", () => {
    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    expect(screen.getByText("Homepage profiles")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Close Homepage profiles" }),
    );

    expect(screen.queryByText("Homepage profiles")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Manage" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("loads role choices for profile grants", async () => {
    getRoles.mockResolvedValue({
      roles: [
        {
          id: 7,
          name: "operators",
          displayName: "Operators",
          description: null,
          isSystem: false,
          permissions: [],
          createdAt: "",
          updatedAt: "",
        },
      ],
    });

    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    fireEvent.change(screen.getByLabelText("Team grant type"), {
      target: { value: "role" },
    });
    await waitFor(() => expect(screen.getByText("Operators (7)")).toBeTruthy());
    expect(screen.getByRole("option", { name: "Operators (7)" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Alice (user-2)" })).toBeNull();
  });

  it("uses dark styling for profile management selects", () => {
    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    expect(screen.getByLabelText("Team visibility").className).toContain(
      "bg-card",
    );
    expect(screen.getByLabelText("Team grant type").className).toContain(
      "bg-card",
    );
  });

  it("hides everyone and user grants while retaining role grants", () => {
    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    expect(
      screen.queryByRole("option", { name: "Everyone signed in" }),
    ).toBeNull();
    expect(screen.getByRole("option", { name: "Role ID" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "User ID" })).toBeNull();
  });

  it("requires a name before importing a copied Homepage", async () => {
    const shared = { ...baseProps.profiles[0], owned: false, name: "Shared" };
    render(<HomepageSelector {...baseProps} profiles={[shared]} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(importHomepageProfile).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Imported profile name")).toBeTruthy();
  });

  it("renames and deletes an owned Homepage", async () => {
    render(<HomepageSelector {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    fireEvent.click(screen.getByRole("button", { name: "Rename Team" }));
    fireEvent.change(screen.getByLabelText("Team profile name"), {
      target: { value: "Renamed Team" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    await waitFor(() =>
      expect(updateHomepageProfileName).toHaveBeenCalledWith(4, "Renamed Team"),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Delete Team" }));
    await waitFor(() => expect(deleteHomepageProfile).toHaveBeenCalledWith(4));
  });

  it("keeps profile controls from starting a canvas gesture", () => {
    const onCanvasMouseDown = vi.fn();
    render(
      <div onMouseDown={onCanvasMouseDown}>
        <HomepageSelector {...baseProps} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    fireEvent.mouseDown(screen.getByLabelText("New profile name"));
    expect(onCanvasMouseDown).not.toHaveBeenCalled();
  });
});
