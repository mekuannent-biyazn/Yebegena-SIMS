import Student from "../models/Student.mjs";
import User from "../models/User.mjs";
import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";
import { createNotification } from "./notificationService.mjs";

const promoteStudent = async (studentId, adminId) => {
  try {
    const student = await Student.findById(studentId).populate("assignedClass");

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.studentStatus === "ADVANCED") {
      throw new Error("Student is already at Advanced level");
    }

    if (student.studentStatus !== "FRESH") {
      throw new Error(
        `Student is not eligible for promotion (Current status: ${student.studentStatus})`,
      );
    }

    if (!student.assignedClass) {
      throw new Error("Student has no assigned class");
    }

    const writtenExams = await Exam.find({
      classId: student.assignedClass._id,
      examType: "WRITTEN",
    }).sort({ createdAt: -1 });

    const practicalExams = await Exam.find({
      classId: student.assignedClass._id,
      examType: "PRACTICAL",
    }).sort({ createdAt: -1 });

    if (writtenExams.length === 0 || practicalExams.length === 0) {
      throw new Error(
        `Required exams (Written and Practical) have not been created for this class yet.`,
      );
    }

    const writtenExam = writtenExams[0];
    const practicalExam = practicalExams[0];

    const writtenResult = await ExamResult.findOne({
      examId: writtenExam._id,
      studentId: student._id,
    });

    const practicalResult = await ExamResult.findOne({
      examId: practicalExam._id,
      studentId: student._id,
    });

    let writtenResultFound = writtenResult;
    if (!writtenResult) {
      const allWrittenResults = await ExamResult.find({
        studentId: student._id,
      }).populate("examId");

      const classWrittenResults = allWrittenResults.filter(
        (r) =>
          r.examId &&
          r.examId.classId &&
          r.examId.classId.toString() ===
            student.assignedClass._id.toString() &&
          r.examId.examType === "WRITTEN",
      );

      if (classWrittenResults.length > 0) {
        const passedWritten = classWrittenResults.find(
          (r) => r.isPassed === true,
        );
        if (passedWritten) {
          writtenResultFound = passedWritten;
        }
      }
    }

    if (!writtenResultFound || !practicalResult) {
      const missing = [];
      if (!writtenResultFound) missing.push("Written");
      if (!practicalResult) missing.push("Practical");

      throw new Error(
        `Student has not completed all required exams. Missing: ${missing.join(" and ")}`,
      );
    }

    const writtenPassingScore = writtenExam.passingScore || 50;
    const practicalPassingScore = practicalExam.passingScore || 50;

    const writtenPassed = writtenResultFound.score >= writtenPassingScore;
    const practicalPassed = practicalResult.score >= practicalPassingScore;

    if (!writtenPassed || !practicalPassed) {
      const missingExams = [];
      if (!writtenPassed) {
        missingExams.push(
          `Written (Score: ${writtenResultFound.score}/${writtenPassingScore} needed)`,
        );
      }
      if (!practicalPassed) {
        missingExams.push(
          `Practical (Score: ${practicalResult.score}/${practicalPassingScore} needed)`,
        );
      }

      throw new Error(
        `Student has not passed all required exams. Missing: ${missingExams.join(" and ")}`,
      );
    }

    student.studentStatus = "ADVANCED";
    await student.save();

    const user = await User.findById(student.userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.role = "ADVANCED_STUDENT";
    await user.save();

    try {
      await createNotification({
        recipient: student.userId,
        recipientType: "STUDENT",
        title: "🎉 Promotion Successful!",
        message: `Congratulations ${user.fullName}! You have been promoted from Fresh to Advanced Student.`,
        type: "SUCCESS",
        createdBy: adminId,
      });
    } catch (notifError) {
      throw notifError;
    }

    const promotedStudent = await Student.findById(studentId)
      .populate("assignedClass")
      .populate("userId", "fullName phoneNumber email role");

    return promotedStudent;
  } catch (error) {
    throw error;
  }
};

export default promoteStudent;
