import mongoose, { Mongoose } from 'mongoose';

// Ensure the MongoDB URI is provided in the environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to include our mongoose cache type
// We use var so that it is part of the global scope in TypeScript
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection;
}

// Initialize the cached connection state
let cached: MongooseConnection = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database using Mongoose.
 * It caches the connection to reuse it in subsequent calls, 
 * optimizing performance and preventing connection exhaustion,
 * especially useful in serverless environments like Next.js.
 * 
 * @returns {Promise<Mongoose>} The Mongoose instance.
 */
async function connectToDatabase(): Promise<Mongoose> {
  // If a connection is already established, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise is not currently in progress, start a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering; we want to fail fast if not connected
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // If an error occurs, reset the promise to allow retries
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
