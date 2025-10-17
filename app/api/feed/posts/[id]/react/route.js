import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Post from '@/lib/models/postModel';
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
    const { reactionType } = await request.json();

    // Validate reaction type
    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Remove existing reaction from this user if any
    post.reactions = post.reactions.filter(r => r.userId !== userId);

    // Add new reaction
    post.reactions.push({
      userId,
      type: reactionType,
      createdAt: new Date()
    });

    await post.save();

    // Create notification for post author (if not reacting to own post)
    if (post.authorId !== userId) {
      // Remove old reaction notification if exists
      await Notification.deleteOne({
        userId: post.authorId,
        type: 'post_reaction',
        actorId: userId,
        postId: post._id
      });

      const notification = new Notification({
        userId: post.authorId,
        type: 'post_reaction',
        actorId: userId,
        postId: post._id,
        data: { reactionType }
      });
      await notification.save();
    }

    // Count reactions by type
    const reactionCounts = post.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      reactionCounts,
      userReaction: reactionType,
      totalReactions: post.reactions.length
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// Remove reaction
export async function DELETE(request, { params }) {
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

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Remove user's reaction
    post.reactions = post.reactions.filter(r => r.userId !== userId);

    await post.save();

    // Count reactions by type
    const reactionCounts = post.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      reactionCounts,
      userReaction: null,
      totalReactions: post.reactions.length
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
