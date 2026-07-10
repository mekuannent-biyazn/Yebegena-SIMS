import { Construction } from 'lucide-react'

export default function TeacherDashboard() {
  return (
    <div className="card text-center py-12">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
          <Construction className="w-8 h-8" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Dashboard</h2>
      <p className="text-slate-500 max-w-md mx-auto">
        Your personalized dashboard is under development. In the meantime, you can access schedules and notifications from the sidebar.
      </p>
    </div>
  )
}
