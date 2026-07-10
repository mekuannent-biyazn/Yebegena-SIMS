import api from "../lib/axios";

export const paymentService = {
  upload: (formData) =>
    api.post("/payments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyPayments: () => api.get("/payments/my-payments"),
  getAll: () => api.get("/payments"),
  getStats: () => api.get("/payments/stats"),
  approve: (id) => api.put(`/payments/approve/${id}`),
  reject: (id, rejectionReason) =>
    api.put(`/payments/reject/${id}`, { rejectionReason }),
  delete: (id) => api.delete(`/payments/${id}`),
};
