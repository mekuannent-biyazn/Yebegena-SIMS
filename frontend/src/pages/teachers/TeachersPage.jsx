import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { teacherService } from '../../services/teacherService'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/helpers'

const emptyForm = { fullName: '', phoneNumber: '', password: '', teacherType: 'FRESH_TEACHER' }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState(null)
  const [viewTeacher, setViewTeacher] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await teacherService.getAll()
      setTeachers(data.data || [])
    } catch {
      toast.error('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditTeacher(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t) {
    setEditTeacher(t)
    setForm({
      fullName: t.userId?.fullName || '',
      phoneNumber: t.userId?.phoneNumber || '',
      password: '',
      teacherType: t.teacherType || 'FRESH_TEACHER',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editTeacher) {
        const payload = { teacherType: form.teacherType }
        if (form.fullName) payload.fullName = form.fullName
        await teacherService.update(editTeacher._id, payload)
        toast.success('Teacher updated!')
      } else {
        await teacherService.create(form)
        toast.success('Teacher created!')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this teacher?')) return
    setDeleting(id)
    try {
      await teacherService.delete(id)
      toast.success('Teacher deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = teachers.filter(
    (t) =>
      t.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.userId?.phoneNumber?.includes(search)
  )

  if (loading) return <SkeletonTable rows={6} cols={5} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Teachers</h2>
          <p className="text-sm text-slate-500">{teachers.length} teachers registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="input pl-9 w-56"
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No teachers found" description="Add a teacher to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Teacher</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Classes</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/50 last:border-0">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold uppercase">
                          {t.userId?.fullName?.slice(0, 2)}
                        </div>
                        <span className="font-medium text-slate-800">{t.userId?.fullName}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-500">{t.userId?.phoneNumber}</td>
                    <td className="table-td">
                      <span className={`badge ${t.teacherType === 'ADVANCED_TEACHER' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                        {t.teacherType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="text-sm text-slate-600">{t.classes?.length || 0} class(es)</span>
                    </td>
                    <td className="table-td text-slate-500">{formatDate(t.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewTeacher(t)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          disabled={deleting === t._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="Teacher's full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required={!editTeacher}
            />
          </div>
          {!editTeacher && (
            <>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="09XXXXXXXX"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Temporary Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Temporary password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="label">Teacher Type</label>
            <select
              className="input"
              value={form.teacherType}
              onChange={(e) => setForm({ ...form, teacherType: e.target.value })}
            >
              <option value="FRESH_TEACHER">Fresh Teacher</option>
              <option value="ADVANCED_TEACHER">Advanced Teacher</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editTeacher ? 'Update' : 'Create Teacher'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewTeacher}
        onClose={() => setViewTeacher(null)}
        title="Teacher Details"
        size="sm"
      >
        {viewTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-2xl font-bold uppercase">
                {viewTeacher.userId?.fullName?.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewTeacher.userId?.fullName}</h3>
                <p className="text-slate-500">{viewTeacher.userId?.phoneNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Type', viewTeacher.teacherType?.replace('_', ' ')],
                ['Classes', `${viewTeacher.classes?.length || 0} assigned`],
                ['Joined', formatDate(viewTeacher.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
