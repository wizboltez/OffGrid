export function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();
  return <span className={`badge ${normalized}`}>{normalized}</span>;
}
