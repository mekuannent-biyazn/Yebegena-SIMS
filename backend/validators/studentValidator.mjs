export const validateStudentRegistration = (data) => {
  const errors = [];

  if (!data.kflat) {
    errors.push("Kflat is required");
  }

  if (!data.kflatRole && !data.customKflatRole) {
    errors.push("Select a role or enter a custom role");
  }

  return errors;
};
