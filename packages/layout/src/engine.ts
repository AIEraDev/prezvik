import { layoutHero } from "./strategies/hero";
import { layoutStatTrio } from "./strategies/stat-trio";

export const layoutRegistry = {
  hero: layoutHero,
  "stat-trio": layoutStatTrio,
};
