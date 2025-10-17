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

    // Get pending connections where user is the recipient
    const pendingConnections = await Connection.find({
      recipientId: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (pendingConnections.length === 0) {
      return NextResponse.json([]);
    }

    // Get requester user IDs
    const requesterIds = pendingConnections.map(conn => conn.requesterId);

    // Fetch requester details from Clerk
    const client = await clerkClient();
    const usersPromises = requesterIds.map(id => client.users.getUser(id).catch(() => null));
    const users = await Promise.all(usersPromises);
    
    // Create user map
    const userMap = new Map(
      users
        .filter(user => user !== null)
        .map(user => [user.id, user])
    );

    // Combine connection data with user details
    const requestsWithUsers = pendingConnections.map(conn => {
      const clerkUser = userMap.get(conn.requesterId);
      
      return {
        _id: conn._id,
        requesterId: conn.requesterId,
        requester: {
          id: conn.requesterId,
          userName: clerkUser?.username || clerkUser?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
          firstName: clerkUser?.firstName || 'User',
          lastName: clerkUser?.lastName || '',
          image_url: clerkUser?.imageUrl || '',
          bio: clerkUser?.publicMetadata?.bio || ''
        },
        requestedAt: conn.createdAt
      };
    }).filter(req => req.requester.firstName !== 'User' || userMap.has(req.requesterId));

    return NextResponse.json(requestsWithUsers);
  } catch (error) {
    console.error('Error fetching pending connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending connections' },
      { status: 500 }
    );
  }
}

