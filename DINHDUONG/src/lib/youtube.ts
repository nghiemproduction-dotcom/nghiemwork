export function getYouTubeEmbedUrl(input: string): string {
  // If it's already just an ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return `https://www.youtube.com/embed/${input}`;
  }
  const regExp = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = input.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : input;
}
