export function getWordAudioUrl(word: string): string {
  return `/api/tts?text=${encodeURIComponent(word)}`;
}
