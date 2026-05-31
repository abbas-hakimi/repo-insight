import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * MongoDB connection lifecycle.
 * Skips connection when MONGODB_URI is not set (optional for MVP).
 */
export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('MongoDB not configured - running without database');
    return;
  }

  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
