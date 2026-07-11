const normalizePhone = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If number is 10 digits starting with 0 (e.g., 0978787878)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  }
  
  // If number is 9 digits (e.g., 978787878)
  if (cleaned.length === 9) {
    cleaned = '251' + cleaned;
  }
  
  // Add '+' at the beginning if not already there
  return '+' + cleaned;
};

export default normalizePhone;