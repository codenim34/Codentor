import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
import Notification from '@/lib/models/notificationModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connect();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (userId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot connect with yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId: userId, recipientId },
        { requesterId: recipientId, recipientId: userId }
      ]
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection request already exists' },
        { status: 400 }
      );
    }

    // Create connection request
    const connection = new Connection({
      requesterId: userId,
      recipientId,
      status: 'pending'
    });

    await connection.save();

    // Create notification for recipient
    const notification = new Notification({
      userId: recipientId,
      type: 'connection_request',
      actorId: userId,
      connectionId: connection._id
    });

    await notification.save();

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error creating connection request:', error);
    return NextResponse.json(
      { error: 'Failed to create connection request' },
      { status: 500 }
    );
  }
}

