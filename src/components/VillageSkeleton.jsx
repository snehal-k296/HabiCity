// Phase 5 — shown while the first Firestore snapshot is loading, so the
// screen never just flashes blank.
export default function VillageSkeleton() {
  return (
    <div className="village-skeleton" aria-label="Loading your village...">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="skeleton-cell" style={{ animationDelay: `${(i % 8) * 60}ms` }} />
      ))}
    </div>
  );
}
