export const validateChangePassword = (data) => {
  const errors = [];

  if (!data.currentPassword) {
    errors.push("Current password is required");
  }

  if (!data.newPassword || data.newPassword.length < 6) {
    errors.push("New password must be at least 6 characters");
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.push("Passwords do not match");
  }

  return errors;
};
