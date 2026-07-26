import { useCallback, useSyncExternalStore } from "react";

import {
  getCompetitiveMode,
  setCompetitiveMode,
  subscribeCompetitiveMode,
} from "@/lib/competitive-mode";

export function useCompetitiveMode() {
  const enabled = useSyncExternalStore(subscribeCompetitiveMode, getCompetitiveMode, () => false);

  const setEnabled = useCallback((next: boolean) => {
    setCompetitiveMode(next);
  }, []);

  return { enabled, setEnabled };
}
