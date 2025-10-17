import mongoose from "mongoose";

const googleTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  scope: {
    type: String,
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

// Update the updatedAt timestamp before saving
googleTokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GoogleToken = mongoose.models.GoogleToken || mongoose.model("GoogleToken", googleTokenSchema);

export default GoogleToken;

