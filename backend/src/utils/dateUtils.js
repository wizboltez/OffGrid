export function toDateOnly(input) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDateOnly(date) < today;
}

export function calculateLeaveDays(startDate, endDate, isHalfDay = false) {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diff <= 0) return 0;
  return isHalfDay ? 0.5 : diff;
}
