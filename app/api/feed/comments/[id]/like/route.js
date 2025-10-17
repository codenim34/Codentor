import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Comment from '@/lib/models/commentModel';
import Notification from '@/lib/models/notificationModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request, { params }) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(userId);
      
      // Create notification for comment author (if not liking own comment)
      if (comment.authorId !== userId) {
        const notification = new Notification({
          userId: comment.authorId,
          type: 'comment_like',
          actorId: userId,
          postId: comment.postId,
          commentId: comment._id
        });
        await notification.save();
      }
    }

    await comment.save();

    return NextResponse.json({
      likesCount: comment.likes.length,
      isLikedByUser: comment.likes.includes(userId)
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    );
  }
}

