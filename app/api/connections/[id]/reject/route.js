import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
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

    // Only recipient can reject
    if (connection.recipientId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to reject this connection' },
        { status: 403 }
      );
    }

    if (connection.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection is not pending' },
        { status: 400 }
      );
    }

    connection.status = 'rejected';
    await connection.save();

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error rejecting connection:', error);
    return NextResponse.json(
      { error: 'Failed to reject connection' },
      { status: 500 }
    );
  }
}

