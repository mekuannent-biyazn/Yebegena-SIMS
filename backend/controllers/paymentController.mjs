import Payment from "../models/Payment.mjs";
import PaymentConfig from "../models/PaymentConfig.mjs";
import Student from "../models/Student.mjs";

import { createNotification } from "../services/notificationService.mjs";

import uploadToCloudinary from "../utils/uploadToCloudinary.mjs";

export const uploadPayment = async (req, res) => {
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

    const config = await PaymentConfig.findOne({
      studentType: student.studentStatus,
      isActive: true,
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Payment configuration not found",
      });
    }

    const today = new Date();

    const currentDay = today.getDate();

    if (currentDay < config.startDay || currentDay > config.endDay) {
      return res.status(400).json({
        success: false,
        message: "Payment period is closed",
      });
    }

    const month = today.getMonth() + 1;

    const year = today.getFullYear();

    const existingPayment = await Payment.findOne({
      student: student._id,

      paymentMonth: month,

      paymentYear: year,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already submitted for this month",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Receipt image is required",
      });
    }

    const cloudResult = await uploadToCloudinary(req.file.buffer);

    const payment = await Payment.create({
      student: student._id,

      paymentMonth: month,

      paymentYear: year,

      amount: config.amount,

      receiptImage: cloudResult.secure_url,

      cloudinaryPublicId: cloudResult.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Payment submitted successfully",

      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    });

    const payments = await Payment.find({
      student: student._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "APPROVED";

    payment.reviewedBy = req.user._id;

    payment.reviewedAt = new Date();

    await payment.save();

    const student = await Student.findById(payment.student);

    await createNotification({
      recipient: student.userId,

      title: "Payment Approved",

      message: "Your monthly payment has been approved.",

      type: "PAYMENT",

      createdBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "REJECTED";

    payment.rejectionReason = rejectionReason;

    payment.reviewedBy = req.user._id;

    payment.reviewedAt = new Date();

    await payment.save();

    await createNotification({
      recipient: student.userId,

      title: "Payment Rejected",

      message: rejectionReason,

      type: "PAYMENT",

      createdBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const paymentStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments();

    const approved = await Payment.countDocuments({
      status: "APPROVED",
    });

    const rejected = await Payment.countDocuments({
      status: "REJECTED",
    });

    const pending = await Payment.countDocuments({
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        approved,
        rejected,
        pending,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
