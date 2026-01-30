import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

// Global cache for the connection
let cached = global.mongoose;

// Checking if it doesn't exist
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}