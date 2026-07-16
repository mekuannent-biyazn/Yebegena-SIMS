import Student from "../models/Student.mjs";
import ClassChangeRequest from "../models/ClassChangeRequest.mjs";
import Class from "../models/Class.mjs";
import SystemSetting from "../models/SystemSettings.mjs";
import { createNotification } from "../services/notificationService.mjs";
import findMatch from "../services/classChangeMatcherService.mjs";

export const createClassChangeRequest = async (req, res) => {
  try {
    // Check if class change is enabled
    const settings = await SystemSetting.findOne();
    if (!settings || !settings.classChangeEnabled) {
      return res.status(400).json({
        success: false,
        message: "Class change requests are currently disabled by admin",
      });
    }

    const student = await Student.findOne({
      userId: req.user._id,
    }).populate("assignedClass");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student already has an active request
    const existing = await ClassChangeRequest.findOne({
      requesterStudent: student._id,
      status: {
        $in: ["OPEN", "MATCHED"],
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active class change request",
      });
    }

    // If desiredClass is provided, verify it exists and is different from current
    let desiredClass = null;
    if (req.body.desiredClass) {
      desiredClass = await Class.findById(req.body.desiredClass);
      if (!desiredClass) {
        return res.status(404).json({
          success: false,
          message: "Desired class not found",
        });
      }

      // Check if desired class is the same as current
      if (
        desiredClass._id.toString() === student.assignedClass._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "You are already in this class",
        });
      }
    }

    const request = await ClassChangeRequest.create({
      requesterStudent: student._id,
      currentClass: student.assignedClass._id,
      desiredClass: req.body.desiredClass || null,
      reason: req.body.reason || "",
    });

    // Try to find a match
    await findMatch(request._id);

    // Get the updated request with populated fields
    const populatedRequest = await ClassChangeRequest.findById(request._id)
      .populate({
        path: "requesterStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .populate("currentClass", "className classType")
      .populate("desiredClass", "className classType")
      .populate("matchedStudent", "userId assignedClass");

    return res.status(201).json({
      success: true,
      message: "Class change request created successfully",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Create class change request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailableVolunteers = async (req, res) => {
  try {
    const userRole = req.user.role;
    const isAdmin = userRole === "ADMIN";

    // Find all OPEN requests
    let query = { status: "OPEN" };

    // If not admin, exclude the current user's requests
    if (!isAdmin) {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.requesterStudent = { $ne: student._id };
      }
    }

    const requests = await ClassChangeRequest.find(query)
      .populate({
        path: "requesterStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .populate("currentClass", "className classType")
      .populate("desiredClass", "className classType")
      .populate({
        path: "matchedStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .sort({ createdAt: -1 });

    // If admin, return all requests with status info
    if (isAdmin) {
      return res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    }

    // For students, add match detection
    const student = await Student.findOne({ userId: req.user._id }).populate(
      "assignedClass",
    );
    const matchedVolunteers = requests.map((request) => {
      const isMatch =
        request.desiredClass &&
        student?.assignedClass &&
        request.desiredClass._id.toString() ===
          student.assignedClass._id.toString();

      return {
        ...request.toObject(),
        isMatch: isMatch || false,
        matchType: isMatch ? "perfect" : "available",
      };
    });

    return res.status(200).json({
      success: true,
      count: matchedVolunteers.length,
      data: matchedVolunteers,
      currentClass: student?.assignedClass || null,
    });
  } catch (error) {
    console.error("Get volunteers error:", error);
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
    }).populate("assignedClass");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const request = await ClassChangeRequest.findOne({
      requesterStudent: student._id,
    })
      .populate({
        path: "requesterStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .populate("currentClass", "className classType")
      .populate("desiredClass", "className classType")
      .populate({
        path: "matchedStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .sort({ createdAt: -1 });

    // If request exists but currentClass is not populated, manually populate it
    if (request && !request.currentClass) {
      const studentData = await Student.findById(
        request.requesterStudent._id,
      ).populate("assignedClass");
      if (studentData && studentData.assignedClass) {
        request.currentClass = studentData.assignedClass;
      }
    }

    return res.status(200).json({
      success: true,
      data: request,
      currentClass: student.assignedClass,
    });
  } catch (error) {
    console.error("Get my request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const acceptVolunteerMatch = async (req, res) => {
  try {
    const { volunteerRequestId } = req.body;

    // Get the current student
    const currentStudent = await Student.findOne({
      userId: req.user._id,
    }).populate("assignedClass");

    if (!currentStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get the volunteer request
    const volunteerRequest = await ClassChangeRequest.findById(
      volunteerRequestId,
    )
      .populate({
        path: "requesterStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .populate("currentClass", "className classType")
      .populate("desiredClass", "className classType");

    if (!volunteerRequest) {
      return res.status(404).json({
        success: false,
        message: "Volunteer request not found",
      });
    }

    if (volunteerRequest.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "This volunteer is no longer available",
      });
    }

    // Check if the volunteer wants the current student's class
    if (
      !volunteerRequest.desiredClass ||
      volunteerRequest.desiredClass._id.toString() !==
        currentStudent.assignedClass._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "This volunteer does not want your current class",
      });
    }

    // Check if current student already has a request
    let currentStudentRequest = await ClassChangeRequest.findOne({
      requesterStudent: currentStudent._id,
      status: { $in: ["OPEN", "MATCHED"] },
    });

    if (currentStudentRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active request. Please cancel it first.",
      });
    }

    // Create a new request for the current student
    currentStudentRequest = await ClassChangeRequest.create({
      requesterStudent: currentStudent._id,
      currentClass: volunteerRequest.currentClass._id,
      desiredClass: volunteerRequest.desiredClass._id,
      reason: `Accepted match with ${volunteerRequest.requesterStudent.userId.fullName}`,
      status: "MATCHED", // Set to MATCHED, waiting for admin approval
      matchedStudent: volunteerRequest.requesterStudent._id,
    });

    // Update the volunteer's request to MATCHED
    volunteerRequest.status = "MATCHED";
    volunteerRequest.matchedStudent = currentStudent._id;
    await volunteerRequest.save();

    // Send notifications to both students
    try {
      await createNotification({
        recipient: volunteerRequest.requesterStudent.userId,
        recipientType: "STUDENT",
        title: "🔔 Match Found!",
        message: `Your class change request has been matched with ${currentStudent.userId.fullName}! Please wait for admin approval.`,
        type: "INFO",
        createdBy: req.user._id,
      });

      await createNotification({
        recipient: currentStudent.userId,
        recipientType: "STUDENT",
        title: "🔔 Match Found!",
        message: `You have been matched with ${volunteerRequest.requesterStudent.userId.fullName}! Please wait for admin approval.`,
        type: "INFO",
        createdBy: req.user._id,
      });

      // Notify admin about the match
      const adminUsers = await User.find({ role: "ADMIN" });
      for (const admin of adminUsers) {
        await createNotification({
          recipient: admin._id,
          recipientType: "ADMIN",
          title: "🔔 New Class Change Match",
          message: `${currentStudent.userId.fullName} and ${volunteerRequest.requesterStudent.userId.fullName} have matched. Please review and approve the class change.`,
          type: "INFO",
          createdBy: req.user._id,
        });
      }
    } catch (notifError) {
      console.error("Failed to create notifications:", notifError);
    }

    return res.status(200).json({
      success: true,
      message: "Match accepted! Waiting for admin approval.",
      data: {
        currentStudentRequest,
        volunteerRequest,
        matchStatus: "PENDING_ADMIN_APPROVAL",
      },
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
    const request = await ClassChangeRequest.findById(req.params.id)
      .populate("requesterStudent")
      .populate("matchedStudent");

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

    const studentA = await Student.findById(
      request.requesterStudent._id,
    ).populate("assignedClass");
    const studentB = await Student.findById(
      request.matchedStudent._id,
    ).populate("assignedClass");

    if (!studentA || !studentB) {
      return res.status(404).json({
        success: false,
        message: "One or both students not found",
      });
    }

    // Store old class names for notification
    const oldClassA = studentA.assignedClass?.className || "N/A";
    const oldClassB = studentB.assignedClass?.className || "N/A";

    // Swap classes
    const tempClass = studentA.assignedClass;
    studentA.assignedClass = studentB.assignedClass;
    studentB.assignedClass = tempClass;

    await studentA.save();
    await studentB.save();

    // Update both requests
    request.status = "APPROVED";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    // Find and update the matched student's request
    const matchedRequest = await ClassChangeRequest.findOne({
      requesterStudent: request.matchedStudent._id,
      status: "MATCHED",
    });

    if (matchedRequest) {
      matchedRequest.status = "APPROVED";
      matchedRequest.approvedBy = req.user._id;
      matchedRequest.approvedAt = new Date();
      await matchedRequest.save();
    }

    // Send notifications to both students
    try {
      await createNotification({
        recipient: studentA.userId,
        recipientType: "STUDENT",
        title: "🎉 Class Change Approved!",
        message: `Your class change has been approved! You have been moved from ${oldClassA} to ${studentA.assignedClass?.className || "new class"}`,
        type: "SUCCESS",
        createdBy: req.user._id,
      });

      await createNotification({
        recipient: studentB.userId,
        recipientType: "STUDENT",
        title: "🎉 Class Change Approved!",
        message: `Your class change has been approved! You have been moved from ${oldClassB} to ${studentB.assignedClass?.className || "new class"}`,
        type: "SUCCESS",
        createdBy: req.user._id,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return res.status(200).json({
      success: true,
      message: "Class swap approved successfully",
      data: {
        studentA: {
          _id: studentA._id,
          fullName: studentA.userId?.fullName,
          newClass: studentA.assignedClass,
        },
        studentB: {
          _id: studentB._id,
          fullName: studentB.userId?.fullName,
          newClass: studentB.assignedClass,
        },
      },
    });
  } catch (error) {
    console.error("Approve class change error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectClassChange = async (req, res) => {
  try {
    const request = await ClassChangeRequest.findById(req.params.id).populate(
      "requesterStudent",
    );

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

    // Notify the student
    try {
      await createNotification({
        recipient: request.requesterStudent.userId,
        recipientType: "STUDENT",
        title: "Class Change Request Rejected",
        message: "Your class change request has been rejected by admin.",
        type: "WARNING",
        createdBy: req.user._id,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    console.error("Reject class change error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelClassChangeRequest = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const request = await ClassChangeRequest.findOne({
      requesterStudent: student._id,
      status: { $in: ["OPEN", "MATCHED"] },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No active request found",
      });
    }

    // If the request is MATCHED, also update the matched request
    if (request.status === "MATCHED" && request.matchedStudent) {
      const matchedRequest = await ClassChangeRequest.findOne({
        requesterStudent: request.matchedStudent,
        status: "MATCHED",
      });
      if (matchedRequest) {
        matchedRequest.status = "OPEN";
        matchedRequest.matchedStudent = null;
        await matchedRequest.save();
      }
    }

    request.status = "CANCELLED";
    request.matchedStudent = null;
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel class change error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all requests for admin
export const getAllRequests = async (req, res) => {
  try {
    const requests = await ClassChangeRequest.find()
      .populate({
        path: "requesterStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber email",
        },
      })
      .populate("currentClass", "className classType")
      .populate("desiredClass", "className classType")
      .populate({
        path: "matchedStudent",
        populate: {
          path: "userId",
          select: "fullName phoneNumber email",
        },
      })
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: requests.length,
      open: requests.filter((r) => r.status === "OPEN").length,
      matched: requests.filter((r) => r.status === "MATCHED").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
      cancelled: requests.filter((r) => r.status === "CANCELLED").length,
    };

    return res.status(200).json({
      success: true,
      data: requests,
      stats,
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
