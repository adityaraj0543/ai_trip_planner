import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not configured. Add your MongoDB Atlas connection string to the backend environment variables.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
