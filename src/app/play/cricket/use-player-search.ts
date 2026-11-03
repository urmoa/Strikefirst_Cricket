"use client";

import { useEffect, useState } from "react";

export interface PlayerSearchResult {
  id: number;
  displayName: string;
}

interface PlayerSearchState {
  query: string;
  players: PlayerSearchResult[];
  loading: boolean;
  failed: boolean;
}

export function usePlayerSearch(value: string, enabled = true) {
  const query = value.trim();
  const [search, setSearch] = useState<PlayerSearchState>({ query: "", players: [], loading: false, failed: false });

  useEffect(() => {
    if (!enabled || query.length < 2) {
      setSearch({ query, players: [], loading: false, failed: false });
      return;
    }
    const controller = new AbortController();
    setSearch({ query, players: [], loading: true, failed: false });
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/players?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("search_unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) setSearch({ query, players: data.players, loading: false, failed: false });
      } catch {
        if (!controller.signal.aborted) setSearch({ query, players: [], loading: false, failed: true });
      }
    }, 250);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, enabled]);

  // Hide a previous query's result before the effect for the new query runs.
  return enabled && query.length >= 2
    ? search.query === query ? search : { query, players: [], loading: true, failed: false }
    : { query, players: [], loading: false, failed: false };
}
