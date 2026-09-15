import { and, desc, eq, sql } from "drizzle-orm";
import { sharedHostSelections } from "../db/schema.js";
import type { DatabaseContext } from "./database-context.js";
import {
  deleteReturning,
  insertReturning,
  updateReturning,
} from "./returning.js";

export type SharedHostSelection = typeof sharedHostSelections.$inferSelect;

export class SharedHostSelectionRepository {
  constructor(
    private readonly context: DatabaseContext,
    private readonly onWrite?: () => void | Promise<void>,
  ) {}

  async listByUserId(userId: string): Promise<SharedHostSelection[]> {
    return this.context.drizzle
      .select()
      .from(sharedHostSelections)
      .where(eq(sharedHostSelections.userId, userId))
      .orderBy(desc(sharedHostSelections.updatedAt));
  }

  async findByUserAndHost(
    userId: string,
    hostId: number,
  ): Promise<SharedHostSelection | null> {
    const rows = await this.context.drizzle
      .select()
      .from(sharedHostSelections)
      .where(
        and(
          eq(sharedHostSelections.userId, userId),
          eq(sharedHostSelections.hostId, hostId),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async upsertForUser(
    userId: string,
    hostId: number,
    folder: string | null,
  ): Promise<SharedHostSelection> {
    const existing = await this.findByUserAndHost(userId, hostId);
    if (existing) {
      const rows = await updateReturning(
        this.context,
        sharedHostSelections,
        { folder, updatedAt: sql`CURRENT_TIMESTAMP` },
        eq(sharedHostSelections.id, existing.id),
      );
      await this.afterWrite();
      return rows[0] ?? { ...existing, folder };
    }

    const rows = await insertReturning(this.context, sharedHostSelections, {
      userId,
      hostId,
      folder,
    });
    await this.afterWrite();
    return rows[0];
  }

  async deleteForUser(userId: string, hostId: number): Promise<boolean> {
    const rows = await deleteReturning(
      this.context,
      sharedHostSelections,
      and(
        eq(sharedHostSelections.userId, userId),
        eq(sharedHostSelections.hostId, hostId),
      ),
    );
    if (rows.length > 0) await this.afterWrite();
    return rows.length > 0;
  }

  private async afterWrite(): Promise<void> {
    await this.onWrite?.();
  }
}
