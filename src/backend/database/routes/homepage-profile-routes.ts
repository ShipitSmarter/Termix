import express, { type Request, type Response } from "express";
import type { AuthenticatedRequest } from "../../../types/index.js";
import {
  createCurrentHomepageProfileRepository,
  createCurrentRoleRepository,
} from "../repositories/factory.js";

export const homepageProfilesRouter = express.Router();

homepageProfilesRouter.get("/", async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;
  const roleIds = await createCurrentRoleRepository().listUserRoleIds(userId);
  res.json(
    (
      await createCurrentHomepageProfileRepository().listVisible(
        userId,
        roleIds,
      )
    ).map((profile) => ({ ...profile, owned: profile.ownerId === userId })),
  );
});

homepageProfilesRouter.post("/", async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { name, entries, layout } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || !Array.isArray(entries)) {
    return res.status(400).json({ error: "name and entries are required" });
  }
  const profile = await createCurrentHomepageProfileRepository().create(
    userId,
    name.trim(),
    { entries, layout: layout ?? {} },
  );
  res.status(201).json(profile);
});

homepageProfilesRouter.post(
  "/:id/share",
  async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;
    const id = Number(req.params.id);
    const repo = createCurrentHomepageProfileRepository();
    const own = (await repo.listVisible(userId, [])).find(
      (profile) => profile.id === id && profile.ownerId === userId,
    );
    if (!own)
      return res.status(404).json({ error: "Homepage profile not found" });
    const grant =
      req.body?.kind === "authenticated"
        ? { kind: "authenticated" as const }
        : req.body?.kind === "role" && Number.isInteger(req.body.roleId)
          ? { kind: "role" as const, roleId: req.body.roleId }
          : typeof req.body?.userId === "string"
            ? { kind: "user" as const, userId: req.body.userId }
            : null;
    if (!grant)
      return res
        .status(400)
        .json({ error: "kind must be authenticated, role, or user" });
    await repo.grant(id, grant);
    res.json({ success: true });
  },
);

homepageProfilesRouter.put("/:id", async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;
  const id = Number(req.params.id);
  const visibility = req.body?.visibility;
  if (visibility !== "private" && visibility !== "authenticated") {
    return res
      .status(400)
      .json({ error: "visibility must be private or authenticated" });
  }
  const repo = createCurrentHomepageProfileRepository();
  const own = (await repo.listVisible(userId, [])).some(
    (profile) => profile.id === id && profile.ownerId === userId,
  );
  if (!own)
    return res.status(404).json({ error: "Homepage profile not found" });
  await repo.updateVisibility(id, visibility);
  res.json({ success: true });
});

homepageProfilesRouter.post(
  "/:id/import",
  async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;
    const id = Number(req.params.id);
    const roleIds = await createCurrentRoleRepository().listUserRoleIds(userId);
    const visible = (
      await createCurrentHomepageProfileRepository().listVisible(
        userId,
        roleIds,
      )
    ).some((profile) => profile.id === id);
    if (!visible)
      return res.status(404).json({ error: "Homepage profile not found" });
    res
      .status(201)
      .json(
        await createCurrentHomepageProfileRepository().importCopy(userId, id),
      );
  },
);
