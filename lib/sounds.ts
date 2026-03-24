const SOUNDS = {
  correct: "/sounds/correct.wav",
  wrong: "/sounds/wrong.wav",
  tap: "/sounds/tap.wav",
  complete: "/sounds/complete.wav",
} as const;

type SoundName = keyof typeof SOUNDS;

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

/** Preload all sounds (call once on mount) */
export function preloadSounds() {
  if (typeof window === "undefined") return;
  for (const [key, src] of Object.entries(SOUNDS)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.5;
    cache[key as SoundName] = audio;
  }
}

/** Play a sound effect. Clones the audio so overlapping plays work. */
export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  const src = SOUNDS[name];
  if (!src) return;
  try {
    const original = cache[name];
    if (original) {
      const clone = original.cloneNode() as HTMLAudioElement;
      clone.volume = 0.5;
      clone.play().catch(() => {});
    } else {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  } catch {}
}
