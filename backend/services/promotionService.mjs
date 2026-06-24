import Student from "../models/Student.mjs";
import User from "../models/User.mjs";
import Exam from "../models/Exam.mjs";
import ExamResult from "../models/ExamResult.mjs";

import { createNotification } from "./notificationService.mjs";

const promoteStudent = async (studentId, adminId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const writtenExam = await Exam.findOne({
    classId: student.assignedClass,
    examType: "WRITTEN",
  });

  const practicalExam = await Exam.findOne({
    classId: student.assignedClass,
    examType: "PRACTICAL",
  });

  if (!writtenExam || !practicalExam) {
    throw new Error("Required exams not found");
  }

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

  if (!writtenResult || !practicalResult) {
    throw new Error("Student has not passed all exams");
  }

  student.studentStatus = "ADVANCED";

  await student.save();

  const user = await User.findById(student.userId);

  user.role = "ADVANCED_STUDENT";

  await user.save();

  await createNotification({
    recipient: student.userId,

    title: "Promotion Successful",

    message: "Congratulations! You have been promoted to Advanced Student.",

    type: "PROMOTION",

    createdBy: adminId,
  });

  return student;
};

export default promoteStudent;
