export function formatDate(date: Date | string, locale = "vi-VN"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date),
  );
}
