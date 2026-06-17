"use client";

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
              <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-40 bg-slate-700/30 rounded-xl"></div>
        </div>
      ))}
    </>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-700/50"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-24"></div>
          <div className="h-6 bg-slate-700/50 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-12 bg-slate-700/30 rounded-xl"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
