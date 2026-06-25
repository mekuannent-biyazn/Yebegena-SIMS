export const isValidPhone = (phone) => {
  const regex = /^(09\d{8}|2519\d{8})$/;

  return regex.test(phone);
};
