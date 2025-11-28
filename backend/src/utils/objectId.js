import mongoose from 'mongoose';

/**
 * Safely converts a string to MongoDB ObjectId
 * @param {string} id - The ID string to convert
 * @returns {mongoose.Types.ObjectId} - The ObjectId instance
 */
export function toObjectId(id) {
  if (!id) {
    throw new Error('ID is required');
  }
  
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  
  throw new Error(`Invalid ObjectId: ${id}`);
}

