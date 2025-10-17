import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  link: {
    type: String,
    default: "",
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  googleCalendarEventId: {
    type: String,
    default: null,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  // granular reminder flags
  reminder24hSent: {
    type: Boolean,
    default: false,
  },
  reminder1hSent: {
    type: Boolean,
    default: false,
  },
  reminder5mSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound indexes for efficient queries
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1, dueDate: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;

