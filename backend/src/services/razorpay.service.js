import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

let razorpayClient;

function getClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error('Razorpay test/live keys are not configured on the server.');
  }

  razorpayClient ||= new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });

  return razorpayClient;
}

export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  return getClient().orders.create({
    amount,
    currency: 'INR',
    receipt,
    notes,
  });
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (!signature || signature.length !== expectedSignature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}
