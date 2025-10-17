import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Comment from '@/lib/models/commentModel';
import Post from '@/lib/models/postModel';
import Notification from '@/lib/models/notificationModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId, content, parentCommentId } = await request.json();

    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = new Comment({
      postId,
      authorId: userId,
      content,
      parentCommentId: parentCommentId || null
    });

    await comment.save();

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== userId) {
      const notification = new Notification({
        userId: post.authorId,
        type: 'post_comment',
        actorId: userId,
        postId,
        commentId: comment._id
      });
      await notification.save();
    }

    // If this is a reply, notify the parent comment author
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.authorId !== userId) {
        const replyNotification = new Notification({
          userId: parentComment.authorId,
          type: 'comment_reply',
          actorId: userId,
          postId,
          commentId: comment._id
        });
        await replyNotification.save();
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

