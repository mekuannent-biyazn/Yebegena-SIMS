import { useState, useEffect } from 'react'
import { Plus, Pencil, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { scheduleService } from '../../services/scheduleService'
import { classService } from '../../services/classService'
import { useAuthStore } from '../../store/authStore'
import { useI18nStore } from '../../store/i18nStore'
import { SkeletonTable } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { DAYS_OF_WEEK, ROLES } from '../../constants'

const emptyForm = {
  classId: '',
  title: '',
  dayOfWeek: 'MONDAY',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
}

const DAY_LABELS = {
  MONDAY: 'monday', TUESDAY: 'tuesday', WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday', FRIDAY: 'friday', SATURDAY: 'saturday', SUNDAY: 'sunday',
}

export default function SchedulesPage() {
  const { t } = useI18nStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === ROLES.ADMIN
  const isTeacher = user?.role === ROLES.TEACHER

  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editSchedule, setEditSchedule] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [isTutorial, setIsTutorial] = useState(false)

  useEffect(() => {
    classService.getAll()
      .then(({ data }) => {
        const list = data.data || []
        setClasses(list)
        if (list.length > 0) setSelectedClassId(list[0]._id)
      })
      .catch(() => toast.error(t('loadingFailed')))
  }, [])

  useEffect(() => {
    if (selectedClassId) loadSchedules(selectedClassId)
  }, [selectedClassId])

  async function loadSchedules(classId) {
    setLoading(true)
    try {
      const { data } = await scheduleService.getByClass(classId)
      setSchedules(data.data || [])
    } catch {
      toast.error(t('loadingFailed'))
    } finally {
      setLoading(false)
    }
  }

  function openCreate(tutorial = false) {
    setEditSchedule(null)
    setIsTutorial(tutorial)
    setForm({ ...emptyForm, classId: selectedClassId })
    setModalOpen(true)
  }

  function openEdit(s) {
    setEditSchedule(s)
    setIsTutorial(false)
    setForm({
      classId: s.classId?._id || s.classId || selectedClassId,
      title: s.title || '',
      dayOfWeek: s.dayOfWeek || 'MONDAY',
      startTime: s.startTime || '',
      endTime: s.endTime || '',
      location: s.location || '',
      description: s.description || '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editSchedule) {
        await scheduleService.update(editSchedule._id, form)
        toast.success('Schedule updated!')
      } else if (isTutorial) {
        await scheduleService.createTutorial(form)
        toast.success('Tutorial schedule created!')
      } else {
        await scheduleService.create(form)
        toast.success('Schedule created!')
      }
      setModalOpen(false)
      if (selectedClassId) loadSchedules(selectedClassId)
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const grouped = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.dayOfWeek === day)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('schedulesPage')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{schedules.length} schedules</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Class selector */}
          <select
            className="input w-48"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>
          {isAdmin && (
            <button onClick={() => openCreate(false)} className="btn-primary">
              <Plus className="w-4 h-4" /> {t('createSchedule')}
            </button>
          )}
          {isTeacher && (
            <button onClick={() => openCreate(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> {t('createTutorial')}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : schedules.length === 0 ? (
        <div className="card">
          <EmptyState icon={Calendar} title={t('noSchedules')} description={t('emptySchedules')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedules = grouped[day]
            if (!isAdmin && !isTeacher && daySchedules.length === 0) return null
            return (
              <div key={day} className="card space-y-3">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                  {t(DAY_LABELS[day])}
                </h3>
                {daySchedules.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No sessions</p>
                ) : (
                  daySchedules.map((s) => (
                    <div key={s._id} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.startTime} – {s.endTime}
                          {s.location && ` • ${s.location}`}
                        </p>
                        {s.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.description}</p>
                        )}
                        {s.scheduleType && (
                          <span className="badge bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 mt-1">
                            {s.scheduleType}
                          </span>
                        )}
                      </div>
                      {(isAdmin || isTeacher) && (
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex-shrink-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editSchedule ? t('editSchedule') : isTutorial ? t('createTutorial') : t('createSchedule')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isAdmin && !editSchedule && (
            <div>
              <label className="label">{t('selectClass')}</label>
              <select
                className="input"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                required
              >
                <option value="">-- {t('selectClass')} --</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.className}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">{t('scheduleTitle')}</label>
            <input
              type="text"
              className="input"
              placeholder={t('scheduleTitle')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">{t('dayOfWeek')}</label>
            <select
              className="input"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>{t(DAY_LABELS[d])}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('startTime')}</label>
              <input
                type="time"
                className="input"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">{t('endTime')}</label>
              <input
                type="time"
                className="input"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">{t('location')}</label>
            <input
              type="text"
              className="input"
              placeholder="Room 101"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('scheduleDescription')}</label>
            <textarea
              className="input h-20 resize-none"
              placeholder={t('scheduleDescription')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t('loading') : editSchedule ? t('update') : t('create')}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
