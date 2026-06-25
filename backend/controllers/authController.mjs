import bcrypt from "bcryptjs";

import User from "../models/User.mjs";
import Student from "../models/Student.mjs";
import Kflat from "../models/Kflat.mjs";
import KflatRole from "../models/KflatRole.mjs";

import normalizePhone from "../utils/normalizePhone.mjs";

import generateToken from "../utils/generateToken.mjs";

import { validateRegister } from "../validators/authValidator.mjs";
import { validateChangePassword } from "../validators/changePasswordValidator.mjs";

export const register = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      password,
      confirmPassword,

      kflat,
      kflatRole,
      customKflatRole,
    } = req.body;

    if (!fullName || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const phoneRegex = /^(09\d{8}|2519\d{8}|\+2519\d{8})$/;

    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethiopian phone number",
      });
    }

    const existingUser = await User.findOne({
      phoneNumber,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    if (kflat) {
      const kflatExists = await Kflat.findById(kflat);

      if (!kflatExists) {
        return res.status(404).json({
          success: false,
          message: "Selected Kflat not found",
        });
      }
    }

    if (kflatRole) {
      const roleExists = await KflatRole.findById(kflatRole);

      if (!roleExists) {
        return res.status(404).json({
          success: false,
          message: "Selected Kflat role not found",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phoneNumber,
      password: hashedPassword,

      role: "FRESH_STUDENT",
    });

    const student = await Student.create({
      userId: user._id,

      kflat: kflat || null,

      kflatRole: kflatRole || null,

      customKflatRole: customKflatRole || null,

      studentStatus: "FRESH",

      registrationStatus: "PENDING",
    });

    if (!kflat && kflatRole) {
      return res.status(400).json({
        success: false,
        message: "Kflat role cannot be selected without Kflat",
      });
    }

    return res.status(201).json({
      success: true,

      message:
        "Registration submitted successfully. Waiting for admin approval.",

      data: {
        userId: user._id,
        studentId: student._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const normalizedPhone = normalizePhone(phoneNumber);

    const user = await User.findOne({
      phoneNumber: normalizedPhone,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,

      mustChangePassword: user.mustChangePassword,

      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const errors = validateChangePassword(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.mustChangePassword = false;

    user.passwordChangedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
