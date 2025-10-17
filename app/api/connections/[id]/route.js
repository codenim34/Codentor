import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Connection from '@/lib/models/connectionModel';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(request, { params }) {
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

    const connection = await Connection.findById(id);
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Only requester or recipient can remove connection
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to remove this connection' },
        { status: 403 }
      );
    }

    await Connection.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}

