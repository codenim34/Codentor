import mongoose from "mongoose";

const interviewMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["ai", "user"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  role: { type: String, required: true, index: true }, // format: "backend:mid:text"
  durationMin: { type: Number, default: 45 },
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date },
  status: { type: String, enum: ["active", "ended"], default: "active", index: true },
  currentIndex: { type: Number, default: 0 },
  messages: [interviewMessageSchema],
  aiSummary: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    score: { type: Number, default: 0 },
    recommendations: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

interviewSessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const InterviewSession = mongoose.models.InterviewSession || mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;

