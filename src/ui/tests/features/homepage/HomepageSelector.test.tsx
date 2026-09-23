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
vi.mock("@/api/homepage-api", () => ({
  createHomepageProfile: (...args: unknown[]) => createHomepageProfile(...args),
  importHomepageProfile: vi.fn(),
  shareHomepageProfile: vi.fn(),
  updateHomepageProfile: vi.fn(),
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
