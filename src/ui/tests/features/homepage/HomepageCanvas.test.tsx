import { describe, expect, it } from "vitest";
import { isHomepageProfileReadOnly } from "@/features/homepage/HomepageCanvas";

describe("isHomepageProfileReadOnly", () => {
  const profiles = [
    { id: 10, owned: true },
    { id: 20, owned: false },
  ];

  it("allows editing the Personal Homepage", () => {
    expect(isHomepageProfileReadOnly(null, profiles)).toBe(false);
  });

  it("allows editing an owned profile", () => {
    expect(isHomepageProfileReadOnly(10, profiles)).toBe(false);
  });

  it("keeps a shared profile read-only", () => {
    expect(isHomepageProfileReadOnly(20, profiles)).toBe(true);
  });

  it("fails closed while a selected profile is unavailable", () => {
    expect(isHomepageProfileReadOnly(99, profiles)).toBe(true);
  });
});
