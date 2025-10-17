import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all accepted connections where user is either requester or recipient
    const connections = await Connection.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' }
      ]
    }).sort({ updatedAt: -1 });

    if (connections.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique user IDs
    const userIds = connections.map(conn => 
      conn.requesterId === userId ? conn.recipientId : conn.requesterId
    );

    // Fetch user details from Clerk
    const client = await clerkClient();
    const usersPromises = userIds.map(id => client.users.getUser(id).catch(() => null));
    const users = await Promise.all(usersPromises);
    
    // Create user map
    const userMap = new Map(
      users
        .filter(user => user !== null)
        .map(user => [user.id, user])
    );

    // Combine connection data with user details
    const connectionsWithUsers = connections.map(conn => {
      const connectedUserId = conn.requesterId === userId ? conn.recipientId : conn.requesterId;
      const clerkUser = userMap.get(connectedUserId);
      
      return {
        _id: conn._id,
        userId: connectedUserId,
        user: {
          id: connectedUserId,
          userName: clerkUser?.username || clerkUser?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
          firstName: clerkUser?.firstName || 'User',
          lastName: clerkUser?.lastName || '',
          image_url: clerkUser?.imageUrl || '',
          bio: clerkUser?.publicMetadata?.bio || ''
        },
        connectedAt: conn.updatedAt
      };
    }).filter(conn => conn.user.firstName !== 'User' || userMap.has(conn.userId));

    return NextResponse.json(connectionsWithUsers);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

