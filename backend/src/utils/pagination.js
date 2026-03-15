export function getPaginationParams(query) {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 10);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}
