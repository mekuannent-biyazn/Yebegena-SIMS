import { getAdminDashboardData } from "../services/dashboaredService.mjs";

export const getAdminDashboard = async (req, res) => {
  try {
    const dashboard = await getAdminDashboardData();

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Teacher dashboard is under development",
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Student dashboard is under development",
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
