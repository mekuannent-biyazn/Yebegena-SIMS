const normalizePhone = (phone) => {
  let cleaned = phone.trim();

  if (cleaned.startsWith("09")) {
    cleaned = "+251" + cleaned.substring(1);
  }

  if (cleaned.startsWith("251")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

export default normalizePhone;
