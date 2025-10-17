import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Post from '@/lib/models/postModel';
import Notification from '@/lib/models/notificationModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request, { params }) {
  try {
    await connect();
    
    const { userId } = auth();
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

    // Check if already shared by this user
    const alreadyShared = post.shares.some(share => share.userId === userId);
    
    if (alreadyShared) {
      return NextResponse.json(
        { error: 'Post already shared' },
        { status: 400 }
      );
    }

    // Add share
    post.shares.push({
      userId,
      sharedAt: new Date()
    });

    await post.save();

    // Create notification for post author (if not sharing own post)
    if (post.authorId !== userId) {
      const notification = new Notification({
        userId: post.authorId,
        type: 'post_share',
        actorId: userId,
        postId: post._id
      });
      await notification.save();
    }

    return NextResponse.json({
      sharesCount: post.shares.length,
      message: 'Post shared successfully'
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json(
      { error: 'Failed to share post' },
      { status: 500 }
    );
  }
}

