export type MascotPose = "happy" | "thinking" | "celebrating" | "sad" | "reading" | "sleeping";

const MASCOT_POSES: Record<string, Partial<Record<MascotPose, string>>> = {
  hy: {
    happy: "/mascots/hy-happy.png",
    thinking: "/mascots/hy-thinking.png",
    celebrating: "/mascots/hy-celebrating.png",
    sad: "/mascots/hy-sad.png",
    reading: "/mascots/hy-reading.png",
    sleeping: "/mascots/hy-sleeping.png",
  },
  ar: {
    happy: "/mascots/ar-happy.png",
    thinking: "/mascots/ar-thinking.png",
    celebrating: "/mascots/ar-celebrating.png",
    sad: "/mascots/ar-sad.png",
    reading: "/mascots/ar-reading.png",
    sleeping: "/mascots/ar-sleeping.png",
  },
  el: {
    happy: "/mascots/el-happy.png",
    thinking: "/mascots/el-thinking.png",
    celebrating: "/mascots/el-celebrating.png",
    sad: "/mascots/el-sad.png",
    reading: "/mascots/el-reading.png",
  },
};

const MASCOT_NAMES: Record<string, string> = {
  hy: "Nouri",
  ar: "Zaytoun",
  el: "Sophia",
};

/** Get mascot image path for a locale and pose. Falls back to happy. */
export function getMascot(locale: string, pose: MascotPose = "happy"): string {
  const poses = MASCOT_POSES[locale] ?? MASCOT_POSES["hy"];
  return poses[pose] ?? poses["happy"] ?? "/mascots/hy-happy.png";
}

/** Get mascot name for a locale */
export function getMascotName(locale: string): string {
  return MASCOT_NAMES[locale] ?? MASCOT_NAMES["hy"];
}
