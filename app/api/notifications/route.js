import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Notification from '@/lib/models/notificationModel';
import User from '@/lib/models/userModel';
import Post from '@/lib/models/postModel';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connect();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get actor (user who performed the action) details
    const actorIds = [...new Set(notifications.map(notif => notif.actorId))];
    const actors = await User.find({ clerkId: { $in: actorIds } });
    const actorMap = new Map(actors.map(actor => [actor.clerkId, actor]));

    // Get post details for notifications that have postId
    const postIds = notifications
      .filter(notif => notif.postId)
      .map(notif => notif.postId);
    const posts = await Post.find({ _id: { $in: postIds } });
    const postMap = new Map(posts.map(post => [post._id.toString(), post]));

    // Combine notification data with actor and post details
    const notificationsWithDetails = notifications.map(notif => {
      const actor = actorMap.get(notif.actorId);
      const post = notif.postId ? postMap.get(notif.postId.toString()) : null;
      
      return {
        ...notif.toObject(),
        actor: {
          userId: notif.actorId,
          userName: actor?.userName || 'Unknown',
          firstName: actor?.firstName || '',
          lastName: actor?.lastName || '',
          image_url: actor?.image_url || ''
        },
        postContent: post ? post.content.substring(0, 100) : null
      };
    });

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return NextResponse.json({
      notifications: notificationsWithDetails,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

