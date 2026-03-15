export function Card({ title, children }) {
  return (
    <section className="card">
      {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
      {children}
    </section>
  );
}
