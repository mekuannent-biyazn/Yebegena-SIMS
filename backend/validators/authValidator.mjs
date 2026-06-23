const validateRegister = ({
  fullName,
  phoneNumber,
  password,
  confirmPassword,
}) => {
  const errors = [];

  if (!fullName || fullName.length < 3) {
    errors.push("Full name must contain at least 3 characters");
  }

  if (!phoneNumber) {
    errors.push("Phone number is required");
  }

  if (!isValidEthiopianPhone(phoneNumber)) {
    errors.push("Phone number must be a valid Ethiopian phone number");
  }

  if (!password || password.length < 6) {
    errors.push("Password must contain at least 6 characters");
  }

  if (password !== confirmPassword) {
    errors.push("Password and Confirm Password do not match");
  }

  return errors;
};

const isValidEthiopianPhone = (phoneNumber) => {
  const phone = phoneNumber.trim();

  // Starts with 09 and total length = 10
  if (phone.startsWith("09") && phone.length === 10) {
    return true;
  }

  // Starts with 251 and total length = 12
  if (phone.startsWith("251" || "+251") && phone.length === 12) {
    return true;
  }

  return false;
};

export { validateRegister, isValidEthiopianPhone };
