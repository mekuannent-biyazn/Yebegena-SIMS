import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, UserCog, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { kflatService, kflatRoleService } from '../../services/kflatService'
import { useI18nStore } from '../../store/i18nStore'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/helpers'

const emptyKflatForm = { name: '', isActive: true }
const emptyRoleForm = { roleName: { en: '', am: '' }, description: '' }

export default function KflatsPage() {
  const { t } = useI18nStore()
  const [tab, setTab] = useState('kflats')

  // Kflats state
  const [kflats, setKflats] = useState([])
  const [kflatsLoading, setKflatsLoading] = useState(true)
  const [kflatModal, setKflatModal] = useState(false)
  const [editKflat, setEditKflat] = useState(null)
  const [kflatForm, setKflatForm] = useState(emptyKflatForm)

  // Roles state
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [roleModal, setRoleModal] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [roleForm, setRoleForm] = useState(emptyRoleForm)

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadKflats()
    loadRoles()
  }, [])

  async function loadKflats() {
    setKflatsLoading(true)
    try {
      const { data } = await kflatService.getAll()
      setKflats(data.data || [])
    } catch {
      toast.error(t('loadingFailed'))
    } finally {
      setKflatsLoading(false)
    }
  }

  async function loadRoles() {
    setRolesLoading(true)
    try {
      const { data } = await kflatRoleService.getAll()
      setRoles(data.data || [])
    } catch {
      toast.error(t('loadingFailed'))
    } finally {
      setRolesLoading(false)
    }
  }

  // Kflat handlers
  function openCreateKflat() {
    setEditKflat(null)
    setKflatForm(emptyKflatForm)
    setKflatModal(true)
  }

  function openEditKflat(k) {
    setEditKflat(k)
    setKflatForm({ name: k.name || '', isActive: k.isActive !== false })
    setKflatModal(true)
  }

  async function handleKflatSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editKflat) {
        await kflatService.update(editKflat._id, kflatForm)
        toast.success('Kflat updated!')
      } else {
        await kflatService.create({ name: kflatForm.name })
        toast.success('Kflat created!')
      }
      setKflatModal(false)
      loadKflats()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteKflat(id) {
    if (!confirm(t('confirmDelete'))) return
    setDeleting(id)
    try {
      await kflatService.delete(id)
      toast.success('Kflat deleted')
      loadKflats()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setDeleting(null)
    }
  }

  // Role handlers
  function openCreateRole() {
    setEditRole(null)
    setRoleForm(emptyRoleForm)
    setRoleModal(true)
  }

  function openEditRole(r) {
    setEditRole(r)
    setRoleForm({
      roleName: { en: r.roleName?.en || '', am: r.roleName?.am || '' },
      description: r.description || '',
    })
    setRoleModal(true)
  }

  async function handleRoleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editRole) {
        await kflatRoleService.update(editRole._id, roleForm)
        toast.success('Role updated!')
      } else {
        await kflatRoleService.create(roleForm)
        toast.success('Role created!')
      }
      setRoleModal(false)
      loadRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteRole(id) {
    if (!confirm(t('confirmDelete'))) return
    setDeleting(id)
    try {
      await kflatRoleService.delete(id)
      toast.success('Role deleted')
      loadRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || t('operationFailed'))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('kflatsPage')}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('kflats')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'kflats'
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('kflatsTab')}
        </button>
        <button
          onClick={() => setTab('roles')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'roles'
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('rolesTab')}
        </button>
      </div>

      {/* Kflats Tab */}
      {tab === 'kflats' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{kflats.length} kflats</p>
            <button onClick={openCreateKflat} className="btn-primary">
              <Plus className="w-4 h-4" /> {t('createKflat')}
            </button>
          </div>

          {kflatsLoading ? (
            <SkeletonTable rows={4} cols={4} />
          ) : kflats.length === 0 ? (
            <div className="card">
              <EmptyState icon={UserCog} title={t('noKflats')} description="No kflats created yet." />
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-th">{t('kflatName')}</th>
                      <th className="table-th">{t('status')}</th>
                      <th className="table-th">Created</th>
                      <th className="table-th">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kflats.map((k) => (
                      <tr key={k._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0">
                        <td className="table-td font-medium text-slate-800 dark:text-slate-100">{k.name}</td>
                        <td className="table-td">
                          <Badge
                            status={k.isActive !== false ? 'APPROVED' : 'REJECTED'}
                            label={k.isActive !== false ? t('active') : t('inactive')}
                          />
                        </td>
                        <td className="table-td text-slate-500 dark:text-slate-400">{formatDate(k.createdAt)}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditKflat(k)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKflat(k._id)}
                              disabled={deleting === k._id}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 disabled:opacity-50"
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
            </div>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {tab === 'roles' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{roles.length} roles</p>
            <button onClick={openCreateRole} className="btn-primary">
              <Plus className="w-4 h-4" /> {t('createRole')}
            </button>
          </div>

          {rolesLoading ? (
            <SkeletonTable rows={4} cols={4} />
          ) : roles.length === 0 ? (
            <div className="card">
              <EmptyState icon={Users} title={t('noRoles')} description="No kflat roles created yet." />
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-th">Role (EN)</th>
                      <th className="table-th">Role (AM)</th>
                      <th className="table-th">{t('description')}</th>
                      <th className="table-th">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r) => (
                      <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0">
                        <td className="table-td font-medium text-slate-800 dark:text-slate-100">{r.roleName?.en}</td>
                        <td className="table-td text-slate-600 dark:text-slate-300">{r.roleName?.am}</td>
                        <td className="table-td text-slate-500 dark:text-slate-400">{r.description || '—'}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditRole(r)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(r._id)}
                              disabled={deleting === r._id}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 disabled:opacity-50"
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
            </div>
          )}
        </div>
      )}

      {/* Kflat Modal */}
      <Modal
        isOpen={kflatModal}
        onClose={() => setKflatModal(false)}
        title={editKflat ? t('editKflat') : t('createKflat')}
        size="sm"
      >
        <form onSubmit={handleKflatSubmit} className="space-y-4">
          <div>
            <label className="label">{t('kflatName')}</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Kflat A"
              value={kflatForm.name}
              onChange={(e) => setKflatForm({ ...kflatForm, name: e.target.value })}
              required
            />
          </div>
          {editKflat && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={kflatForm.isActive}
                onChange={(e) => setKflatForm({ ...kflatForm, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('active')}
              </label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t('loading') : editKflat ? t('update') : t('create')}
            </button>
            <button type="button" onClick={() => setKflatModal(false)} className="btn-secondary flex-1">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={roleModal}
        onClose={() => setRoleModal(false)}
        title={editRole ? t('editRole') : t('createRole')}
        size="sm"
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('roleNameEn')}</label>
            <input
              type="text"
              className="input"
              placeholder="Role name in English"
              value={roleForm.roleName.en}
              onChange={(e) => setRoleForm({ ...roleForm, roleName: { ...roleForm.roleName, en: e.target.value } })}
              required
            />
          </div>
          <div>
            <label className="label">{t('roleNameAm')}</label>
            <input
              type="text"
              className="input"
              placeholder="የሚና ስም በአማርኛ"
              value={roleForm.roleName.am}
              onChange={(e) => setRoleForm({ ...roleForm, roleName: { ...roleForm.roleName, am: e.target.value } })}
            />
          </div>
          <div>
            <label className="label">{t('description')}</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Optional description"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t('loading') : editRole ? t('update') : t('create')}
            </button>
            <button type="button" onClick={() => setRoleModal(false)} className="btn-secondary flex-1">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
