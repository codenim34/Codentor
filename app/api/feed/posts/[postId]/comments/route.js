import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Comment from '@/lib/models/commentModel';
import User from '@/lib/models/userModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  try {
    await connect();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = params;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 });

    // Get author details
    const authorIds = [...new Set(comments.map(comment => comment.authorId))];
    const authors = await User.find({ clerkId: { $in: authorIds } });
    const authorMap = new Map(authors.map(author => [author.clerkId, author]));

    // Build comment tree
    const commentsWithAuthors = comments.map(comment => {
      const author = authorMap.get(comment.authorId);
      return {
        ...comment.toObject(),
        author: {
          userId: comment.authorId,
          userName: author?.userName || 'Unknown',
          firstName: author?.firstName || '',
          lastName: author?.lastName || '',
          image_url: author?.image_url || ''
        },
        likesCount: comment.likes.length,
        isLikedByUser: comment.likes.includes(userId)
      };
    });

    // Organize comments into parent-child structure
    const commentMap = new Map();
    const rootComments = [];

    commentsWithAuthors.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment._id.toString(), comment);
    });

    commentsWithAuthors.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId.toString());
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return NextResponse.json(rootComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

