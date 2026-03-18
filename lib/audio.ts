export function getWordAudioUrl(word: string, locale: string = "hy"): string {
  return `/api/tts?text=${encodeURIComponent(word)}&locale=${locale}`;
}
