function generateOrderId() {
  const timestamp = Date.now().toString(); // Get current timestamp in ms
  const random8Digits = timestamp.slice(-8); // Take last 8 digits
  return `Ord-${random8Digits}`;
}

module.exports = {
  generateOrderId
};