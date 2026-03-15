export function Button({ type = "button", className = "", children, ...props }) {
  return (
    <button type={type} className={`btn ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
