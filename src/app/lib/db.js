import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("MONGO_URI not defined");

const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) throw new Error("DB_NAME not defined");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}