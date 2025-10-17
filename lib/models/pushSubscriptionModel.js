import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  subscription: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate subscriptions
pushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

const PushSubscription = mongoose.models.PushSubscription || mongoose.model("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;

