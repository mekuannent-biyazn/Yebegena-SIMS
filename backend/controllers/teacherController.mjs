import bcrypt from "bcryptjs";

import User from "../models/User.mjs";
import Teacher from "../models/Teacher.mjs";

import normalizePhone from "../utils/normalizePhone.mjs";

import { validateTeacher } from "../validators/teacherValidator.mjs";

export const createTeacher = async (req, res) => {
  try {
    const errors = validateTeacher(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { fullName, phoneNumber, teacherType } = req.body;

    const normalizedPhone = normalizePhone(phoneNumber);

    const existingUser = await User.findOne({
      phoneNumber: normalizedPhone,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const tempPassword = "Temp@123";

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      fullName,
      phoneNumber: normalizedPhone,
      password: hashedPassword,
      role: "TEACHER",
      mustChangePassword: true,
    });

    const teacher = await Teacher.create({
      userId: user._id,
      teacherType,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",

      tempPassword,

      data: {
        user,
        teacher,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("userId")
      .populate("assignedClasses") // Add this to populate assigned classes
      .sort({
        createdAt: -1,
      });

    // Transform the data to include classes count
    const transformedTeachers = teachers.map((teacher) => {
      const teacherObj = teacher.toObject();
      // Add classes field for frontend compatibility
      teacherObj.classes = teacherObj.assignedClasses || [];
      return teacherObj;
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: transformedTeachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("userId")
      .populate("assignedClasses"); // Add this

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Transform the data
    const teacherObj = teacher.toObject();
    teacherObj.classes = teacherObj.assignedClasses || [];

    return res.status(200).json({
      success: true,
      data: teacherObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (req.body.teacherType) {
      teacher.teacherType = req.body.teacherType;
    }

    await teacher.save();

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deactivateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacher.isActive = false;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher deactivated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
