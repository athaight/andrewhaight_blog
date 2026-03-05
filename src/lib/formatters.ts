/**
 * Formats a date string into a human-friendly format
 * @param dateString ISO date string
 * @returns Formatted date like "March 5, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculates estimated reading time based on word count
 * Uses 200 words per minute as average reading speed
 * @param content Markdown content
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // At least 1 minute
}

/**
 * Gets a human-friendly reading time string
 * @param content Markdown content
 * @returns String like "6 minute read" or "1 minute read"
 */
export function getReadingTimeString(content: string): string {
  const minutes = calculateReadingTime(content);
  return `${minutes} minute read`;
}
