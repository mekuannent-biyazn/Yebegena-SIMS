import { useState, useEffect } from 'react'
import { Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { classChangeService } from '../../services/classChangeService'
import { classService } from '../../services/classService'
import { useAuthStore } from '../../store/authStore'
import { useI18nStore } from '../../store/i18nStore'
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/helpers'
import { ROLES } from '../../constants'

export default function ClassChangePage() {
  const { t } = useI18nStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === ROLES.ADMIN
  const isStudent = user?.role === ROLES.FRESH_STUDENT || user?.role === ROLES.ADVANCED_STUDENT

  const [myRequest, setMyRequest] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [form, setForm] = useState({ desiredClass: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const promises = [
        classChangeService.getVolunteers(),
        classService.getAll(),
      ]
      if (isStudent) promises.push(classChangeService.getMyRequest())

      const results = await Promise.allSettled(promises)
      setVolunteers(results[0].value?.data?.data || [])
      setClasses(results[1].value?.data?.data || [])
      if (isStudent && results[2]?.value) {
        setMyRequest(results[2].value?.data?.data || null)
      }
    } catch {
      toast.error(t('loadingFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRequest(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {}
      if (form.desiredClass) payload.desiredClass = form.desiredClass
      if (form.reason) payload.reason = form.reason
      await classChangeService.createRequest(payload)
      toast.success('Class change request submitted!')
      setCreateModal(false)
      setForm({ desiredClass: '', reason: '' })
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id) {
    if (!confirm(t('confirmApprove'))) return
    setProcessing(id)
    try {
      await classChangeService.approve(id)
      toast.success('Request approved!')
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(id) {
    if (!confirm(t('confirmReject'))) return
    setProcessing(id)
    try {
      await classChangeService.reject(id)
      toast.success('Request rejected')
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('classChangePage')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{volunteers.length} open requests</p>
        </div>
        {isStudent && !myRequest && (
          <button onClick={() => setCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('createRequest')}
          </button>
        )}
      </div>

      {/* My Request (Student) */}
      {isStudent && myRequest && (
        <div className="card">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> {t('myRequest')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('status')}</p>
              <Badge status={myRequest.status} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('currentClass')}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {myRequest.student?.assignedClass?.className || 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('desiredClass')}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {myRequest.desiredClass?.className || 'Any'}
              </p>
            </div>
            {myRequest.reason && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('reason')}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{myRequest.reason}</p>
              </div>
            )}
          </div>
          {(myRequest.status === 'REJECTED' || myRequest.status === 'CANCELLED') && (
            <button onClick={() => setCreateModal(true)} className="btn-outline mt-3 text-xs">
              Submit New Request
            </button>
          )}
        </div>
      )}

      {/* Volunteers / All Requests */}
      <div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">
          {isAdmin ? 'All Class Change Requests' : t('volunteers')}
        </h3>

        {volunteers.length === 0 ? (
          <div className="card">
            <EmptyState icon={RefreshCw} title={t('noRequests')} description="No class change requests found." />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="table-th">Student</th>
                    <th className="table-th">{t('currentClass')}</th>
                    <th className="table-th">{t('desiredClass')}</th>
                    <th className="table-th">{t('status')}</th>
                    <th className="table-th">{t('date')}</th>
                    {isAdmin && <th className="table-th">{t('actions')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((req) => (
                    <tr key={req._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0">
                      <td className="table-td">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {req.student?.userId?.fullName}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {req.student?.userId?.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {req.student?.assignedClass?.className || 'N/A'}
                      </td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {req.desiredClass?.className || 'Any'}
                      </td>
                      <td className="table-td">
                        <Badge status={req.status} />
                      </td>
                      <td className="table-td text-slate-500 dark:text-slate-400">
                        {formatDate(req.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            {(req.status === 'MATCHED' || req.status === 'OPEN') && (
                              <>
                                <button
                                  onClick={() => handleApprove(req._id)}
                                  disabled={processing === req._id}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                                  title={t('approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(req._id)}
                                  disabled={processing === req._id}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-50"
                                  title={t('reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title={t('createRequest')}
        size="sm"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="label">{t('desiredClass')}</label>
            <select
              className="input"
              value={form.desiredClass}
              onChange={(e) => setForm({ ...form, desiredClass: e.target.value })}
            >
              <option value="">Any available class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('reason')}</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Reason for class change..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t('loading') : t('submit')}
            </button>
            <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary flex-1">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
