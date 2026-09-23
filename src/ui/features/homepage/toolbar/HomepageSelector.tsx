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
  updateHomepageProfileName,
  deleteHomepageProfile,
} from "@/api/homepage-api";
import { getRoles } from "@/api/rbac-api";

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
  const [grantKind, setGrantKind] = useState<"role">("role");
  const [grantValue, setGrantValue] = useState("");
  const [renameProfileId, setRenameProfileId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [importProfileId, setImportProfileId] = useState<number | null>(null);
  const [importName, setImportName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState<import("@/main-axios").Role[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setTargetsLoading(true);
    getRoles().then(
      (result) => {
        if (!active) return;
        setRoles(result.roles);
        setTargetsLoading(false);
      },
      () => {
        if (active) setTargetsLoading(false);
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
    if (!value) return setMessage("Select a role.");
    setBusy(true);
    try {
      await shareHomepageProfile(profile.id, {
        kind: "role",
        roleId: Number(value),
      });
      setGrantValue("");
      setMessage("Role grant added.");
      onProfilesChanged();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add grant.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function renameProfile(profile: HomepageProfile) {
    const nextName = renameValue.trim();
    if (!nextName) return setMessage("Enter a profile name.");
    setBusy(true);
    try {
      await updateHomepageProfileName(profile.id, nextName);
      setRenameProfileId(null);
      setMessage("Profile renamed.");
      onProfilesChanged();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not rename profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteProfile(profile: HomepageProfile) {
    if (!window.confirm(`Delete Homepage “${profile.name}”?`)) return;
    setBusy(true);
    try {
      await deleteHomepageProfile(profile.id);
      if (selectedId === profile.id) onChange(null);
      setMessage("Profile deleted.");
      onProfilesChanged();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function importProfile(profile: HomepageProfile) {
    const nextName = importName.trim();
    if (!nextName) return setMessage("Enter a name for the imported Homepage.");
    setBusy(true);
    try {
      const copy = await importHomepageProfile(profile.id, nextName);
      setImportProfileId(null);
      setImportName("");
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
                <div className="mb-1 flex items-center justify-between gap-2">
                  {renameProfileId === profile.id ? (
                    <input
                      aria-label={`${profile.name} profile name`}
                      className="min-w-0 flex-1 border border-border bg-background px-2 py-1"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                    />
                  ) : (
                    <span className="font-medium">{profile.name}</span>
                  )}
                  <span className="text-muted-foreground">Owned</span>
                </div>
                {renameProfileId === profile.id ? (
                  <div className="mb-2 flex gap-1">
                    <button
                      type="button"
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => renameProfile(profile)}
                    >
                      Save name
                    </button>
                    <button
                      type="button"
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => setRenameProfileId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mb-2 flex gap-1">
                    <button
                      type="button"
                      aria-label={`Rename ${profile.name}`}
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => {
                        setRenameProfileId(profile.id);
                        setRenameValue(profile.name);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${profile.name}`}
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => deleteProfile(profile)}
                    >
                      Delete
                    </button>
                  </div>
                )}
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
                {profile.visibility !== "authenticated" && (
                  <div className="mt-2 flex gap-1">
                    <select
                      aria-label={`${profile.name} grant type`}
                      className="border border-border bg-card px-2 py-1 text-xs text-foreground"
                      style={{ colorScheme: "dark" }}
                      value={grantKind}
                      onChange={(event) => {
                        setGrantKind(event.target.value as "role");
                        setGrantValue("");
                      }}
                    >
                      <option value="role">Role ID</option>
                    </select>
                    <select
                      aria-label="Grant value"
                      className="min-w-0 flex-1 border border-border bg-background px-2 py-1 text-xs text-foreground"
                      style={{ colorScheme: "dark" }}
                      value={grantValue}
                      disabled={busy || targetsLoading}
                      onChange={(event) => setGrantValue(event.target.value)}
                    >
                      <option value="">
                        {targetsLoading ? "Loading..." : "Select a role"}
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={String(role.id)}>
                          {role.displayName} ({role.id})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => addGrant(profile)}
                    >
                      Grant role
                    </button>
                  </div>
                )}
              </div>
            ))}
            {profiles
              .filter((profile) => !profile.owned)
              .map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between gap-2 border-b border-border py-1 last:border-0"
                >
                  <span>
                    {profile.name}{" "}
                    <span className="text-muted-foreground">(shared)</span>
                  </span>
                  {importProfileId === profile.id ? (
                    <div className="flex min-w-0 gap-1">
                      <input
                        aria-label="Imported profile name"
                        className="min-w-0 w-32 border border-border bg-background px-2 py-1"
                        value={importName}
                        onChange={(event) => setImportName(event.target.value)}
                        placeholder="New name"
                      />
                      <button
                        type="button"
                        className="border border-border px-2 py-1"
                        disabled={busy}
                        onClick={() => importProfile(profile)}
                      >
                        Import
                      </button>
                      <button
                        type="button"
                        className="border border-border px-2 py-1"
                        disabled={busy}
                        onClick={() => setImportProfileId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="border border-border px-2 py-1"
                      disabled={busy}
                      onClick={() => {
                        setImportProfileId(profile.id);
                        setImportName("");
                      }}
                    >
                      Import
                    </button>
                  )}
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
