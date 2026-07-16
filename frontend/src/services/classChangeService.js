import api from "../lib/axios";

export const classChangeService = {
  createRequest: (payload) => api.post("/class-change/request", payload),
  getVolunteers: () => api.get("/class-change/volunteers"),
  getMyRequest: () => api.get("/class-change/my-request"),
  getAllRequests: () => api.get("/class-change/admin/all"),
  approve: (id) => api.put(`/class-change/admin/approve/${id}`),
  reject: (id) => api.put(`/class-change/admin/reject/${id}`),
  cancel: () => api.delete("/class-change/cancel"),
  acceptMatch: (volunteerRequestId) =>
    api.post("/class-change/accept-match", { volunteerRequestId }),
};
