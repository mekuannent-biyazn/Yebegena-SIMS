import apiClient from "./apiClient";

export const getStudentProfile = async () => {
  const response = await apiClient.get("/api/students/profile");
  return response.data;
};

export const getPendingStudents = async () => {
  const response = await apiClient.get("/api/students/pending");
  return response.data;
};

export const approveStudent = async (studentId) => {
  const response = await apiClient.put(`/api/students/approve/${studentId}`);
  return response.data;
};

export const rejectStudent = async (studentId) => {
  const response = await apiClient.put(`/api/students/reject/${studentId}`);
  return response.data;
};

export const assignStudentToClass = async (data) => {
  const response = await apiClient.put("/api/students/assign-class", data);
  return response.data;
};

export const getStudentStats = async () => {
  const response = await apiClient.get("/api/students/stats");
  return response.data;
};

export const getAllStudents = async () => {
  const response = await apiClient.get("/api/students/students");
  return response.data;
};

// NEW: Get single student by ID
export const getStudentById = async (studentId) => {
  const response = await apiClient.get(`/api/students/${studentId}`);
  return response.data;
};
