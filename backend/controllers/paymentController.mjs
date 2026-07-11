import Payment from "../models/Payment.mjs";
import PaymentConfig from "../models/PaymentConfig.mjs";
import Student from "../models/Student.mjs";
import cloudinary from "../config/cloudinary.mjs";
import SystemSetting from "../models/SystemSettings.mjs";

// Upload Payment
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "payments",
        resource_type: "image",
        transformation: [
          { width: 1000, height: 1000, crop: "limit", quality: "auto" },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

// Upload Payment
export const uploadPayment = async (req, res) => {
  try {
    console.log("=== Upload Payment Started ===");
    console.log("User:", req.user?._id);
    console.log("File received:", req.file ? "Yes" : "No");

    if (req.file) {
      console.log("File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Receipt image is required",
      });
    }

    // 2. Find student
    const student = await Student.findOne({
      userId: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    console.log("Student found:", student._id);
    console.log("Student status:", student.studentStatus);

    // 3. Get system settings
    let settings = await SystemSetting.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await SystemSetting.create({
        freshStudentFee: 1000,
        advancedStudentFee: 1500,
        paymentPeriodStartDay: 1,
        paymentPeriodEndDay: 10,
        classChangeEnabled: false,
        academicYear:
          new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        defaultLanguage: "en",
      });
      console.log("Default settings created:", settings);
    }

    console.log("System settings:", {
      freshStudentFee: settings.freshStudentFee,
      advancedStudentFee: settings.advancedStudentFee,
      paymentPeriodStartDay: settings.paymentPeriodStartDay,
      paymentPeriodEndDay: settings.paymentPeriodEndDay,
    });

    // 4. Determine fee based on student type
    let amount;
    if (
      student.studentStatus === "FRESH_STUDENT" ||
      student.studentStatus === "FRESH"
    ) {
      amount = settings.freshStudentFee;
    } else if (
      student.studentStatus === "ADVANCED_STUDENT" ||
      student.studentStatus === "ADVANCED"
    ) {
      amount = settings.advancedStudentFee;
    } else {
      // Default fallback
      amount = settings.freshStudentFee;
    }

    console.log("Amount to charge:", amount);

    // 5. Check payment period
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if within payment period
    if (
      currentDay < settings.paymentPeriodStartDay ||
      currentDay > settings.paymentPeriodEndDay
    ) {
      return res.status(400).json({
        success: false,
        message: `Payment period is closed. Open from ${settings.paymentPeriodStartDay} to ${settings.paymentPeriodEndDay} of each month.`,
        period: {
          startDay: settings.paymentPeriodStartDay,
          endDay: settings.paymentPeriodEndDay,
          currentDay: currentDay,
        },
      });
    }

    // 6. Check if payment already exists for this month
    const existingPayment = await Payment.findOne({
      student: student._id,
      paymentMonth: currentMonth,
      paymentYear: currentYear,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: `Payment already submitted for ${currentMonth}/${currentYear}`,
      });
    }

    // 7. Upload to Cloudinary
    let cloudResult;
    try {
      console.log("Uploading to Cloudinary...");
      cloudResult = await uploadToCloudinary(req.file.buffer, {
        folder: "payments",
      });
      console.log("Cloudinary upload successful:", cloudResult.public_id);
    } catch (cloudError) {
      console.error("Cloudinary upload error:", cloudError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload receipt image. Please try again.",
        error:
          process.env.NODE_ENV === "development"
            ? cloudError.message
            : undefined,
      });
    }

    // 8. Create payment
    const payment = await Payment.create({
      student: student._id,
      paymentMonth: currentMonth,
      paymentYear: currentYear,
      amount: amount,
      receiptImage: cloudResult.secure_url,
      cloudinaryPublicId: cloudResult.public_id,
      status: "PENDING",
    });

    console.log("Payment created:", payment._id);

    // 9. Populate payment data
    const populatedPayment = await Payment.findById(payment._id).populate({
      path: "student",
      populate: {
        path: "userId",
        select: "fullName phoneNumber",
      },
    });

    // Transform for frontend
    const result = populatedPayment.toObject();
    result.paymentStatus = result.status;
    result.receiptUrl = result.receiptImage;

    return res.status(201).json({
      success: true,
      message: "Payment submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upload payment error:", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload payment",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get My Payments
export const getMyPayments = async (req, res) => {
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

    const payments = await Payment.find({
      student: student._id,
    })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .sort({
        createdAt: -1,
      });

    // Transform for frontend
    const formattedPayments = payments.map((p) => {
      const obj = p.toObject();
      obj.paymentStatus = obj.status;
      obj.receiptUrl = obj.receiptImage;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: formattedPayments,
    });
  } catch (error) {
    console.error("Get my payments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Payments (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "fullName phoneNumber",
        },
      })
      .sort({
        createdAt: -1,
      });

    // Transform for frontend
    const formattedPayments = payments.map((p) => {
      const obj = p.toObject();
      obj.paymentStatus = obj.status;
      obj.receiptUrl = obj.receiptImage;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: formattedPayments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Payment
export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "student",
      populate: {
        path: "userId",
        select: "fullName phoneNumber",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status.toLowerCase()}`,
      });
    }

    payment.status = "APPROVED";
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();

    await payment.save();

    const result = payment.toObject();
    result.paymentStatus = result.status;
    result.receiptUrl = result.receiptImage;

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Approve payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Payment
export const rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "student",
      populate: {
        path: "userId",
        select: "fullName phoneNumber",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status.toLowerCase()}`,
      });
    }

    payment.status = "REJECTED";
    payment.rejectionReason = rejectionReason.trim();
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();

    await payment.save();

    const result = payment.toObject();
    result.paymentStatus = result.status;
    result.receiptUrl = result.receiptImage;

    return res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error("Reject payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Payment Statistics
export const paymentStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const approved = await Payment.countDocuments({ status: "APPROVED" });
    const rejected = await Payment.countDocuments({ status: "REJECTED" });
    const pending = await Payment.countDocuments({ status: "PENDING" });

    const approvedPayments = await Payment.find({ status: "APPROVED" });
    const totalIncome = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        total,
        approved,
        rejected,
        pending,
        totalIncome,
        totalCount: total,
        approvedCount: approved,
        rejectedCount: rejected,
        pendingCount: pending,
      },
    });
  } catch (error) {
    console.error("Payment stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Delete image from Cloudinary
    if (payment.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(payment.cloudinaryPublicId);
      } catch (error) {
        console.error("Cloudinary delete error:", error);
      }
    }

    await Payment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
