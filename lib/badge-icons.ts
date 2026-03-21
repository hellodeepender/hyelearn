import type { ComponentType } from "react";
import {
  Pomegranate, Khachkar, Duduk, MountArarat, GarniTemple, Monastery,
  Amphora, SpartanHelmet, LaurelWreath, OliveBranch, GreekColumns, Lyre, Oracle,
} from "@/components/curriculum/MapIcons";

// Map badge slugs to their SVG icon components.
// Badges not in this map fall back to their emoji.
export const BADGE_ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  // Armenian
  pomegranate: Pomegranate,
  khachkar: Khachkar,
  duduk: Duduk,
  ararat: MountArarat,
  garni: GarniTemple,
  tatev: Monastery,
  // Greek
  olive_branch: OliveBranch,
  alpha_omega: Amphora,
  lyre: Lyre,
  olympus: SpartanHelmet,
  parthenon: GreekColumns,
  delphi: Oracle,
};

export function getBadgeIcon(slug: string): ComponentType<{ size?: number }> | null {
  return BADGE_ICON_MAP[slug] ?? null;
}
