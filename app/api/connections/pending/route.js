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

    // Get pending connections where user is the recipient
    const pendingConnections = await Connection.find({
      recipientId: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    // Get requester user IDs
    const requesterIds = pendingConnections.map(conn => conn.requesterId);

    // Fetch requester details
    const users = await User.find({ clerkId: { $in: requesterIds } });
    
    // Create user map
    const userMap = new Map(users.map(user => [user.clerkId, user]));

    // Combine connection data with user details
    const requestsWithUsers = pendingConnections.map(conn => {
      const user = userMap.get(conn.requesterId);
      
      return {
        _id: conn._id,
        requesterId: conn.requesterId,
        userName: user?.userName || 'Unknown',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        image_url: user?.image_url || '',
        requestedAt: conn.createdAt
      };
    });

    return NextResponse.json(requestsWithUsers);
  } catch (error) {
    console.error('Error fetching pending connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending connections' },
      { status: 500 }
    );
  }
}

