import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insightloop';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB connection failed to ${uri}: ${err.message}`);
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('[Database] MongoDB disconnected');
};
