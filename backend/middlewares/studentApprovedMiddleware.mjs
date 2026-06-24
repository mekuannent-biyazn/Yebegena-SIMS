import Student from "../models/Student.mjs";

const studentApproved = async (req, res, next) => {
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

    if (student.registrationStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Waiting for admin approval",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default studentApproved;
