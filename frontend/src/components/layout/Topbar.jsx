import { useState, useEffect, useRef } from 'react'
import { Bell, LogOut, ChevronDown, User, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useI18nStore } from '../../store/i18nStore'
import { notificationService } from '../../services/notificationService'
import { ROLES } from '../../constants'

export default function Topbar({ title }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggleTheme } = useThemeStore()
  const { language, setLanguage, t } = useI18nStore()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(({ data }) => setUnread(data.count || 0))
      .catch(() => {})

    const interval = setInterval(() => {
      notificationService.getUnreadCount()
        .then(({ data }) => setUnread(data.count || 0))
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isStudent = user?.role === ROLES.FRESH_STUDENT || user?.role === ROLES.ADVANCED_STUDENT

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>

      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600
                     text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Toggle language"
        >
          {language === 'en' ? 'EN' : 'AM'}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark
            ? <Sun className="w-5 h-5 text-yellow-400" />
            : <Moon className="w-5 h-5" />
          }
        </button>

        {/* Notifications bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label={t('notifications')}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">
              {user?.fullName?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
              {user?.fullName?.split(' ')[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>

          {dropOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.phoneNumber}</p>
              </div>
              {isStudent && (
                <button
                  onClick={() => { setDropOpen(false); navigate('/profile') }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <User className="w-4 h-4" />
                  {t('myProfile')}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
