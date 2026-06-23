import Class from "../models/Class.mjs";
import Teacher from "../models/Teacher.mjs";

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
