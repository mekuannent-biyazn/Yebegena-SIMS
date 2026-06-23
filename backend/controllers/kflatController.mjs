import Kflat from "../models/Kflat.mjs";
import { validateKflat } from "../validators/KflatValidator.mjs";

export const createKflat = async (req, res) => {
  try {
    const { name } = req.body;

    const errors = validateKflat({ name });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const existingKflat = await Kflat.findOne({
      name: name.trim(),
    });

    if (existingKflat) {
      return res.status(400).json({
        success: false,
        message: "Kflat already exists",
      });
    }

    const kflat = await Kflat.create({
      name: name.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: kflat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllKflats = async (req, res) => {
  try {
    const kflats = await Kflat.find()
      .populate("createdBy", "fullName phoneNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: kflats.length,
      data: kflats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleKflat = async (req, res) => {
  try {
    const kflat = await Kflat.findById(req.params.id);

    if (!kflat) {
      return res.status(404).json({
        success: false,
        message: "Kflat not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: kflat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateKflat = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const kflat = await Kflat.findById(req.params.id);

    if (!kflat) {
      return res.status(404).json({
        success: false,
        message: "Kflat not found",
      });
    }

    kflat.name = name || kflat.name;

    if (typeof isActive === "boolean") {
      kflat.isActive = isActive;
    }

    await kflat.save();

    return res.status(200).json({
      success: true,
      data: kflat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteKflat = async (req, res) => {
  try {
    const kflat = await Kflat.findById(req.params.id);

    if (!kflat) {
      return res.status(404).json({
        success: false,
        message: "Kflat not found",
      });
    }

    kflat.isActive = false;

    await kflat.save();

    return res.status(200).json({
      success: true,
      message: "Kflat deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
