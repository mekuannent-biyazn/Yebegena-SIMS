import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useI18nStore } from '../../store/i18nStore'
import {
  BookOpen, Users, GraduationCap, BarChart3,
  CheckCircle, Globe, Moon, Sun, ArrowRight,
  Calendar, CreditCard, Bell, Shield
} from 'lucide-react'

const features = [
  {
    icon: Users,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    en: 'Student Management',
    am: 'የተማሪ አስተዳደር',
    subEn: 'Track enrollments, approvals, class assignments, and promotions.',
    subAm: 'ምዝገቦችን፣ ፍቃዶችን፣ ክፍል ምደባዎችን እና ደረጃ ማሻሻያዎችን ይከታተሉ።',
  },
  {
    icon: GraduationCap,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    en: 'Teacher Portal',
    am: 'የአስተማሪ መርሃ ግብር',
    subEn: 'Manage teachers, assign classes, and schedule tutorials.',
    subAm: 'አስተማሪዎችን ያስተዳድሩ፣ ክፍሎችን ይመድቡ እና ትምህርቶችን ያቅዱ።',
  },
  {
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    en: 'Exams & Results',
    am: 'ፈተናዎች እና ውጤቶች',
    subEn: 'Create exams, record scores, and track student performance.',
    subAm: 'ፈተናዎችን ይፍጠሩ፣ ነጥቦችን ይመዝግቡ እና የተማሪ አፈጻጸምን ይከታተሉ።',
  },
  {
    icon: CreditCard,
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    en: 'Payment Tracking',
    am: 'የክፍያ ክትትል',
    subEn: 'Upload receipts, review submissions, and monitor income.',
    subAm: 'ደረሰኞችን ስቀሉ፣ ማቅረቢያዎችን ያሻሽሉ እና ገቢን ይከታተሉ።',
  },
  {
    icon: Calendar,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    en: 'Class Schedules',
    am: 'የክፍል መርሃ ግብሮች',
    subEn: 'Weekly schedules for classes and tutorial sessions.',
    subAm: 'ለክፍሎች እና ለትምህርት ጊዜዎች ሳምንታዊ መርሃ ግብሮች።',
  },
  {
    icon: Bell,
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    en: 'Notifications',
    am: 'ማሳወቂያዎች',
    subEn: 'Real-time alerts for approvals, rejections, and announcements.',
    subAm: 'ለፍቃዶች፣ ለውድቅ እና ለማስታወቂያዎች ሪልታይም ማሳወቂያዎች።',
  },
]

const stats = [
  { value: '500+', en: 'Students Enrolled', am: 'ተምዝጋቢ ተማሪዎች' },
  { value: '50+', en: 'Teachers', am: 'አስተማሪዎች' },
  { value: '30+', en: 'Active Classes', am: 'ንቁ ክፍሎች' },
  { value: '99%', en: 'Uptime', am: 'አቅም' },
]

