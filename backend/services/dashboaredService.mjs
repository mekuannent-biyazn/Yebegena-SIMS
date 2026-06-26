import Student from "../models/Student.mjs";
import Teacher from "../models/Teacher.mjs";
import Payment from "../models/Payment.mjs";
import Exam from "../models/Exam.mjs";
import User from "../models/User.mjs";
import ActivityLog from "../models/ActivityLog.mjs";
import Notification from "../models/Notification.mjs";
import ClassChangeRequest from "../models/ClassChangeRequest.mjs";

export const getAdminDashboardData = async () => {
  const [
    totalUsers,
    totalStudents,
    freshStudents,
    advancedStudents,
    totalTeachers,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    upcomingExams,
    classChanges,
    recentActivities,
    notifications,
  ] = await Promise.all([
    User.countDocuments(),

    Student.countDocuments(),

    Student.countDocuments({
      studentStatus: "FRESH",
    }),

    Student.countDocuments({
      studentStatus: "ADVANCED",
    }),

    Teacher.countDocuments(),

    Payment.countDocuments({
      paymentStatus: "PENDING",
    }),

    Payment.countDocuments({
      paymentStatus: "APPROVED",
    }),

    Payment.countDocuments({
      paymentStatus: "REJECTED",
    }),

    Exam.countDocuments({
      examDate: {
        $gte: new Date(),
      },
    }),

    ClassChangeRequest.countDocuments({
      status: "PENDING",
    }),

    ActivityLog.find()
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(10),

    Notification.find({
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .limit(10),
  ]);

  const monthlyRegistrations = await Student.aggregate([
    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt",
          },
          year: {
            $year: "$createdAt",
          },
        },
        total: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const paymentOverview = await Payment.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        total: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalIncome = await Payment.aggregate([
    {
      $match: {
        paymentStatus: "APPROVED",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return {
    statistics: {
      totalUsers,
      totalStudents,
      freshStudents,
      advancedStudents,
      totalTeachers,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      upcomingExams,
      classChanges,
      totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
    },

    charts: {
      monthlyRegistrations,
      paymentOverview,
    },

    recentActivities,

    notifications,
  };
};
