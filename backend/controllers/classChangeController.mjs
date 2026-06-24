import Student from "../models/Student.mjs";
import ClassChangeRequest from "../models/ClassChangeRequest.mjs";

export const createClassChangeRequest = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    });

    const existing = await ClassChangeRequest.findOne({
      requesterStudent: student._id,

      status: {
        $in: ["OPEN", "MATCHED"],
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active request",
      });
    }

    const request = await ClassChangeRequest.create({
      requesterStudent: student._id,

      currentClass: student.assignedClass,

      desiredClass: req.body.desiredClass,

      reason: req.body.reason,
    });

    await findMatch(request._id);

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailableVolunteers = async (req, res) => {
  try {
    const requests = await ClassChangeRequest.find({
      status: "OPEN",
    })
      .populate("requesterStudent")
      .populate("currentClass")
      .populate("desiredClass");

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyClassChangeRequest = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    });

    const request = await ClassChangeRequest.findOne({
      requesterStudent: student._id,
    });

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveClassChange = async (req, res) => {
  try {
    const request = await ClassChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "MATCHED") {
      return res.status(400).json({
        success: false,
        message: "Request is not matched yet",
      });
    }

    const studentA = await Student.findById(request.requesterStudent);

    const studentB = await Student.findById(request.matchedStudent);

    const tempClass = studentA.assignedClass;

    studentA.assignedClass = studentB.assignedClass;

    studentB.assignedClass = tempClass;

    await studentA.save();

    await studentB.save();

    await createNotification({
      recipient: studentA.userId,
      title: "Class Change Approved",
      message: "Your class change request has been approved.",
      type: "SYSTEM",
      createdBy: req.user._id,
    });

    await createNotification({
      recipient: studentB.userId,
      title: "Class Change Approved",
      message: "Your class change request has been approved.",
      type: "SYSTEM",
      createdBy: req.user._id,
    });

    request.status = "APPROVED";

    request.approvedBy = req.user._id;

    request.approvedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Class swap approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectClassChange = async (req, res) => {
  try {
    const request = await ClassChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "REJECTED";

    request.approvedBy = req.user._id;

    request.approvedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
