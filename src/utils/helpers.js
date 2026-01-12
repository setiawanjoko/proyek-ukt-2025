// Utility function to validate required fields
function validateFields(fields, body) {
  const missingFields = fields.filter((field) => !body[field]);
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }
  return null;
}

module.exports = {
  validateFields,
};