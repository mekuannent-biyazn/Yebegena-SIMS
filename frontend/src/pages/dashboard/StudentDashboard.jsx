import { useState, useEffect } from 'react'
import { CreditCard, BookOpen, FileText, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { paymentService } from '../../services/paymentService'
import { examService } from '../../services/examService'
import { SkeletonCard, SkeletonStatCard } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/helpers'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [payments, setPayments] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentService.getProfile(),
      paymentService.getMyPayments(),
      examService.getMyResults(),
    ]).then(([p, pay, ex]) => {
      setProfile(p.data.data)
      setPayments(pay.data.data || [])
      setResults(ex.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <SkeletonCard />
      </div>
    )
  }

  const approvedPayments = payments.filter((p) => p.status === 'APPROVED').length
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length
  const passedExams = results.filter((r) => r.isPassed).length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">
          Welcome, {profile?.userId?.fullName?.split(' ')[0] || 'Student'}!
        </h2>
        <p className="text-primary-100 text-sm">
          Status: <span className="font-semibold">{profile?.registrationStatus}</span>
          {profile?.assignedClass && (
            <> · Class: <span className="font-semibold">{profile.assignedClass?.className}</span></>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{approvedPayments}</p>
          <p className="text-xs text-slate-500 mt-1">Approved Payments</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{pendingPayments}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Payments</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{results.length}</p>
          <p className="text-xs text-slate-500 mt-1">Exam Results</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{passedExams}</p>
          <p className="text-xs text-slate-500 mt-1">Passed Exams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <h3 className="text-base font-bold text-slate-800 mb-4">Recent Payments</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No payments yet</p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Month {p.paymentMonth}, {p.paymentYear}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{p.amount} ETB</p>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam Results */}
        <div className="card">
          <h3 className="text-base font-bold text-slate-800 mb-4">Exam Results</h3>
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No exam results yet</p>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 5).map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {r.examId?.title || 'Exam'}
                    </p>
                    <p className="text-xs text-slate-400">{r.examId?.examType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{r.score}</p>
                    <Badge status={r.isPassed ? 'APPROVED' : 'REJECTED'} label={r.isPassed ? 'Passed' : 'Failed'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
