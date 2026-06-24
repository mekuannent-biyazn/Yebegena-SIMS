import Schedule from "../models/Schedule.mjs";
import Class from "../models/Class.mjs";
import Teacher from "../models/Teacher.mjs";

import { createNotification } from "../services/notificationService.mjs";

import Student from "../models/Student.mjs";

export const createSchedule = async (req, res) => {
  try {
    const {
      classId,
      title,
      dayOfWeek,
      startTime,
      endTime,
      location,
      description,
    } = req.body;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const schedule = await Schedule.create({
      classId,

      teacherId: classData.teacher,

      title,

      scheduleType: "CLASS",

      dayOfWeek,

      startTime,

      endTime,

      location,

      description,

      createdBy: req.user._id,
    });

    const students = await Student.find({
      assignedClass: classId,
    });

    for (const student of students) {
      await createNotification({
        recipient: student.userId,

        title: "New Schedule",

        message: `Class schedule created for ${title}`,

        type: "SCHEDULE",

        createdBy: req.user._id,
      });
    }

    return res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTutorialSchedule = async (req, res) => {
  try {
    const { classId, title, dayOfWeek, startTime, endTime } = req.body;

    const teacher = await Teacher.findOne({
      userId: req.user._id,
    });

    const schedule = await Schedule.create({
      classId,

      teacherId: teacher._id,

      title,

      scheduleType: "TUTORIAL",

      dayOfWeek,

      startTime,

      endTime,

      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getClassSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      classId: req.params.classId,
      isActive: true,
    }).sort({
      dayOfWeek: 1,
    });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
