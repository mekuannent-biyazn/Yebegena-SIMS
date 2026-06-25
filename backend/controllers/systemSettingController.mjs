import SystemSetting from "../models/SystemSettings.mjs";

export const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findOne();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      {},
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
