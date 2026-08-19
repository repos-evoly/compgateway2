export const formatLyPayAmount = (
  value: number,
  locale: string
): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  }).format(value);

export const formatLyPayDateTime = (
  value: string | null,
  locale: string,
  fallback = "-"
): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
