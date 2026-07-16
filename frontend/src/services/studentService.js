import api from "../lib/axios";

export const studentService = {
  getPending: () => api.get("/students/pending"),
  approve: (id) => api.put(`/students/approve/${id}`),
  reject: (id) => api.put(`/students/reject/${id}`),
  assignClass: (studentId, classId) =>
    api.patch(`/students/${studentId}/assign-class`, {
      classId,
    }),
  promote: (id) => api.post(`/students/${id}/promote`),

  getStats: () => api.get("/students/stats"),
  getAll: () => api.get("/students/students"),
  getById: (id) => api.get(`/students/${id}`),

  // Use only the working endpoint
  getProfile: () => api.get("/profile"),

  updateProfile: (formData) =>
    api.put("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteProfilePicture: () => api.delete("/profile/picture"),
};
