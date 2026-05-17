export default function AdminLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-muted rounded-md" />
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-9 bg-muted rounded-md" />
        <div className="h-9 w-36 bg-muted rounded-md" />
        <div className="h-9 w-20 bg-muted rounded-md" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-3 flex gap-8">
          {[140, 100, 80, 80, 90].map((w, i) => (
            <div key={i} className={`h-4 bg-muted rounded`} style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-8 px-4 py-3 border-b border-border last:border-0">
            <div className="h-4 w-36 bg-muted/60 rounded" />
            <div className="h-4 w-24 bg-muted/40 rounded" />
            <div className="h-4 w-20 bg-muted/40 rounded" />
            <div className="h-4 w-16 bg-muted/40 rounded" />
            <div className="h-4 w-20 bg-muted/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
