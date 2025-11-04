// Handles MongoDB connection using Mongoose.
// Exports a function that connects to MongoDB Atlas and logs connection status.
// config/db.js

///_____ Testing Database Connection _______///
import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    } catch (error) {console.error('MongoDB connection failed:', error);
    process.exit(1);
}
}
export default connectDB;