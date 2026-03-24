"use client";

import { useEffect } from "react";
import { preloadSounds } from "@/lib/sounds";

export default function SoundPreloader() {
  useEffect(() => { preloadSounds(); }, []);
  return null;
}
