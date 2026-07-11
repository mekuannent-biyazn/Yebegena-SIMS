import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";
import Student from "../models/Student.mjs";
import Class from "../models/Class.mjs";
import { createNotification } from "../services/notificationService.mjs";

export const createExam = async (req, res) => {
  try {
    const {
      classId,
      title,
      examType,
      examDate,
      location,
      maxScore,
      passingScore,
      description,
    } = req.body;

    // Validate required fields
    if (!classId || !title || !examType || !examDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: classId, title, examType, examDate",
      });
    }

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate exam type
    if (!["WRITTEN", "PRACTICAL"].includes(examType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam type. Must be WRITTEN or PRACTICAL",
      });
    }

    // Validate scores
    if (maxScore && passingScore && passingScore > maxScore) {
      return res.status(400).json({
        success: false,
        message: "Passing score cannot be greater than max score",
      });
    }

    const exam = await Exam.create({
      classId,
      title,
      examType,
      examDate: new Date(examDate),
      location: location || "",
      maxScore: maxScore || 100,
      passingScore: passingScore || 50,
      description: description || "",
      createdBy: req.user._id,
    });

    // Notify students in the class
    const students = await Student.find({
      assignedClass: classId,
    });

    for (const student of students) {
      try {
        await createNotification({
          recipient: student.userId,
          recipientType: "STUDENT",
          title: "New Exam Scheduled",
          message: `${exam.title} exam has been scheduled for ${new Date(examDate).toLocaleDateString()}.`,
          type: "INFO",
          createdBy: req.user._id,
        });
      } catch (notifError) {
        console.error(
          "Failed to create notification for student:",
          notifError.message,
        );
      }
    }

    return res.status(201).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected",
      });
    }

    console.error("Error creating exam:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addExamResult = async (req, res) => {
  try {
    const { examId, studentId, score, remark } = req.body;

    if (!examId || !studentId || score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: examId, studentId, score",
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.assignedClass.toString() !== exam.classId.toString()) {
      console.log("❌ Student class mismatch:", {
        studentClass: student.assignedClass,
        examClass: exam.classId,
      });
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in the class for this exam",
      });
    }

    const numericScore = Number(score);
    if (
      isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > exam.maxScore
    ) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${exam.maxScore}`,
      });
    }

    const existingResult = await ExamResult.findOne({ examId, studentId });
    if (existingResult) {
      existingResult.score = numericScore;
      existingResult.isPassed = numericScore >= exam.passingScore;
      existingResult.remark = remark || existingResult.remark || "";
      existingResult.enteredBy = req.user._id;

      await existingResult.save();

      try {
        await createNotification({
          recipient: student.userId,
          recipientType: "STUDENT",
          title: "Exam Result Updated",
          message: `Your score for ${exam.title} has been updated to ${numericScore}. Status: ${existingResult.isPassed ? "PASSED ✅" : "FAILED ❌"}`,
          type: existingResult.isPassed ? "SUCCESS" : "WARNING",
          createdBy: req.user._id,
        });
      } catch (notifError) {
        throw notifError;
      }

      return res.status(200).json({
        success: true,
        data: existingResult,
        message: "Result updated successfully",
      });
    }

    const isPassed = numericScore >= exam.passingScore;

    const result = await ExamResult.create({
      examId,
      studentId,
      score: numericScore,
      isPassed,
      remark: remark || "",
      enteredBy: req.user._id,
    });

    const verifyResult = await ExamResult.findById(result._id);

    try {
      await createNotification({
        recipient: student.userId,
        recipientType: "STUDENT",
        title: "Exam Result Published",
        message: `Your score for ${exam.title} is ${numericScore}. Status: ${isPassed ? "PASSED ✅" : "FAILED ❌"}`,
        type: isPassed ? "SUCCESS" : "WARNING",
        createdBy: req.user._id,
      });
    } catch (notifError) {
      throw notifError;
    }

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Result already exists for this student in this exam",
      });
    }

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

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const results = await ExamResult.find({
      studentId: student._id,
    })
      .populate({
        path: "examId",
        match: { isActive: true }, // Only show active exams
        populate: {
          path: "classId",
          select: "className classType",
        },
      })
      .sort({
        createdAt: -1,
      });

    // Filter out results where exam was not found (inactive or deleted)
    const filteredResults = results.filter((result) => result.examId !== null);

    return res.status(200).json({
      success: true,
      count: filteredResults.length,
      data: filteredResults,
    });
  } catch (error) {
    console.error("Error getting student results:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExamsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const exams = await Exam.find({
      classId,
      isActive: true,
    })
      .populate("classId", "className classType")
      .sort({ examDate: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("Error getting exams by class:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .populate("classId", "className classType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("Error getting all exams:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkExamResult = async (req, res) => {
  try {
    const { examId, studentId } = req.query;

    if (!examId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID and Student ID are required",
      });
    }

    const result = await ExamResult.findOne({ examId, studentId });

    return res.status(200).json({
      success: true,
      exists: !!result,
      data: result,
    });
  } catch (error) {
    console.error("Error checking result:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
