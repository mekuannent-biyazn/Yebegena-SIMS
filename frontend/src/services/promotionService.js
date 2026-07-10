import api from '../lib/axios'

export const promotionService = {
  promote: (studentId) => api.put(`/promotions/${studentId}`),
}
