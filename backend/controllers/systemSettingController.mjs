import SystemSetting from "../models/SystemSettings.mjs";

export const getSettings = async (req, res) => {
  try {
    // Get or create default settings
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
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    console.log("=== Update Settings Started ===");
    console.log("Request body:", req.body);

    // Find and update, or create if doesn't exist
    const settings = await SystemSetting.findOneAndUpdate(
      {}, // Empty filter to update the first document
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      },
    );

    console.log("Settings updated:", settings);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
