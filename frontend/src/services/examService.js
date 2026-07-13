// import api from "../lib/axios";

// export const examService = {
//   getExamResults: (examId) => api.get(`/exams/${examId}/results`),
// };

import api from "../lib/axios";

export const examService = {
  create: (data) => api.post("/exams", data),
  getAllExams: () => api.get("/exams/all"),
  getExamsByClass: (classId) => api.get(`/exams/class/${classId}`),
  submitResult: (data) => api.post("/exams/result", data),
  checkResult: (examId, studentId) =>
    api.get(`/exams/result/check?examId=${examId}&studentId=${studentId}`),

  getMyResults: () => api.get("/exams/my-results"),

  // **NEW: Get eligible students for an exam (only students in the exam's class)**
  getEligibleStudents: (examId) =>
    api.get(`/exams/${examId}/eligible-students`),

  getTeacherExamsByClass: (classId) =>
    api.get(`/teacher/exams/class/${classId}`),
  getTeacherExamResults: (examId) =>
    api.get(`/teacher/exams/${examId}/results`),
  addTeacherExamResults: (examId, data) =>
    api.post(`/teacher/exams/${examId}/results`, data),
  updateTeacherExamResults: (examId, data) =>
    api.put(`/teacher/exams/${examId}/results`, data),
};

export default examService;
