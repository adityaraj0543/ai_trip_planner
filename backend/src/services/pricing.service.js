export function calculateTripAmount(baseAmount) {
  const amount = Number(baseAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('A valid positive trip amount is required.');
    error.statusCode = 400;
    throw error;
  }

  if (amount > 10000000) {
    const error = new Error('Trip amount exceeds the allowed limit.');
    error.statusCode = 400;
    throw error;
  }

  const gst = Math.round(amount * 0.18);
  const convenienceFee = 999;
  const totalAmount = amount + gst + convenienceFee;

  return {
    baseAmount: amount,
    gst,
    convenienceFee,
    totalAmount,
    amountInPaise: totalAmount * 100,
  };
}
