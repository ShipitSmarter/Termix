import { homepageApi, handleApiError } from "@/main-axios";
import type {
  HomepageItemRow,
  HomepageLayoutData,
  HomepageLayoutRow,
  WidgetTypeId,
  HomepageProfile,
} from "@/types/homepage-types";

export async function getHomepageProfiles(): Promise<HomepageProfile[]> {
  try {
    const res = await homepageApi.get("/profiles");
    return res.data;
  } catch (error) {
    throw handleApiError(error, "fetch homepage profiles");
  }
}

export async function importHomepageProfile(
  id: number,
  name: string,
): Promise<HomepageProfile> {
  try {
    const res = await homepageApi.post(`/profiles/${id}/import`, { name });
    return res.data;
  } catch (error) {
    throw handleApiError(error, "import homepage profile");
  }
}
export async function createHomepageProfile(data: {
  name: string;
  entries: Array<{
    typeId: string;
    title?: string | null;
    config?: Record<string, unknown>;
  }>;
  layout: HomepageLayoutData;
}): Promise<HomepageProfile> {
  try {
    const res = await homepageApi.post("/profiles", data);
    return res.data;
  } catch (error) {
    throw handleApiError(error, "create homepage profile");
  }
}

export async function shareHomepageProfile(
  id: number,
  grant: {
    kind: "authenticated" | "role" | "user";
    roleId?: number;
    userId?: string;
  },
): Promise<void> {
  try {
    await homepageApi.post(`/profiles/${id}/share`, grant);
  } catch (error) {
    throw handleApiError(error, "share homepage profile");
  }
}

export async function updateHomepageProfile(
  id: number,
  visibility: "private" | "authenticated",
): Promise<void> {
  try {
    await homepageApi.put(`/profiles/${id}`, { visibility });
  } catch (error) {
    throw handleApiError(error, "update homepage profile");
  }
}
export async function updateHomepageProfileName(
  id: number,
  name: string,
): Promise<void> {
  try {
    await homepageApi.put(`/profiles/${id}`, { name });
  } catch (error) {
    throw handleApiError(error, "rename homepage profile");
  }
}

export async function deleteHomepageProfile(id: number): Promise<void> {
  try {
    await homepageApi.delete(`/profiles/${id}`);
  } catch (error) {
    throw handleApiError(error, "delete homepage profile");
  }
}
export async function getHomepageItems(): Promise<HomepageItemRow[]> {
  try {
    const res = await homepageApi.get("/items");
    return res.data;
  } catch (error) {
    throw handleApiError(error, "fetch homepage items");
  }
}

export async function createHomepageItem(data: {
  typeId: WidgetTypeId;
  title?: string | null;
  config?: Record<string, unknown>;
}): Promise<HomepageItemRow> {
  try {
    const res = await homepageApi.post("/items", data);
    return res.data;
  } catch (error) {
    throw handleApiError(error, "create homepage item");
  }
}

export async function updateHomepageItem(
  id: number,
  data: {
    title?: string | null;
    config?: Record<string, unknown>;
  },
): Promise<HomepageItemRow> {
  try {
    const res = await homepageApi.put(`/items/${id}`, data);
    return res.data;
  } catch (error) {
    throw handleApiError(error, "update homepage item");
  }
}

export async function deleteHomepageItem(id: number): Promise<void> {
  try {
    await homepageApi.delete(`/items/${id}`);
  } catch (error) {
    throw handleApiError(error, "delete homepage item");
  }
}

export async function getHomepageLayout(): Promise<HomepageLayoutRow | null> {
  try {
    const res = await homepageApi.get("/layout");
    return res.data;
  } catch (error) {
    throw handleApiError(error, "fetch homepage layout");
  }
}

export async function saveHomepageLayout(
  layout: HomepageLayoutData,
): Promise<HomepageLayoutRow> {
  try {
    const res = await homepageApi.put("/layout", layout);
    return res.data;
  } catch (error) {
    throw handleApiError(error, "save homepage layout");
  }
}
