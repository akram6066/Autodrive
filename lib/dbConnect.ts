import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MongoDB URI not defined!')

// Add custom type to globalThis
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

// Initialize global cache if not present
const globalWithMongoose = global as typeof globalThis & {
  mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (globalWithMongoose.mongooseCache.conn) {
    return globalWithMongoose.mongooseCache.conn
  }

  if (!globalWithMongoose.mongooseCache.promise) {
    globalWithMongoose.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose)
  }

  globalWithMongoose.mongooseCache.conn = await globalWithMongoose.mongooseCache.promise
  return globalWithMongoose.mongooseCache.conn
}
