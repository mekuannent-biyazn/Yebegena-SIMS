import api from '../lib/axios'

export const teacherService = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (payload) => api.post('/teachers', payload),
  update: (id, payload) => api.put(`/teachers/${id}`, payload),
  delete: (id) => api.delete(`/teachers/${id}`),
}
