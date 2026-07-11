import promoteStudent from "../services/promotionService.mjs";

export const promoteStudentController = async (req, res) => {
  try {
    const student = await promoteStudent(req.params.studentId, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Student promoted successfully",
      data: student,
    });
  } catch (error) {
    console.error("Promotion controller error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
