import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  requesterId: {
    type: String,
    required: true,
    index: true,
  },
  recipientId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate connections
connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

// Update timestamp on save
connectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Connection = mongoose.models.Connection || mongoose.model("Connection", connectionSchema);

export default Connection;

