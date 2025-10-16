import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// Initialize Pusher server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// Store collaborators and room state per room (in production, use Redis or database)
const roomCollaborators = new Map();
const roomState = new Map(); // Store current code and language per room

export async function POST(req) {
  try {
    const { roomId, userId, username, event, data } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    const channelName = `room-${roomId}`;

    switch (event) {
      case 'join-room':
        // Add collaborator to room
        if (!roomCollaborators.has(roomId)) {
          roomCollaborators.set(roomId, new Map());
        }
        const room = roomCollaborators.get(roomId);
        room.set(userId, {
          userId,
          username: username || 'Anonymous',
          timestamp: Date.now(),
        });

        // Broadcast updated collaborators list
        await pusher.trigger(channelName, 'collaboratorsUpdate', Array.from(room.values()));
        
        // Send current room state to the new user
        if (roomState.has(roomId)) {
          await pusher.trigger(channelName, 'roomState', roomState.get(roomId));
        }
        break;

      case 'leave-room':
        // Remove collaborator from room
        if (roomCollaborators.has(roomId)) {
          const room = roomCollaborators.get(roomId);
          room.delete(userId);
          
          if (room.size === 0) {
            roomCollaborators.delete(roomId);
          } else {
            await pusher.trigger(channelName, 'collaboratorsUpdate', Array.from(room.values()));
          }
        }
        break;

      case 'codeUpdate':
        // Update room state
        if (!roomState.has(roomId)) {
          roomState.set(roomId, { code: data, language: 'javascript' });
        } else {
          roomState.get(roomId).code = data;
        }
        
        // Broadcast code update to all clients in the room
        await pusher.trigger(channelName, 'codeUpdate', {
          userId,
          username,
          data,
          timestamp: Date.now(),
        });
        break;

      case 'languageChange':
        // Update room state
        if (!roomState.has(roomId)) {
          roomState.set(roomId, { code: '', language: data });
        } else {
          roomState.get(roomId).language = data;
        }
        
        // Broadcast language change to all clients
        await pusher.trigger(channelName, 'languageChange', {
          userId,
          username,
          language: data,
          timestamp: Date.now(),
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve room collaborators
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    const room = roomCollaborators.get(roomId);
    const collaborators = room ? Array.from(room.values()) : [];

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

