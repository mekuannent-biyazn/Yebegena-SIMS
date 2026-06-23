export const validateClass = (data) => {
  const errors = [];

  if (!data.className) {
    errors.push("Class name is required");
  }

  if (!["FRESH", "ADVANCED"].includes(data.classType)) {
    errors.push("Invalid class type");
  }

  if (!data.maxStudents) {
    errors.push("Maximum students required");
  }

  return errors;
};
