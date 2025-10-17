import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
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

    const connection = await Connection.findById(id);
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Only recipient can accept
    if (connection.recipientId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to accept this connection' },
        { status: 403 }
      );
    }

    if (connection.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection is not pending' },
        { status: 400 }
      );
    }

    connection.status = 'accepted';
    await connection.save();

    // Create notification for requester
    const notification = new Notification({
      userId: connection.requesterId,
      type: 'connection_accepted',
      actorId: userId,
      connectionId: connection._id
    });

    await notification.save();

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error accepting connection:', error);
    return NextResponse.json(
      { error: 'Failed to accept connection' },
      { status: 500 }
    );
  }
}

