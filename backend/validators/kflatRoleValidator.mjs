export const validateKflatRole = (data) => {
  const errors = [];

  if (!data.roleName?.en) {
    errors.push("English role name is required");
  }

  if (!data.roleName?.am) {
    errors.push("Amharic role name is required");
  }

  return errors;
};
