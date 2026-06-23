import bcrypt from "bcryptjs";

import User from "../models/User.mjs";

import normalizePhone from "../utils/normalizePhone.mjs";

import generateToken from "../utils/generateToken.mjs";

import { validateRegister } from "../validators/authValidator.mjs";
import { validateChangePassword } from "../validators/changePasswordValidator.mjs";

export const register = async (req, res) => {
  try {
    const { fullName, phoneNumber, password, confirmPassword } = req.body;

    const validationErrors = validateRegister({
      fullName,
      phoneNumber,
      password,
      confirmPassword,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const normalizedPhone = normalizePhone(phoneNumber);

    const existingUser = await User.findOne({
      phoneNumber: normalizedPhone,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phoneNumber: normalizedPhone,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user,
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
