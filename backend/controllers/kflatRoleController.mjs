import KflatRole from "../models/KflatRole.mjs";

import { validateKflatRole } from "../validators/kflatRoleValidator.mjs";

export const createKflatRole = async (req, res) => {
  try {
    const errors = validateKflatRole(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const existingRole = await KflatRole.findOne({
      "roleName.en": req.body.roleName.en.trim(),
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      });
    }

    const role = await KflatRole.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllKflatRoles = async (req, res) => {
  try {
    const roles = await KflatRole.find()
      .populate("createdBy", "fullName")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleKflatRole = async (req, res) => {
  try {
    const role = await KflatRole.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateKflatRole = async (req, res) => {
  try {
    const role = await KflatRole.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (req.body.roleName) {
      role.roleName = req.body.roleName;
    }

    if (req.body.description) {
      role.description = req.body.description;
    }

    if (typeof req.body.isActive === "boolean") {
      role.isActive = req.body.isActive;
    }

    await role.save();

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteKflatRole = async (req, res) => {
  try {
    const role = await KflatRole.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    role.isActive = false;

    await role.save();

    return res.status(200).json({
      success: true,
      message: "Role deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveKflatRoles = async (req, res) => {
  try {
    const roles = await KflatRole.find({
      isActive: true,
    }).sort({
      roleName: 1,
    });

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