export default function HomePage() {
  const { user, token } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useI18nStore()
  const isAm = language === 'am'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              Yebegena SIMS
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <button
              onClick={() => setLanguage(isAm ? 'en' : 'am')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border
                         border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {isAm ? 'AM' : 'EN'}
            </button>

            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600
                         text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {token && user ? (
              <Link
                to="/dashboard"
                className="btn-primary text-sm px-4 py-2"
              >
                {isAm ? 'ዳሽቦርድ' : 'Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-primary-600 dark:text-primary-400
                             hover:text-primary-700 dark:hover:text-primary-300 px-3 py-2 transition-colors"
                >
                  {isAm ? 'ግባ' : 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  {isAm ? 'ተመዝገብ' : 'Register'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 pointer-events-none" />
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            {isAm ? 'አስተማማኝ የተማሪ አስተዳደር' : 'Trusted Student Management'}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
            {isAm ? (
              <>
                የተማሪ መረጃ<br />
                <span className="text-primary-300">አስተዳደር ስርዓት</span>
              </>
            ) : (
              <>
                Student Information<br />
                <span className="text-primary-300">Management System</span>
              </>
            )}
          </h1>

          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAm
              ? 'ዬበገና ሲምስ — ትምህርት ቤቱን ያቀላጥፉ፣ ተማሪዎችን ያስተዳድሩ፣ ክፍያዎችን ይከታተሉ እና ምርጥ ትምህርታዊ ውጤቶችን ያቅዱ።'
              : 'Yebegena SIMS — Streamline your school operations, manage students, track payments, and plan the best academic outcomes.'}
          </p>

          {token && user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl
                         hover:bg-primary-50 transition-colors shadow-xl text-lg"
            >
              {isAm ? 'ዳሽቦርድ ክፈት' : 'Go to Dashboard'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl
                           hover:bg-primary-50 transition-colors shadow-xl text-lg w-full sm:w-auto justify-center"
              >
                {isAm ? 'አሁን ተመዝገብ' : 'Get Started'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold
                           px-8 py-4 rounded-2xl hover:bg-white/25 transition-colors text-lg w-full sm:w-auto justify-center"
              >
                {isAm ? 'ወደ ስርዓቱ ግባ' : 'Sign In'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.value}>
                <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-1">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isAm ? s.am : s.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {isAm ? 'ሁሉንም ነገር በአንድ ስፍራ' : 'Everything in One Place'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
            {isAm
              ? 'ዘመናዊ ትምህርት ቤት ለማስተዳደር ያስፈልጉ ሁሉም መሳሪያዎች።'
              : 'All the tools you need to run a modern school efficiently.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.en}
                className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {isAm ? f.am : f.en}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {isAm ? f.subAm : f.subEn}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              {isAm ? 'እንዴት እንደሚሰራ' : 'How It Works'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                en: 'Register',
                am: 'ተመዝገብ',
                subEn: 'Create your account and submit your enrollment request.',
                subAm: 'አካውንትዎን ፍጠሩ እና ምዝገባ ጥያቄዎን አስገቡ።',
              },
              {
                step: '02',
                en: 'Get Approved',
                am: 'ፍቃድ ያግኙ',
                subEn: 'Admin reviews and approves your enrollment, then assigns your class.',
                subAm: 'አስተዳዳሪ ምዝገባዎን ይፈትሻሉ፣ ያጸድቃሉ እና ክፍልዎን ይሰጣሉ።',
              },
              {
                step: '03',
                en: 'Start Learning',
                am: 'ትምህርት ጀምሩ',
                subEn: 'Access your schedule, pay fees, and track your exam results.',
                subAm: 'መርሃ ግብርዎን ይጎብኙ፣ ክፍያ ያቅርቡ እና ፈተና ውጤቶችዎን ይከታተሉ።',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300
                                rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-extrabold">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {isAm ? item.am : item.en}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isAm ? item.subAm : item.subEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isAm ? 'ዛሬ ለመጀመር ዝግጁ ነዎት?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            {isAm
              ? 'ቤተሰቦቻቸውን ወደ ዬበገና ሲምስ ይቀላቀሉ። ምዝገባ ነፃ ነው።'
              : 'Join the Yebegena SIMS family today. Registration is free.'}
          </p>
          {token && user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl
                         hover:bg-primary-50 transition-colors shadow-xl text-lg"
            >
              {isAm ? 'ዳሽቦርድ ይክፈቱ' : 'Open Dashboard'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl
                           hover:bg-primary-50 transition-colors shadow-xl text-lg w-full sm:w-auto justify-center"
              >
                {isAm ? 'አሁን ተመዝገብ' : 'Register Now'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold
                           px-8 py-4 rounded-2xl hover:bg-white/25 transition-colors text-lg w-full sm:w-auto justify-center"
              >
                {isAm ? 'ወደ ስርዓቱ ግባ' : 'Sign In'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Yebegena SIMS</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/login" className="hover:text-white transition-colors">
                {isAm ? 'ግባ' : 'Sign In'}
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                {isAm ? 'ተመዝገብ' : 'Register'}
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Yebegena SIMS. {isAm ? 'መብቶቹ ተጠብቀዋል' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
