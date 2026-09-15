import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Server, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  getSharedHostSelections,
  getSharedHosts,
  removeSharedHostSelection,
  selectSharedHost,
} from "@/main-axios";
import {
  mergeSharedHostSelections,
  type SharedHostCatalogRow,
} from "./shared-host-catalog";

export function SharedHostsCatalog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<SharedHostCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingHostId, setUpdatingHostId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ sharedHosts }, { selections }] = await Promise.all([
        getSharedHosts(),
        getSharedHostSelections(),
      ]);
      setRows(mergeSharedHostSelections(sharedHosts, selections));
    } catch {
      setError("Unable to load shared hosts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(host: SharedHostCatalogRow) {
    setUpdatingHostId(host.id);
    try {
      if (host.selected) {
        await removeSharedHostSelection(host.id);
      } else {
        await selectSharedHost(host.id, null);
      }
      await load();
      window.dispatchEvent(new CustomEvent("termix:hosts-changed"));
    } catch {
      toast.error(`Unable to update ${host.name ?? host.ip}.`);
    } finally {
      setUpdatingHostId(null);
    }
  }

  return (
    <section className="flex flex-col flex-1 min-h-0" aria-label="Shared Hosts">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border/60 shrink-0">
        <Users className="size-4 text-accent-brand" />
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-semibold truncate">Shared Hosts</h2>
          <p className="text-[10px] text-muted-foreground">
            Choose shared hosts for your sidebar
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Refresh shared hosts"
          title="Refresh shared hosts"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close Shared Hosts"
          title="Close Shared Hosts"
        >
          <X className="size-3.5" />
        </button>
      </header>

      {error ? (
        <div className="p-4 text-xs text-destructive">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="p-4 text-xs text-muted-foreground">
          Loading shared hosts…
        </div>
      ) : rows.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground">
          No shared hosts available.
        </div>
      ) : (
        <div className="overflow-y-auto p-2 space-y-1">
          {rows.map((host) => (
            <div
              key={host.id}
              className="flex items-center gap-2 px-2.5 py-2 border border-border/60 rounded-sm"
            >
              <Server className="size-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{host.name || host.ip}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {host.ip}:{host.port} · {host.username}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void toggle(host)}
                disabled={updatingHostId === host.id}
                aria-pressed={host.selected}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] border rounded-sm transition-colors ${
                  host.selected
                    ? "border-accent-brand/60 text-accent-brand bg-accent-brand/10"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                } disabled:opacity-50`}
              >
                {host.selected && <Check className="size-3" />}
                {host.selected ? "In Shared Hosts" : "Use shared host"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
