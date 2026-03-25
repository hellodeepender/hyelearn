export type MascotPose = "happy" | "thinking" | "celebrating" | "sad" | "reading" | "sleeping";

const MASCOT_POSES: Record<string, Partial<Record<MascotPose, string>>> = {
  hy: {
    happy: "/mascots/hy-happy.jpg",
    thinking: "/mascots/hy-thinking.jpg",
    celebrating: "/mascots/hy-celebrating.jpg",
    sad: "/mascots/hy-sad.jpg",
    reading: "/mascots/hy-reading.jpg",
    sleeping: "/mascots/hy-sleeping.jpg",
  },
  ar: {
    happy: "/mascots/ar-happy.jpg",
    thinking: "/mascots/ar-thinking.jpg",
    celebrating: "/mascots/ar-celebrating.jpg",
    sad: "/mascots/ar-sad.jpg",
    reading: "/mascots/ar-reading.jpg",
    sleeping: "/mascots/ar-sleeping.jpg",
  },
  el: {
    happy: "/mascots/el-happy.jpg",
    thinking: "/mascots/el-thinking.jpg",
    celebrating: "/mascots/el-celebrating.jpg",
    sad: "/mascots/el-sad.jpg",
    reading: "/mascots/el-reading.jpg",
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
  return poses[pose] ?? poses["happy"] ?? "/mascots/hy-happy.jpg";
}

/** Get mascot name for a locale */
export function getMascotName(locale: string): string {
  return MASCOT_NAMES[locale] ?? MASCOT_NAMES["hy"];
}
