import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useI18nStore } from '../../store/i18nStore'

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const { changePassword, isLoading, user, token } = useAuthStore()
  const { language } = useI18nStore()
  const navigate = useNavigate()
  const isAm = language === 'am'

  // If not logged in at all, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmNew) {
      toast.error(isAm ? 'ፓስዎርዶቹ አይዛመዱም' : 'Passwords do not match')
      return
    }
    try {
      await changePassword(form.currentPassword, form.newPassword)
      toast.success(isAm ? 'ፓስዎርድ ተቀይሯል!' : 'Password changed successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || (isAm ? 'ፓስዎርድ መቀየር አልተሳካም' : 'Failed to change password'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Yebegena SIMS</h1>
          <p className="text-primary-200 mt-1 text-sm">
            {isAm ? 'ፓስዎርድ ይቀይሩ' : 'Change Your Password'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isAm ? 'ፓስዎርድ ያዘምኑ' : 'Set New Password'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {isAm ? 'ጊዜያዊ ፓስዎርድዎን ይቀይሩ' : 'You must change your temporary password to continue'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label dark:text-slate-300">
                {isAm ? 'አሁን ያለ ፓስዎርድ' : 'Current Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="input pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder={isAm ? 'አሁን ያለ ፓስዎርድ' : 'Enter current password'}
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label dark:text-slate-300">
                {isAm ? 'አዲስ ፓስዎርድ' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder={isAm ? 'አዲስ ፓስዎርድ' : 'Enter new password'}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label dark:text-slate-300">
                {isAm ? 'አዲሱን ፓስዎርድ አረጋግጡ' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder={isAm ? 'ፓስዎርድ አረጋግጥ' : 'Confirm new password'}
                  value={form.confirmNew}
                  onChange={(e) => setForm({ ...form, confirmNew: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAm ? 'በመቀየር ላይ...' : 'Changing...'}
                </span>
              ) : (isAm ? 'ፓስዎርድ ቀይር' : 'Change Password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
