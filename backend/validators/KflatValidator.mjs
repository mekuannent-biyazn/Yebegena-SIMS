export const validateKflat = (data) => {
  const errors = [];

  if (!data.name) {
    errors.push("Kflat name is required");
  }

  if (data.name && data.name.trim().length < 2) {
    errors.push("Kflat name must contain at least 2 characters");
  }

  return errors;
};
