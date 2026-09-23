import { useState, useEffect } from "react";
import type {
  HomepageLayoutData,
  HomepageProfile,
  CanvasWidget,
} from "@/types/homepage-types";
import {
  createHomepageProfile,
  importHomepageProfile,
  shareHomepageProfile,
  updateHomepageProfile,
} from "@/api/homepage-api";
import { getRoles } from "@/api/rbac-api";
import { getUserList } from "@/api/user-management-api";

interface HomepageSelectorProps {
  profiles: HomepageProfile[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
  unavailable?: boolean;
  personalWidgets: CanvasWidget[];
  personalLayout: HomepageLayoutData;
  onProfilesChanged: () => void;
}

export function HomepageSelector({
  profiles,
  selectedId,
  onChange,
  unavailable,
  personalWidgets,
  personalLayout,
  onProfilesChanged,
}: HomepageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grantKind, setGrantKind] = useState<"authenticated" | "role" | "user">(
    "authenticated",
  );
  const [grantValue, setGrantValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState<import("@/main-axios").Role[]>([]);
  const [users, setUsers] = useState<import("@/main-axios").UserInfo[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setTargetsLoading(true);
    Promise.allSettled([getRoles(), getUserList()]).then(
      ([rolesResult, usersResult]) => {
        if (!active) return;
        if (rolesResult.status === "fulfilled")
          setRoles(rolesResult.value.roles);
        if (usersResult.status === "fulfilled")
          setUsers(usersResult.value.users);
        setTargetsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [open]);

  const owned = profiles.filter((profile) => profile.owned);

  async function createProfile() {
    if (!name.trim()) return setMessage("Enter a profile name.");
    setBusy(true);
    try {
      const created = await createHomepageProfile({
        name: name.trim(),
        entries: personalWidgets.map((widget) => ({
          typeId: widget.typeId,
          title: widget.title,
          config: widget.config,
        })),
        layout: personalLayout,
      });
      setName("");
      setMessage("Profile created.");
      onProfilesChanged();
      onChange(created.id);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveVisibility(
    profile: HomepageProfile,
    next: "private" | "authenticated",
  ) {
    setBusy(true);
    try {
      await updateHomepageProfile(profile.id, next);
      setMessage("Visibility updated.");
      onProfilesChanged();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addGrant(profile: HomepageProfile) {
    const value = grantValue.trim();
    if (grantKind !== "authenticated" && !value)
      return setMessage("Enter a user ID or role ID.");
    setBusy(true);
    try {
      await shareHomepageProfile(
        profile.id,
        grantKind === "role"
          ? { kind: "role", roleId: Number(value) }
          : grantKind === "user"
            ? { kind: "user", userId: value }
            : { kind: "authenticated" },
      );
      setGrantValue("");
      setMessage("Grant added.");
      onProfilesChanged();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add grant.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function importProfile(profile: HomepageProfile) {
    setBusy(true);
    try {
      const copy = await importHomepageProfile(profile.id);
      onProfilesChanged();
      onChange(copy.id);
      setMessage("Profile imported as a personal copy.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not import profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="absolute top-3 left-3 z-30 flex items-start gap-2"
      data-canvas-interactive
      onMouseDown={(event) => event.stopPropagation()}
      onMouseMove={(event) => event.stopPropagation()}
      onMouseUp={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <label
        className="mt-1 text-xs text-muted-foreground"
        htmlFor="homepage-profile-select"
      >
        Homepage
      </label>
      <div className="relative">
        <div className="flex items-center gap-1">
          <select
            id="homepage-profile-select"
            aria-label="Active Homepage"
            className="bg-card border border-border px-2 py-1 text-xs"
            value={selectedId === null ? "personal" : String(selectedId)}
            onChange={(event) =>
              onChange(
                event.target.value === "personal"
                  ? null
                  : Number(event.target.value),
              )
            }
          >
            <option value="personal">Personal Homepage</option>
            {unavailable &&
              selectedId !== null &&
              !profiles.some((profile) => profile.id === selectedId) && (
                <option value={String(selectedId)}>Unavailable Homepage</option>
              )}
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="border border-border bg-card px-2 py-1 text-xs"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Manage
          </button>
        </div>
        {unavailable && (
          <div role="status" className="mt-1 text-xs text-amber-600">
            This Homepage is unavailable. Select another Homepage.
          </div>
        )}
        {open && (
          <div className="absolute left-0 mt-1 w-80 border border-border bg-card p-3 text-xs shadow-lg">
            <div className="mb-2 font-semibold">Homepage profiles</div>
            <div className="mb-3 border-b border-border pb-3">
              <div className="mb-1 text-muted-foreground">
                Create from current personal Homepage
              </div>
              <div className="flex gap-1">
                <input
                  aria-label="New profile name"
                  className="min-w-0 flex-1 border border-border bg-background px-2 py-1"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Profile name"
                />
                <button
                  type="button"
                  className="border border-border px-2 py-1"
                  disabled={busy}
                  onClick={createProfile}
                >
                  Create
                </button>
              </div>
            </div>
            {owned.length === 0 && (
              <div className="text-muted-foreground">
                No owned profiles yet.
              </div>
            )}
            {owned.map((profile) => (
              <div
                key={profile.id}
                className="mb-3 border-b border-border pb-3 last:border-0"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{profile.name}</span>
                  <span className="text-muted-foreground">Owned</span>
                </div>
                <label className="flex items-center gap-2 text-muted-foreground">
                  Visibility
                  <select
                    aria-label={`${profile.name} visibility`}
                    className="border border-border bg-card px-2 py-1 text-xs text-foreground"
                    style={{ colorScheme: "dark" }}
                    value={
                      profile.visibility === "authenticated"
                        ? "authenticated"
                        : "private"
                    }
                    disabled={busy}
                    onChange={(event) =>
                      saveVisibility(
                        profile,
                        event.target.value as "private" | "authenticated",
                      )
                    }
                  >
                    <option value="private">Private</option>
                    <option value="authenticated">All signed-in users</option>
                  </select>
                </label>
                <div className="mt-2 flex gap-1">
                  <select
                    aria-label={`${profile.name} grant type`}
                    className="border border-border bg-card px-2 py-1 text-xs text-foreground"
                    style={{ colorScheme: "dark" }}
                    value={grantKind}
                    onChange={(event) => {
                      setGrantKind(event.target.value as typeof grantKind);
                      setGrantValue("");
                    }}
                  >
                    <option value="authenticated">Everyone signed in</option>
                    <option value="role">Role ID</option>
                    <option value="user">User ID</option>
                  </select>
                  {grantKind !== "authenticated" && (
                    <select
                      aria-label="Grant value"
                      className="min-w-0 flex-1 border border-border bg-background px-2 py-1 text-xs text-foreground"
                      style={{ colorScheme: "dark" }}
                      value={grantValue}
                      disabled={busy || targetsLoading}
                      onChange={(event) => setGrantValue(event.target.value)}
                    >
                      <option value="">
                        {targetsLoading
                          ? "Loading..."
                          : grantKind === "role"
                            ? "Select a role"
                            : "Select a user"}
                      </option>
                      {grantKind === "role"
                        ? roles.map((role) => (
                            <option key={role.id} value={String(role.id)}>
                              {role.displayName} ({role.id})
                            </option>
                          ))
                        : users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                              {user.username} ({user.userId})
                            </option>
                          ))}
                    </select>
                  )}
                  <button
                    type="button"
                    className="border border-border px-2 py-1"
                    disabled={busy}
                    onClick={() => addGrant(profile)}
                  >
                    Grant
                  </button>
                </div>
              </div>
            ))}
            {profiles
              .filter((profile) => !profile.owned)
              .map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between border-b border-border py-1 last:border-0"
                >
                  <span>
                    {profile.name}{" "}
                    <span className="text-muted-foreground">(shared)</span>
                  </span>
                  <button
                    type="button"
                    className="border border-border px-2 py-1"
                    disabled={busy}
                    onClick={() => importProfile(profile)}
                  >
                    Import
                  </button>
                </div>
              ))}
            {message && (
              <div role="status" className="mt-2 text-muted-foreground">
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
