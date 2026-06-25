import Student from "../models/Student.mjs";
import User from "../models/User.mjs";
import Class from "../models/Class.mjs";

import { validateStudentRegistration } from "../validators/studentValidator.mjs";

export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    })
      .populate("kflat")
      .populate("kflatRole")
      .populate("assignedClass");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.registrationStatus = "APPROVED";

    student.registrationApproved = true;

    student.approvedBy = req.user._id;

    await student.save();

    await createNotification({
      recipient: student.userId,

      title: "Registration Approved",

      message: "Your registration has been approved.",

      type: "SYSTEM",

      createdBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Student approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.body;

    const student = await Student.findById(studentId);

    const classData = await Class.findById(classId);

    if (!student || !classData) {
      return res.status(404).json({
        success: false,
        message: "Student or class not found",
      });
    }

    if (classData.currentStudents >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Class is full",
      });
    }

    student.assignedClass = classId;

    await student.save();

    await createNotification({
      recipient: student.userId,

      title: "Class Assigned",

      message: "You have been assigned to a class.",

      type: "CLASS",

      createdBy: req.user._id,
    });

    classData.currentStudents += 1;

    await classData.save();

    res.status(200).json({
      success: true,
      message: "Student assigned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingStudents = async (req, res) => {
  try {
    const students = await Student.find({
      registrationStatus: "PENDING",
    })
      .populate("userId")
      .populate("kflat")
      .populate("kflatRole");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.registrationStatus = "REJECTED";

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student registration rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const studentStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();

    const pending = await Student.countDocuments({
      registrationStatus: "PENDING",
    });

    const approved = await Student.countDocuments({
      registrationStatus: "APPROVED",
    });

    const rejected = await Student.countDocuments({
      registrationStatus: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const studentReport = async (req, res) => {
  const students = await Student.find()
    .populate("userId")
    .populate("assignedClass");

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
};
