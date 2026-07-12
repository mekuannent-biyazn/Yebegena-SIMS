import Class from "../models/Class.mjs";
import Teacher from "../models/Teacher.mjs";
import Student from "../models/Student.mjs";

import { validateClass } from "../validators/classValidator.mjs";

export const createClass = async (req, res) => {
  try {
    const errors = validateClass(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { className, classType, maxStudents } = req.body;

    const existingClass = await Class.findOne({
      className,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class already exists",
      });
    }

    const newClass = await Class.create({
      className,
      classType,
      maxStudents,

      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate({
        path: "teacher",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignTeacher = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    classData.teacher = teacherId;

    await classData.save();

    teacher.assignedClasses.push(classData._id);

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher assigned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    // Find the teacher profile for the logged-in user
    const teacher = await Teacher.findOne({ userId: req.user._id }).populate({
      path: "assignedClasses",
      populate: [
        {
          path: "teacher",
          populate: {
            path: "userId",
            select: "fullName phoneNumber",
          },
        },
        {
          path: "createdBy",
          select: "fullName",
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: teacher.assignedClasses.length,
      data: teacher.assignedClasses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if the teacher is assigned to this class
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Verify teacher is assigned to this class
    const isAssigned = teacher.assignedClasses.some(
      (assignedClassId) => assignedClassId.toString() === classId,
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view students in this class",
      });
    }

    // Get all students assigned to this class
    const students = await Student.find({ assignedClass: classId })
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

    // Get class details with teacher info
    const classWithDetails = await Class.findById(classId).populate({
      path: "teacher",
      populate: {
        path: "userId",
        select: "fullName phoneNumber",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        class: classWithDetails,
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

export const getTeacherClassWithStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if class exists
    const classData = await Class.findById(classId).populate({
      path: "teacher",
      populate: {
        path: "userId",
        select: "fullName phoneNumber",
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if the teacher is assigned to this class
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const isAssigned = teacher.assignedClasses.some(
      (assignedClassId) => assignedClassId.toString() === classId,
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this class",
      });
    }

    // Get students in this class
    const students = await Student.find({ assignedClass: classId })
      .populate({
        path: "userId",
        select: "fullName phoneNumber email",
      })
      .populate({
        path: "kflat",
        select: "name",
      })
      .populate({
        path: "kflatRole",
        select: "name",
      });

    return res.status(200).json({
      success: true,
      data: {
        class: classData,
        students: students,
        studentCount: students.length,
        totalCapacity: classData.maxStudents,
        availableSlots: classData.maxStudents - students.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
