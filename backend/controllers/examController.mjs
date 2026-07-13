import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";
import Student from "../models/Student.mjs";
import Class from "../models/Class.mjs";
import Teacher from "../models/Teacher.mjs";
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

    // Verify teacher is assigned to this class
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: "You are not registered as a teacher",
      });
    }

    // Check if teacher is assigned to this class
    const isAssigned = teacher.assignedClasses.some(
      (cId) => cId.toString() === classId,
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this class",
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
      registrationStatus: "APPROVED",
      isActive: true,
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

    // Get the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Verify teacher is assigned to the exam's class
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: "You are not registered as a teacher",
      });
    }

    // Check if teacher is assigned to the class of this exam
    const isAssignedToClass = teacher.assignedClasses.some(
      (classId) => classId.toString() === exam.classId.toString(),
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to the class of this exam",
      });
    }

    // Get the student
    const student = await Student.findById(studentId).populate(
      "userId",
      "fullName email phoneNumber",
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify student is in the exam's class
    if (
      !student.assignedClass ||
      student.assignedClass.toString() !== exam.classId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in the class for this exam",
      });
    }

    // Validate score
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

    const isPassed = numericScore >= exam.passingScore;

    // Check if result already exists
    const existingResult = await ExamResult.findOne({ examId, studentId });

    let result;
    let isUpdate = false;

    if (existingResult) {
      // Update existing result
      existingResult.score = numericScore;
      existingResult.isPassed = isPassed;
      existingResult.remark = remark || existingResult.remark || "";
      existingResult.enteredBy = req.user._id;
      await existingResult.save();
      result = existingResult;
      isUpdate = true;
    } else {
      // Create new result
      result = await ExamResult.create({
        examId,
        studentId,
        score: numericScore,
        isPassed,
        remark: remark || "",
        enteredBy: req.user._id,
      });
    }

    // Send notification to student
    try {
      await createNotification({
        recipient: student.userId._id || student.userId,
        recipientType: "STUDENT",
        title: isUpdate ? "Exam Result Updated" : "Exam Result Published",
        message: `Your score for ${exam.title} is ${numericScore}. Status: ${isPassed ? "PASSED ✅" : "FAILED ❌"}`,
        type: isPassed ? "SUCCESS" : "WARNING",
        createdBy: req.user._id,
      });
    } catch (notifError) {
      console.error("Failed to send notification:", notifError.message);
    }

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      data: result,
      message: isUpdate
        ? "Result updated successfully"
        : "Result added successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Result already exists for this student in this exam",
      });
    }

    console.error("Error adding exam result:", error);
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
        match: { isActive: true },
        populate: {
          path: "classId",
          select: "className classType",
        },
      })
      .sort({
        createdAt: -1,
      });

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
    const user = req.user;

    // If teacher, verify they are assigned to the class
    const teacher = await Teacher.findOne({ userId: user._id });
    if (teacher) {
      const isAssigned = teacher.assignedClasses.some(
        (cId) => cId.toString() === classId,
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this class",
        });
      }
    }

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
    const user = req.user;
    let query = { isActive: true };

    // If teacher, only get exams for their classes
    const teacher = await Teacher.findOne({ userId: user._id });
    if (
      teacher &&
      teacher.assignedClasses &&
      teacher.assignedClasses.length > 0
    ) {
      query.classId = { $in: teacher.assignedClasses };
    }

    const exams = await Exam.find(query)
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

    // Verify teacher has access to this exam
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (teacher) {
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      const isAssigned = teacher.assignedClasses.some(
        (cId) => cId.toString() === exam.classId.toString(),
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this exam",
        });
      }
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

export const getEligibleStudentsForExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Validate examId
    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Verify teacher is assigned to the class
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: "You are not registered as a teacher",
      });
    }

    const isAssigned = teacher.assignedClasses.some(
      (cId) => cId.toString() === exam.classId.toString(),
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to the class of this exam",
      });
    }

    // Get all students in the exam's class
    const students = await Student.find({
      assignedClass: exam.classId,
      registrationStatus: "APPROVED",
      isActive: true,
    }).populate("userId", "fullName email phoneNumber profilePicture");

    // Get results to check which students already have results
    const results = await ExamResult.find({
      examId,
      studentId: { $in: students.map((s) => s._id) },
    });

    const studentResultsMap = {};
    results.forEach((r) => {
      studentResultsMap[r.studentId.toString()] = r;
    });

    // Format response with result status
    const formattedStudents = students.map((student) => ({
      ...student.toObject(),
      hasResult: !!studentResultsMap[student._id.toString()],
      result: studentResultsMap[student._id.toString()] || null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents,
    });
  } catch (error) {
    console.error("Error getting eligible students:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
