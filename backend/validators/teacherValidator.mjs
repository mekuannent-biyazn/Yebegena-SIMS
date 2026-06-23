import { isValidEthiopianPhone } from "./authValidator.mjs";

export const validateTeacher = (data) => {
  const errors = [];

  if (!data.fullName) {
    errors.push("Teacher full name is required");
  }

  if (!isValidEthiopianPhone(data.phoneNumber)) {
    errors.push("Invalid Ethiopian phone number");
  }

  if (!["FRESH_TEACHER", "ADVANCED_TEACHER"].includes(data.teacherType)) {
    errors.push("Invalid teacher type");
  }

  return errors;
};
