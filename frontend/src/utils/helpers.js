import { format, parseISO } from 'date-fns'

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  } catch {
    return dateString
  }
}

export function formatTime(timeString) {
  // timeString is like "09:00"
  return timeString || 'N/A'
}

export function normalizePhoneNumber(phone) {
  // Accepts 09XXXXXXXX or 2519XXXXXXXX or +2519XXXXXXXX
  // Frontend can just send it raw — backend normalizes
  return phone.trim()
}

export function getStatusBadgeClass(status) {
  const map = {
    PENDING: 'badge bg-yellow-100 text-yellow-700',
    APPROVED: 'badge bg-emerald-100 text-emerald-700',
    REJECTED: 'badge bg-red-100 text-red-700',
    OPEN: 'badge bg-blue-100 text-blue-700',
    MATCHED: 'badge bg-purple-100 text-purple-700',
    CANCELLED: 'badge bg-slate-100 text-slate-700',
    PAID: 'badge bg-emerald-100 text-emerald-700',
    UNPAID: 'badge bg-red-100 text-red-700',
    FRESH: 'badge bg-blue-100 text-blue-700',
    ADVANCED: 'badge bg-indigo-100 text-indigo-700',
  }
  return map[status] || 'badge bg-slate-100 text-slate-700'
}

export function truncate(str, len = 50) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function getInitials(fullName) {
  if (!fullName) return 'NA'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
