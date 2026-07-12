import { useState, useCallback } from "react";
import { teacherService } from "../services/teacherService";
import toast from "react-hot-toast";

export const useTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [classDetails, setClassDetails] = useState(null);

  // Get teacher's assigned classes
  const getMyClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getMyClasses();
      setClasses(response.data.data || []);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load classes";
      setError(message);
      // Don't show toast for network errors or 403
      if (err.code !== "ERR_NETWORK" && err.response?.status !== 403) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get students in a class
  const getClassStudents = useCallback(async (classId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getClassStudents(classId);
      setClassStudents(response.data.data?.students || []);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load students";
      setError(message);
      if (err.code !== "ERR_NETWORK" && err.response?.status !== 403) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get class details with students
  const getClassDetails = useCallback(async (classId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getClassDetails(classId);
      setClassDetails(response.data.data);
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load class details";
      setError(message);
      if (err.code !== "ERR_NETWORK" && err.response?.status !== 403) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setClasses([]);
    setClassStudents([]);
    setClassDetails(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    classes,
    classStudents,
    classDetails,
    getMyClasses,
    getClassStudents,
    getClassDetails,
    clearData,
  };
};
