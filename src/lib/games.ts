import { t } from "./i18n.ts";
﻿export const games = [
  {
    slug: "x01",
    name: t("x01.name"),
    description: t("games.inDevelopment"),
  },
  {
    slug: "cricket",
    name: t("cricket.name"),
    description: t("games.cricketDescription"),
  },
] as const;

export type Game = typeof games[number];
