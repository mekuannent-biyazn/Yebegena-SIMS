import api from '../lib/axios'

export const dashboardService = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getTeacherDashboard: () => api.get('/dashboard/teacher'),
  getStudentDashboard: () => api.get('/dashboard/student'),
}
