import api from "../lib/axios";

export const examService = {
  create: (payload) => api.post("/exams", payload),
  submitResult: (payload) => api.post("/exams/result", payload),
  getMyResults: () => api.get("/exams/my-results"),
  getAllExams: () => api.get("/exams/all"),
  getExamsByClass: (classId) => api.get(`/exams/class/${classId}`),
};
