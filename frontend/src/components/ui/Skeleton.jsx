// Re-usable skeleton loaders

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 ${className}`} />
}

export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine className="w-4/5" />
      <SkeletonLine className="w-3/5" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <SkeletonLine className="w-40 h-5" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonLine className="h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-4 py-3">
                    <SkeletonLine className={`h-3 ${c === 0 ? 'w-8 rounded-full' : ''}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-start">
        <SkeletonBox className="w-10 h-10 rounded-xl" />
        <SkeletonBox className="w-16 h-5 rounded-full" />
      </div>
      <SkeletonLine className="w-16 h-7" />
      <SkeletonLine className="w-24 h-3" />
    </div>
  )
}

export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonLine className="w-24 h-3" />
          <SkeletonBox className="w-full h-10 rounded-xl" />
        </div>
      ))}
      <SkeletonBox className="w-full h-10 rounded-xl mt-2" />
    </div>
  )
}
