import Student from "../models/Student.mjs";
import User from "../models/User.mjs";
import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";
import { createNotification } from "./notificationService.mjs";

const promoteStudent = async (studentId, adminId) => {
  try {
    // 1. Find the student
    const student = await Student.findById(studentId).populate("assignedClass");

    if (!student) {
      throw new Error("Student not found");
    }

    // 2. Check if student is already advanced
    if (student.studentStatus === "ADVANCED") {
      throw new Error("Student is already at Advanced level");
    }

    // 3. Check if student is FRESH
    if (student.studentStatus !== "FRESH") {
      throw new Error(
        `Student is not eligible for promotion (Current status: ${student.studentStatus})`,
      );
    }

    // 4. Check if student has an assigned class
    if (!student.assignedClass) {
      throw new Error("Student has no assigned class");
    }

    // 5. Find exams for this class
    const writtenExam = await Exam.findOne({
      classId: student.assignedClass._id,
      examType: "WRITTEN",
      isActive: true,
    });

    const practicalExam = await Exam.findOne({
      classId: student.assignedClass._id,
      examType: "PRACTICAL",
      isActive: true,
    });

    // 6. Check if exams exist
    if (!writtenExam || !practicalExam) {
      console.log(`Missing exams for class: ${student.assignedClass._id}`);
      console.log(`Written exam found: ${!!writtenExam}`);
      console.log(`Practical exam found: ${!!practicalExam}`);
      throw new Error(
        "Required exams (Written and Practical) have not been created for this class yet",
      );
    }

    // 7. Check if student has passed both exams
    const writtenResult = await ExamResult.findOne({
      examId: writtenExam._id,
      studentId: student._id,
      isPassed: true,
    });

    const practicalResult = await ExamResult.findOne({
      examId: practicalExam._id,
      studentId: student._id,
      isPassed: true,
    });

    // 8. Check if student passed both exams
    if (!writtenResult || !practicalResult) {
      const missingResults = [];
      if (!writtenResult) missingResults.push("Written");
      if (!practicalResult) missingResults.push("Practical");

      throw new Error(
        `Student has not passed all required exams. Missing: ${missingResults.join(" and ")}`,
      );
    }

    // 9. Check if student passed with minimum scores (optional additional validation)
    const writtenScore = writtenResult.score || 0;
    const practicalScore = practicalResult.score || 0;
    const writtenPassingScore = writtenExam.passingScore || 50;
    const practicalPassingScore = practicalExam.passingScore || 50;

    if (
      writtenScore < writtenPassingScore ||
      practicalScore < practicalPassingScore
    ) {
      throw new Error(
        `Student scores are below passing threshold. Written: ${writtenScore}/${writtenPassingScore}, Practical: ${practicalScore}/${practicalPassingScore}`,
      );
    }

    // 10. Perform the promotion
    // Update student status
    student.studentStatus = "ADVANCED";
    await student.save();

    // Update user role
    const user = await User.findById(student.userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.role = "ADVANCED_STUDENT";
    await user.save();

    // 11. Create notification for student
    try {
      await createNotification({
        recipient: student.userId,
        recipientType: "STUDENT",
        title: "🎉 Promotion Successful!",
        message: `Congratulations ${user.fullName}! You have been promoted from Fresh to Advanced Student. You are now eligible for advanced classes and opportunities.`,
        type: "SUCCESS",
        createdBy: adminId,
      });
    } catch (notifError) {
      console.error("Failed to create promotion notification:", notifError);
      // Continue even if notification fails
    }

    // 12. Create notification for admin (optional)
    try {
      await createNotification({
        recipient: adminId,
        recipientType: "ADMIN",
        title: "Student Promoted",
        message: `${user.fullName} has been successfully promoted to Advanced Student.`,
        type: "INFO",
        createdBy: adminId,
      });
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    // Return populated student data
    const promotedStudent = await Student.findById(studentId)
      .populate("assignedClass")
      .populate("userId", "fullName phoneNumber email role");

    return promotedStudent;
  } catch (error) {
    console.error("Promotion error:", error);
    throw error;
  }
};

export default promoteStudent;
