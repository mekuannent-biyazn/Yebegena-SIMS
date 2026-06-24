import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";
import Student from "../models/Student.mjs";

import { createNotification } from "../services/notificationService.mjs";

export const createExam = async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,

      createdBy: req.user._id,
    });

    const students = await Student.find({
      assignedClass: req.body.classId,
    });

    for (const student of students) {
      await createNotification({
        recipient: student.userId,

        title: "New Exam Scheduled",

        message: `${exam.title} exam has been scheduled.`,

        type: "EXAM",

        createdBy: req.user._id,
      });
    }

    return res.status(201).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addExamResult = async (req, res) => {
  try {
    const { examId, studentId, score, remark } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const isPassed = score >= exam.passingScore;

    const result = await ExamResult.create({
      examId,

      studentId,

      score,

      isPassed,

      remark,

      enteredBy: req.user._id,
    });

    const student = await Student.findById(studentId);

    await createNotification({
      recipient: student.userId,

      title: "Exam Result Published",

      message: `Your score is ${score}.`,

      type: "EXAM",

      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    });

    const results = await ExamResult.find({
      studentId: student._id,
    })
      .populate("examId")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
