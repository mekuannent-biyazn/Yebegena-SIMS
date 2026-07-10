import { getStatusBadgeClass } from '../../utils/helpers'

export function Badge({ status, label, className = '' }) {
  const cls = getStatusBadgeClass(status)
  return (
    <span className={`${cls} ${className}`}>
      {label || status}
    </span>
  )
}

export function RoleBadge({ role }) {
  const map = {
    ADMIN: 'badge bg-rose-100 text-rose-700',
    TEACHER: 'badge bg-violet-100 text-violet-700',
    FRESH_STUDENT: 'badge bg-sky-100 text-sky-700',
    ADVANCED_STUDENT: 'badge bg-emerald-100 text-emerald-700',
  }
  const label = {
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    FRESH_STUDENT: 'Fresh Student',
    ADVANCED_STUDENT: 'Advanced Student',
  }
  return (
    <span className={map[role] || 'badge bg-slate-100 text-slate-700'}>
      {label[role] || role}
    </span>
  )
}
