import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, CreditCard, FileText,
  TrendingUp, RefreshCw, DollarSign, Clock,
  CheckCircle, XCircle, UserPlus, BookOpen
} from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import { SkeletonStatCard, SkeletonCard } from '../../components/ui/Skeleton'
import { formatDateTime } from '../../utils/helpers'
import { Badge } from '../../components/ui/Badge'

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value ?? 0}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function ActivityItem({ item }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {item.user?.fullName?.slice(0, 2)?.toUpperCase() || 'NA'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 font-medium truncate">{item.description}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(item.createdAt)}</p>
      </div>
      <Badge status={item.module} label={item.module} />
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getAdminDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const s = stats?.statistics || {}

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={s.totalStudents} color="blue" />
        <StatCard icon={UserPlus} label="Fresh Students" value={s.freshStudents} color="indigo" />
        <StatCard icon={TrendingUp} label="Advanced Students" value={s.advancedStudents} color="purple" />
        <StatCard icon={GraduationCap} label="Total Teachers" value={s.totalTeachers} color="green" />
        <StatCard icon={CheckCircle} label="Approved Payments" value={s.approvedPayments} color="green" />
        <StatCard icon={Clock} label="Pending Payments" value={s.pendingPayments} color="yellow" />
        <StatCard icon={XCircle} label="Rejected Payments" value={s.rejectedPayments} color="red" />
        <StatCard
          icon={DollarSign}
          label="Total Income"
          value={`${(s.totalIncome || 0).toLocaleString()} ETB`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Upcoming Exams" value={s.upcomingExams} color="indigo" />
        <StatCard icon={RefreshCw} label="Class Change Requests" value={s.classChanges} color="yellow" />
        <StatCard icon={BookOpen} label="Total Users" value={s.totalUsers} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Overview */}
        <div className="card">
          <h3 className="text-base font-bold text-slate-800 mb-4">Payment Overview</h3>
          {stats?.charts?.paymentOverview?.length > 0 ? (
            <div className="space-y-3">
              {stats.charts.paymentOverview.map((item) => {
                const total = stats.charts.paymentOverview.reduce((a, b) => a + b.total, 0)
                const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
                const statusColors = {
                  APPROVED: 'bg-emerald-500',
                  PENDING: 'bg-yellow-400',
                  REJECTED: 'bg-red-400',
                }
                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item._id}</span>
                      <span className="text-slate-500">{item.total} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${statusColors[item._id] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No payment data yet</p>
          )}
        </div>

        {/* Monthly Registrations */}
        <div className="card">
          <h3 className="text-base font-bold text-slate-800 mb-4">Monthly Registrations</h3>
          {stats?.charts?.monthlyRegistrations?.length > 0 ? (
            <div className="space-y-2">
              {stats.charts.monthlyRegistrations.slice(-6).map((item) => {
                const max = Math.max(...stats.charts.monthlyRegistrations.map((r) => r.total))
                const pct = max > 0 ? Math.round((item.total / max) * 100) : 0
                const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return (
                  <div key={`${item._id.year}-${item._id.month}`} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-10 text-right">
                      {months[item._id.month]}
                    </span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-lg transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6">{item.total}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No registration data yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h3>
        {stats?.recentActivities?.length > 0 ? (
          <div>
            {stats.recentActivities.slice(0, 10).map((item, i) => (
              <ActivityItem key={i} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No recent activity</p>
        )}
      </div>
    </div>
  )
}
