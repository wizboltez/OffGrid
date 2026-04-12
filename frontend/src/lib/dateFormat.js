function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatDateDDMMYYYY(value) {
  const parsed = parseDate(value);
  if (!parsed) return "-";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeDDMMYYYY(value) {
  const parsed = parseDate(value);
  if (!parsed) return "-";

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
