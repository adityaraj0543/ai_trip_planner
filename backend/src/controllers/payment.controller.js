import { env } from '../config/env.js';
import Trip from '../models/Trip.js';
import { calculateTripAmount } from '../services/pricing.service.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service.js';

export function getPublicConfig(_req, res) {
  res.json({
    razorpayKeyId: env.razorpayKeyId,
    googleMapsApiKey: env.googleMapsApiKey,
  });
}

export async function createOrder(req, res) {
  const { tripId } = req.body;
  if (typeof tripId !== 'string') {
    return res.status(400).json({ success: false, message: 'A saved trip is required to create a payment order.' });
  }
  const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
  if (!trip) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }

  const pricing = calculateTripAmount(trip.budget);
  const receipt = `trip_${trip.id.slice(0, 20)}_${Date.now()}`;

  const order = await createRazorpayOrder({
    amount: pricing.amountInPaise,
    receipt,
    notes: {
      tripId: trip.id,
      userId: req.user.id,
      destination: trip.destination.slice(0, 200),
    },
  });

  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpayKeyId,
    pricing,
  });
}

export function verifyPayment(req, res) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay verification fields.' });
  }

  const verified = verifyRazorpaySignature({ orderId, paymentId, signature });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
  }

  return res.json({ success: true, paymentId, orderId, message: 'Payment verified successfully.' });
}
