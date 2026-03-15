export const apiResponse = ({ message, data = null, meta = null }) => ({
  success: true,
  message,
  data,
  meta,
});
