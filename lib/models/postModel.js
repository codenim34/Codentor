import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: String, // For video thumbnails
  }],
  tags: [{
    type: String,
    maxlength: 50,
  }],
  likes: [{
    type: String, // clerkId
  }],
  shares: [{
    userId: String,
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  visibility: {
    type: String,
    enum: ['public', 'connections'],
    default: 'public',
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

// Update timestamp on save
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;

