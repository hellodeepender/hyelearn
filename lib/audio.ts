const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function getWordAudioUrl(word: string): string {
  const encoded = encodeURIComponent(word);
  return `${SUPABASE_URL}/storage/v1/object/public/audio/words/${encoded}.mp3`;
}
