import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/students/pending': 'Pending Approvals',
  '/teachers': 'Teachers',
  '/classes': 'Classes',
  '/schedules': 'Schedules',
  '/schedule': 'My Schedule',
  '/exams': 'Exams',
  '/payments': 'Payments',
  '/class-change': 'Class Change Requests',
  '/promotions': 'Student Promotions',
  '/kflats': 'Kflats & Roles',
  '/notifications': 'Notifications',
  '/settings': 'System Settings',
  '/profile': 'My Profile',
}

export default function AppLayout() {
  const { pathname } = useLocation()

  // Match exact or prefix
  let title = 'Yebegena SIMS'
  for (const [path, t] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      title = t
      break
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
