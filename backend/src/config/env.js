import 'dotenv/config';

const requiredInProduction = ['MONGODB_URI', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || '',
  authCookieName: 'tripgenius_session',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || '',
};

export function validateEnv() {
  if (env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }

  if (env.nodeEnv === 'production') {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    }
  }
}
