import { isValidEthiopianPhone } from "./authValidator.mjs";

export const updateProfileValidator = (data) => {
  const errors = [];
  const { fullName, phoneNumber } = data;

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  if (!phoneNumber) {
    errors.push("Phone number is required");
  } else {
    // Ethiopian phone number validation (09XXXXXXXX or 07XXXXXXXX)
    if (!isValidEthiopianPhone(phoneNumber)) {
      errors.push(
        "Please enter a valid Ethiopian phone number (e.g., 09XXXXXXXX or 07XXXXXXXX)",
      );
    }
  }

  return errors;
};
