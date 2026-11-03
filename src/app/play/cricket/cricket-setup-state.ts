import { CRICKET_TARGETS, type CricketLegFormat, type CricketTarget, type CricketVariant } from "../../../lib/cricket.ts";

export interface CricketSetupPlayer {
  id: number;
  name: string;
  marksToClose: number;
  playerId?: number;
}

export interface CricketSetupValues {
  players: CricketSetupPlayer[];
  guestName: string;
  bestOf: CricketLegFormat;
  targets: CricketTarget[];
  alternative1v1View: boolean;
  selectedVariant: CricketVariant | null;
}

export function createCricketSetupValues(): CricketSetupValues {
  return { players: [], guestName: "", bestOf: 1, targets: [...CRICKET_TARGETS],
    alternative1v1View: true, selectedVariant: null };
}

export function getCricketSetupVariant(values: CricketSetupValues): CricketVariant {
  return values.selectedVariant ?? (values.players.length > 2 ? "cutthroat" : "standard");
}
