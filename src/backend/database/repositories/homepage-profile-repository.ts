import { eq } from "drizzle-orm";
import {
  homepageProfileAccess,
  homepageProfileItems,
  homepageProfileLayouts,
  homepageProfiles,
} from "../db/schema.js";
import type { DatabaseContext } from "./database-context.js";
import { insertReturning } from "./returning.js";

export const PORTABLE_HOMEPAGE_WIDGETS = new Set([
  "service_link",
  "clock",
  "notes",
  "bookmark_list",
  "weather",
  "image_widget",
  "markdown_notes",
  "rss_feed",
  "text_banner",
]);

export type HomepageProfileEntry = {
  typeId: string;
  title?: string | null;
  config?: Record<string, unknown>;
};
export type HomepageProfileInput = {
  entries: HomepageProfileEntry[];
  layout: Record<string, unknown>;
};
export type HomepageProfileGrant =
  | { kind: "authenticated" }
  | { kind: "user"; userId: string }
  | { kind: "role"; roleId: number };
export type HomepageProfileVisibility = "private" | "authenticated";

export type HomepageProfile = typeof homepageProfiles.$inferSelect & {
  items: Array<typeof homepageProfileItems.$inferSelect>;
  layout: Record<string, unknown>;
};

export function sanitizeHomepageEntries(entries: HomepageProfileEntry[]) {
  return entries
    .filter((entry) => PORTABLE_HOMEPAGE_WIDGETS.has(entry.typeId))
    .map((entry) => ({
      typeId: entry.typeId,
      title: entry.title ?? null,
      config: JSON.stringify(entry.config ?? {}),
    }));
}

export class HomepageProfileRepository {
  constructor(
    private readonly context: DatabaseContext,
    private readonly onWrite?: () => void | Promise<void>,
  ) {}

  async create(
    ownerId: string,
    name: string,
    input: HomepageProfileInput,
  ): Promise<HomepageProfile> {
    const [profile] = await insertReturning(this.context, homepageProfiles, {
      ownerId,
      name,
      visibility: "private",
    });
    const items = [];
    for (const item of sanitizeHomepageEntries(input.entries)) {
      const [created] = await insertReturning(
        this.context,
        homepageProfileItems,
        { profileId: profile.id, ...item },
      );
      items.push(created);
    }
    const [layout] = await insertReturning(
      this.context,
      homepageProfileLayouts,
      {
        profileId: profile.id,
        layout: JSON.stringify(input.layout),
      },
    );
    await this.onWrite?.();
    return { ...profile, items, layout: JSON.parse(layout.layout) };
  }

  async grant(profileId: number, grant: HomepageProfileGrant): Promise<void> {
    if (grant.kind === "authenticated") {
      await this.context.drizzle
        .insert(homepageProfileAccess)
        .values({ profileId, accessKind: "authenticated" });
    } else if (grant.kind === "user") {
      await this.context.drizzle
        .insert(homepageProfileAccess)
        .values({ profileId, userId: grant.userId, accessKind: "user" });
    } else {
      await this.context.drizzle
        .insert(homepageProfileAccess)
        .values({ profileId, roleId: grant.roleId, accessKind: "role" });
    }
    await this.onWrite?.();
  }

  async updateVisibility(
    profileId: number,
    visibility: HomepageProfileVisibility,
  ): Promise<void> {
    await this.context.drizzle
      .update(homepageProfiles)
      .set({ visibility })
      .where(eq(homepageProfiles.id, profileId));
    await this.onWrite?.();
  }

  async updateName(profileId: number, name: string): Promise<void> {
    await this.context.drizzle
      .update(homepageProfiles)
      .set({ name })
      .where(eq(homepageProfiles.id, profileId));
    await this.onWrite?.();
  }

  async delete(profileId: number): Promise<void> {
    await this.context.drizzle
      .delete(homepageProfiles)
      .where(eq(homepageProfiles.id, profileId));
    await this.onWrite?.();
  }

  async listVisible(
    userId: string,
    roleIds: number[],
  ): Promise<HomepageProfile[]> {
    const profiles = await this.context.drizzle.select().from(homepageProfiles);
    const access = await this.context.drizzle
      .select()
      .from(homepageProfileAccess);
    const allowed = new Set(
      access
        .filter(
          (row) =>
            row.accessKind === "authenticated" ||
            (row.accessKind === "user" && row.userId === userId) ||
            (row.accessKind === "role" &&
              row.roleId !== null &&
              roleIds.includes(row.roleId)),
        )
        .map((row) => row.profileId),
    );
    return Promise.all(
      profiles
        .filter(
          (profile) =>
            profile.ownerId === userId ||
            profile.visibility === "authenticated" ||
            allowed.has(profile.id),
        )
        .map((profile) => this.hydrate(profile)),
    );
  }

  async importCopy(
    userId: string,
    sourceId: number,
    name: string,
  ): Promise<HomepageProfile> {
    const source = await this.hydrateById(sourceId);
    if (!source) throw new Error("Homepage profile not found");
    return this.create(userId, name, {
      entries: source.items.map((item) => ({
        typeId: item.typeId,
        title: item.title,
        config: JSON.parse(item.config),
      })),
      layout: source.layout,
    });
  }

  private async hydrateById(id: number) {
    const rows = await this.context.drizzle
      .select()
      .from(homepageProfiles)
      .where(eq(homepageProfiles.id, id))
      .limit(1);
    return rows[0] ? this.hydrate(rows[0]) : null;
  }

  private async hydrate(
    profile: typeof homepageProfiles.$inferSelect,
  ): Promise<HomepageProfile> {
    const items = await this.context.drizzle
      .select()
      .from(homepageProfileItems)
      .where(eq(homepageProfileItems.profileId, profile.id));
    const layouts = await this.context.drizzle
      .select()
      .from(homepageProfileLayouts)
      .where(eq(homepageProfileLayouts.profileId, profile.id))
      .limit(1);
    return {
      ...profile,
      items,
      layout: JSON.parse(layouts[0]?.layout ?? "{}"),
    };
  }
}
