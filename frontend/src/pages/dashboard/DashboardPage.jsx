import { useAuthStore } from '../../store/authStore'
import { ROLES } from '../../constants'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (user?.role === ROLES.ADMIN) return <AdminDashboard />
  if (user?.role === ROLES.TEACHER) return <TeacherDashboard />
  return <StudentDashboard />
}
