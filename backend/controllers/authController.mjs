import bcrypt, { compare } from "bcryptjs";

import User from "../models/User.mjs";
import Student from "../models/Student.mjs";
import Kflat from "../models/Kflat.mjs";
import KflatRole from "../models/KflatRole.mjs";

import cloudinary from "../config/cloudinary.mjs";

import normalizePhone from "../utils/normalizePhone.mjs";

import generateToken from "../utils/generateToken.mjs";

import { validateRegister } from "../validators/authValidator.mjs";
import { validateChangePassword } from "../validators/changePasswordValidator.mjs";
import { updateProfileValidator } from "../validators/updateProfileValidator.mjs";

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

    // Required fields validation
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

    // Phone validation using the fixed function
    const phoneRegex = /^(09\d{8}|2519\d{8}|\+2519\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Ethiopian phone number. Use format: 09XXXXXXXX, 2519XXXXXXXX, or +2519XXXXXXXX",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // *** IMPORTANT: Check dependency BEFORE validating role existence ***
    // Check if kflatRole is provided without kflat
    if (!kflat && kflatRole) {
      return res.status(400).json({
        success: false,
        message: "Kflat role cannot be selected without Kflat",
      });
    }

    // Only validate if kflat is actually provided (not empty string)
    if (kflat && kflat.trim()) {
      const kflatExists = await Kflat.findById(kflat);
      if (!kflatExists) {
        return res.status(404).json({
          success: false,
          message: "Selected Kflat not found",
        });
      }
    }

    // Only validate if kflatRole is actually provided (not empty string)
    if (kflatRole && kflatRole.trim()) {
      const roleExists = await KflatRole.findById(kflatRole);
      if (!roleExists) {
        return res.status(404).json({
          success: false,
          message: "Selected Kflat role not found",
        });
      }
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      phoneNumber,
      password: hashedPassword,
      role: "FRESH_STUDENT",
    });

    // Create student with proper handling of optional fields
    const studentData = {
      userId: user._id,
      studentStatus: "FRESH",
      registrationStatus: "PENDING",
    };

    // Only add kflat fields if they have values
    if (kflat && kflat.trim()) {
      studentData.kflat = kflat;
    }
    if (kflatRole && kflatRole.trim()) {
      studentData.kflatRole = kflatRole;
    }
    if (customKflatRole && customKflatRole.trim()) {
      studentData.customKflatRole = customKflatRole;
    }

    const student = await Student.create(studentData);

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
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // const normalizedPhone = normalizePhone(phoneNumber);

    const normalizedPhone = phoneNumber; // Use raw input

    console.log("Looking for user with phone:", normalizedPhone);

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
    // 1. Validate input
    const errors = validateChangePassword(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { currentPassword, newPassword } = req.body;

    // 2. Get user with password field (MUST include password)
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 4. Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // 5. Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();

    await user.save();

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a student
    const isStudent =
      user.role === "FRESH_STUDENT" || user.role === "ADVANCED_STUDENT";
    let studentData = null;

    if (isStudent) {
      studentData = await Student.findOne({ userId: user._id })
        .populate("assignedClass")
        .populate("kflat");
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        studentData,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("=== Update Profile Started ===");
    console.log("User:", req.user?._id);
    console.log("File received:", req.file ? "Yes" : "No");
    console.log("Body:", req.body);

    // 1. Validate input
    const errors = updateProfileValidator(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { fullName, phoneNumber } = req.body;

    // 2. Find user - FIXED: Added await
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check if phone number is already taken
    if (phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({
        phoneNumber: phoneNumber.trim(),
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already registered to another account",
        });
      }
    }

    // 4. Check if any changes were made
    const isNameChanged = fullName.trim() !== user.fullName;
    const isPhoneChanged = phoneNumber.trim() !== user.phoneNumber;
    const isPictureChanged = req.file ? true : false;

    if (!isNameChanged && !isPhoneChanged && !isPictureChanged) {
      return res.status(400).json({
        success: false,
        message: "No changes detected. Please update at least one field.",
      });
    }

    // 5. Handle picture upload
    let pictureUrl = user.picture;
    let picturePublicId = user.picturePublicId;

    if (req.file) {
      try {
        // Delete old picture if exists
        if (user.picturePublicId) {
          try {
            await cloudinary.uploader.destroy(user.picturePublicId);
            console.log("Old picture deleted:", user.picturePublicId);
          } catch (error) {
            console.error("Error deleting old picture:", error);
          }
        }

        // Upload new picture
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "profile_pictures",
              transformation: [
                { width: 500, height: 500, crop: "limit", quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          uploadStream.end(req.file.buffer);
        });

        pictureUrl = result.secure_url;
        picturePublicId = result.public_id;
        console.log("New picture uploaded:", picturePublicId);
      } catch (uploadError) {
        console.error("Picture upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    // 6. Update user - FIXED: Assign values correctly
    user.fullName = fullName.trim();
    user.phoneNumber = phoneNumber.trim();
    if (req.file) {
      user.picture = pictureUrl;
      user.picturePublicId = picturePublicId;
    }

    // 7. Save user - FIXED: This will work now
    await user.save();

    // 8. Return updated user
    const updatedUser = user.toObject();
    delete updatedUser.password;

    console.log("Profile updated successfully");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteProfilePicture = async (req, res) => {
  try {
    console.log("=== Delete Profile Picture Started ===");

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.picturePublicId) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to delete",
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.picturePublicId);
      console.log("Picture deleted from Cloudinary:", user.picturePublicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      // Continue even if Cloudinary delete fails
    }

    // Update user
    user.picture = null;
    user.picturePublicId = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Delete Profile Picture Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete profile picture",
    });
  }
};
