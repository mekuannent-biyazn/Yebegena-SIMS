import api from "../lib/axios";

export const examService = {
  create: (data) => api.post("/exams", data),
  getAllExams: () => api.get("/exams/all"),
  getExamsByClass: (classId) => api.get(`/exams/class/${classId}`),
  submitResult: (data) => api.post("/exams/result", data),
  checkResult: (examId, studentId) =>
    api.get(`/exams/result/check?examId=${examId}&studentId=${studentId}`),
  getExamResults: (examId) => api.get(`/exams/${examId}/results`),
  getMyResults: () => api.get("/exams/my-results"),
};
