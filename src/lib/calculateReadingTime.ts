/**
 * Calculate estimated reading time for text content
 * @param content - The text content to analyze (markdown or plain text)
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  if (!content || content.trim().length === 0) {
    return 1; // Minimum 1 minute for empty content
  }

  // Remove markdown formatting to get accurate word count
  // Remove code blocks
  let cleanContent = content.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  cleanContent = cleanContent.replace(/`[^`]*`/g, '');
  // Remove links
  cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images
  cleanContent = cleanContent.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Remove headings markup
  cleanContent = cleanContent.replace(/#+\s/g, '');
  // Remove bold/italic
  cleanContent = cleanContent.replace(/[*_]{1,3}/g, '');
  // Remove blockquote markers
  cleanContent = cleanContent.replace(/^>\s/gm, '');
  // Remove list markers
  cleanContent = cleanContent.replace(/^[-*+]\s/gm, '');
  cleanContent = cleanContent.replace(/^\d+\.\s/gm, '');
  
  // Count words (split by whitespace)
  const words = cleanContent.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate reading time in minutes, rounded up
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, minutes);
}
