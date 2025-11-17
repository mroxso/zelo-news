export function isValidDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  return !isNaN(date.getTime());
}

export function toISOStringSafe(date: Date | null | undefined): string {
  if (!isValidDate(date as Date)) return "";
  try {
    return (date as Date).toISOString();
  } catch {
    return "";
  }
}
