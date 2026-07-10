import api from '../lib/axios'

export const classService = {
  create: (payload) => api.post('/classes', payload),
  getAll: () => api.get('/classes'),
  assignTeacher: (classId, teacherId) =>
    api.put('/classes/assign-teacher', { classId, teacherId }),
}
