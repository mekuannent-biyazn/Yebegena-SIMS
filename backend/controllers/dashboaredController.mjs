import User from "../models/User.mjs";
import Student from "../models/Student.mjs";
import Teacher from "../models/Teacher.mjs";
import Payment from "../models/Payment.mjs";
import Exam from "../models/Exam.mjs";

const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const totalTeachers = await Teacher.countDocuments();

    const pendingPayments = await Payment.countDocuments({
      status: "PENDING",
    });

    const upcomingExams = await Exam.countDocuments({
      examDate: {
        $gte: new Date(),
      },
    });

    res.status(200).json({
      success: true,

      data: {
        totalStudents,
        totalTeachers,
        pendingPayments,
        upcomingExams,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getAdminDashboard;
