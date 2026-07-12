import api from "../lib/axios";

export const teacherService = {
  getAll: () => api.get("/teachers"),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (payload) => api.post("/teachers", payload),
  update: (id, payload) => api.put(`/teachers/${id}`, payload),
  delete: (id) => api.delete(`/teachers/${id}`),

  updateProfile: (formData) =>
    api.put("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteProfilePicture: () => api.delete("/profile/picture"),
  getProfile: () => api.get("/profile"),

  getMyClasses: () => api.get("/teachers/classes"),

  getClassStudents: (classId) =>
    api.get(`/teachers/classes/${classId}/students`),

  getClassDetails: (classId) => api.get(`/teachers/classes/${classId}/details`),

  getStudentsByClass: (classId) =>
    api.get(`/teachers/students/class/${classId}`),
};
