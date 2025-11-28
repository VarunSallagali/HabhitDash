import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL or MONGODB_URI not found in .env');
  console.error('Please create a .env file with:');
  console.error('DATABASE_URL=mongodb://localhost:27017/habitdash');
  process.exit(1);
}

// Validate connection string format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.error('❌ Invalid DATABASE_URL format');
  console.error('Expected format:');
  console.error('  Local: mongodb://localhost:27017/habitdash');
  console.error('  Atlas: mongodb+srv://username:password@cluster.mongodb.net/habitdash');
  console.error(`Current value: ${MONGODB_URI.substring(0, 20)}...`);
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. For local MongoDB: Make sure MongoDB is running');
    console.error('3. For Atlas: Check your connection string and network access');
    console.error('\nExample .env:');
    console.error('DATABASE_URL=mongodb://localhost:27017/habitdash');
    process.exit(1);
  });

export default mongoose;
