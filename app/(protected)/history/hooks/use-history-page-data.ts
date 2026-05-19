"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/client/api-client";
import type { SessionHistoryItem, SessionStats } from "@/lib/client/types";

type HistoryPageDataState = {
  error: string | null;
  history: SessionHistoryItem[];
  loading: boolean;
  stats: SessionStats | null;
};

export function useHistoryPageData() {
  const [state, setState] = useState<HistoryPageDataState>({
    error: null,
    history: [],
    loading: true,
    stats: null,
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setState((current) => ({ ...current, error: null, loading: true }));

      const [historyResult, statsResult] = await Promise.all([
        apiGet<SessionHistoryItem[]>("/api/session/history"),
        apiGet<SessionStats>("/api/session/stats"),
      ]);

      if (!active) {
        return;
      }

      if (!historyResult.success) {
        setState({ error: historyResult.error.message, history: [], loading: false, stats: null });
        return;
      }

      if (!statsResult.success) {
        setState({ error: statsResult.error.message, history: [], loading: false, stats: null });
        return;
      }

      setState({
        error: null,
        history: historyResult.data,
        loading: false,
        stats: statsResult.data,
      });
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
