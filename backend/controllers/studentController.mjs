import Student from "../models/Student.mjs";
import User from "../models/User.mjs";
import Class from "../models/Class.mjs";

import { validateStudentRegistration } from "../validators/studentValidator.mjs";
import { createNotification } from "../services/notificationService.mjs";

export const getMyProfile = async (req, res) => {
  try {
    // First, find the student without populating to see what's there
    const studentRaw = await Student.findOne({
      userId: req.user._id,
    });

    const student = await Student.findOne({
      userId: req.user._id,
    })
      .populate({
        path: "assignedClass",
        select:
          "className classType teacher maxStudents currentStudents isActive",
        populate: {
          path: "teacher",
          populate: {
            path: "userId",
            select: "fullName email phoneNumber",
          },
        },
      })
      .populate("kflat")
      .populate("kflatRole");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Convert to object and explicitly add assignedClass if it exists
    const studentObject = student.toObject();

    return res.status(200).json({
      success: true,
      data: studentObject,
    });
  } catch (error) {
    return res.status(500).json({
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

    // await createNotification({
    //   recipient: student.userId,

    //   title: "Registration Approved",

    //   message: "Your registration has been approved.",

    //   type: "SYSTEM",

    //   createdBy: req.user._id,
    // });

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

    // Validate input
    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Class ID are required",
      });
    }

    // Find student and class
    const student = await Student.findById(studentId);
    const classData = await Class.findById(classId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if class is full
    if (classData.currentStudents >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Class is full",
      });
    }

    // If student already has a class, decrement that class count
    if (student.assignedClass) {
      const oldClass = await Class.findById(student.assignedClass);
      if (oldClass) {
        oldClass.currentStudents = Math.max(0, oldClass.currentStudents - 1);
        await oldClass.save();
      }
    }

    // Assign new class
    student.assignedClass = classId;
    await student.save();

    // Increment new class count
    classData.currentStudents += 1;
    await classData.save();

    // Create notification
    await createNotification({
      recipient: student.userId,
      title: "Class Assigned",
      message: `You have been assigned to ${classData.className}`,
      type: "CLASS",
      createdBy: req.user._id,
    });

    // Populate the assigned class data for response
    const updatedStudent = await Student.findById(studentId)
      .populate("assignedClass")
      .populate("userId", "fullName phoneNumber");

    res.status(200).json({
      success: true,
      message: "Student assigned successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error assigning student to class:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign student to class",
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

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("userId")
      .populate("kflat")
      .populate("kflatRole")
      .populate("assignedClass");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
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

export const assignStudentToClassWithParam = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const student = await Student.findById(studentId).populate(
      "userId",
      "fullName phoneNumber",
    );
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

    // If student already has a class, decrement that class count
    if (student.assignedClass) {
      const oldClass = await Class.findById(student.assignedClass);
      if (oldClass) {
        oldClass.currentStudents = Math.max(0, oldClass.currentStudents - 1);
        await oldClass.save();
      }
    }

    student.assignedClass = classId;
    await student.save();

    classData.currentStudents += 1;
    await classData.save();

    // Create notification with proper fields
    try {
      await createNotification({
        title: "Class Assigned",
        message: `You have been assigned to ${classData.className}`,
        type: "INFO",
        recipientType: "STUDENT",
        recipient: student.userId._id || student.userId,
        createdBy: req.user._id,
        expiresAt: null,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
      // Don't fail the main operation
    }

    // Populate the assigned class data for response
    const updatedStudent = await Student.findById(studentId)
      .populate("assignedClass")
      .populate("userId", "fullName phoneNumber");

    res.status(200).json({
      success: true,
      message: "Student assigned successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error assigning student to class:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign student to class",
    });
  }
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get all students in this class
    const students = await Student.find({
      assignedClass: classId,
      registrationStatus: "APPROVED", // Only approved students
    })
      .populate({
        path: "userId",
        select: "fullName phoneNumber",
      })
      .populate({
        path: "kflat",
        select: "name",
      })
      .populate({
        path: "kflatRole",
        select: "name",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        class: classData,
        students: students,
        count: students.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
