"use client";

import { useEffect, useState } from "react";
import type { CricketInputMode } from "@/lib/cricket";

export function useCricketInputMode(players: number, turnMode: CricketInputMode | null): CricketInputMode {
  const [smallViewport, setSmallViewport] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(width < 760px) and (height < 1020px)");
    const update = () => setSmallViewport(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return turnMode ?? (players >= 2 && smallViewport ? "marks" : "darts");
}
