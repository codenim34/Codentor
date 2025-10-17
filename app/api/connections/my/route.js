import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
import User from '@/lib/models/userModel';
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

    // Get all accepted connections where user is either requester or recipient
    const connections = await Connection.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' }
      ]
    }).sort({ updatedAt: -1 });

    // Get unique user IDs
    const userIds = connections.map(conn => 
      conn.requesterId === userId ? conn.recipientId : conn.requesterId
    );

    // Fetch user details
    const users = await User.find({ clerkId: { $in: userIds } });
    
    // Create user map
    const userMap = new Map(users.map(user => [user.clerkId, user]));

    // Combine connection data with user details
    const connectionsWithUsers = connections.map(conn => {
      const connectedUserId = conn.requesterId === userId ? conn.recipientId : conn.requesterId;
      const user = userMap.get(connectedUserId);
      
      return {
        _id: conn._id,
        userId: connectedUserId,
        userName: user?.userName || 'Unknown',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        image_url: user?.image_url || '',
        connectedAt: conn.updatedAt
      };
    });

    return NextResponse.json(connectionsWithUsers);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

