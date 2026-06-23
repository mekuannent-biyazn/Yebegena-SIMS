const forcePasswordChange = (req, res, next) => {
  if (req.user.mustChangePassword) {
    return res.status(403).json({
      success: false,
      message: "Password change required",
    });
  }

  next();
};

export default forcePasswordChange;
