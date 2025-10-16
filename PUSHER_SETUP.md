# Pusher Setup for Real-Time Collaboration

## Quick Setup

### 1. Get Pusher Credentials
1. Go to https://pusher.com/
2. Create a free account
3. Create a new Channels app
4. Copy your credentials from the App Keys tab

### 2. Add Environment Variables
Add these to your `.env.local` file:

```env
# Pusher Configuration
PUSHER_APP_ID=your_app_id_here
NEXT_PUBLIC_PUSHER_KEY=your_key_here
PUSHER_SECRET=your_secret_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here (e.g., ap2, us2, eu)
```

### 3. Test Real-Time Collaboration

1. Start your dev server: `npm run dev`
2. Open CodeLab: http://localhost:3000/codelab
3. Create a new session
4. Copy the room code
5. Open the same room in a different browser/incognito window
6. Start typing code in one window - it should appear in the other! ✨

## Features Now Working

### ✅ Real-Time Code Synchronization
- Type in one window, see changes in all connected windows
- 500ms debounce to prevent excessive updates
- Shows toast notifications when others edit

### ✅ Language Synchronization
- When one user changes language, all users see the change
- Automatic code template switching

### ✅ Participant Tracking
- See who's currently in the room
- Avatar display in header
- Join/leave notifications

## Technical Details

### Client-Side (app/codelab/[roomCode]/page.jsx)
- Uses `pusher-js` to subscribe to room channels
- Listens for: `codeUpdate`, `languageChange`, `collaboratorsUpdate`
- Broadcasts changes via `/api/socket` endpoint

### Server-Side (app/api/socket/route.js)
- Uses `pusher` npm package for server-side broadcasting
- Manages room state (collaborators list)
- Handles events: `join-room`, `leave-room`, `codeUpdate`, `languageChange`

## Troubleshooting

**Issue: Not seeing real-time updates**
- Check browser console for Pusher connection errors
- Verify environment variables are set correctly
- Make sure both users are in the same room code

**Issue: Pusher connection failed**
- Check if your Pusher cluster is correct (ap2 for Asia Pacific, us2 for US, etc.)
- Verify your API key and secret are valid
- Check Pusher dashboard for connection logs

## Free Tier Limits
- 100 concurrent connections
- 200,000 messages per day
- Perfect for learning and small teams!

