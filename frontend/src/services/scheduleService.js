import api from '../lib/axios'

export const scheduleService = {
  create: (payload) => api.post('/schedules', payload),
  createTutorial: (payload) => api.post('/schedules/tutorial', payload),
  getByClass: (classId) => api.get(`/schedules/class/${classId}`),
  update: (id, payload) => api.put(`/schedules/${id}`, payload),
}
