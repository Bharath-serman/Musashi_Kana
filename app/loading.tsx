export default function Loading() {
  return (
    <main className="loading-page" aria-busy="true">
      <section className="page-header loading-surface" aria-label="Loading page">
        <div>
          <span className="skeleton-line short" />
          <span className="skeleton-line title" />
          <span className="skeleton-line text" />
        </div>
      </section>

      <section className="panel page-skeleton" aria-hidden="true">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
          <div className="skeleton-card wide" />
        </section>
    </main>
  );
}
