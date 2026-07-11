export const validateChangePassword = (data) => {
  const errors = [];
  const { currentPassword, newPassword } = data;

  if (!currentPassword || currentPassword.length < 6) {
    errors.push("Current password must be at least 6 characters");
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push("New password must be at least 6 characters");
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push("New password must be different from current password");
  }

  return errors;
};
