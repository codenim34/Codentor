import { google } from 'googleapis';
import { connect } from '@/lib/mongodb/mongoose';
import GoogleToken from '@/lib/models/googleTokenModel';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Calendar API
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

/**
 * Generate Google OAuth URL
 */
export function getAuthUrl(userId) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: CALENDAR_SCOPES,
    state: userId, // Pass userId in state to identify user after callback
    prompt: 'consent', // Force consent screen to get refresh token
  });
  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Save tokens to database
 */
export async function saveTokens(userId, tokens) {
  await connect();
  
  const tokenData = {
    userId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: new Date(tokens.expiry_date),
    scope: tokens.scope,
  };

  await GoogleToken.findOneAndUpdate(
    { userId },
    tokenData,
    { upsert: true, new: true }
  );
}

/**
 * Get tokens from database
 */
export async function getTokens(userId) {
  await connect();
  const tokenDoc = await GoogleToken.findOne({ userId });
  return tokenDoc;
}

/**
 * Check if tokens exist for user
 */
export async function hasTokens(userId) {
  await connect();
  const tokenDoc = await GoogleToken.findOne({ userId });
  return !!tokenDoc;
}

/**
 * Refresh access token if expired
 */
export async function refreshAccessToken(userId) {
  await connect();
  const tokenDoc = await GoogleToken.findOne({ userId });
  
  if (!tokenDoc) {
    throw new Error('No tokens found for user');
  }

  oauth2Client.setCredentials({
    refresh_token: tokenDoc.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  
  // Update tokens in database
  tokenDoc.accessToken = credentials.access_token;
  tokenDoc.expiryDate = new Date(credentials.expiry_date);
  await tokenDoc.save();

  return credentials.access_token;
}

/**
 * Get authenticated calendar instance
 */
export async function getCalendar(userId) {
  const tokenDoc = await getTokens(userId);
  
  if (!tokenDoc) {
    throw new Error('User not connected to Google Calendar');
  }

  // Check if token is expired
  if (new Date() >= tokenDoc.expiryDate) {
    await refreshAccessToken(userId);
    const updatedToken = await getTokens(userId);
    oauth2Client.setCredentials({
      access_token: updatedToken.accessToken,
      refresh_token: updatedToken.refreshToken,
    });
  } else {
    oauth2Client.setCredentials({
      access_token: tokenDoc.accessToken,
      refresh_token: tokenDoc.refreshToken,
    });
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create Google Calendar event from task
 */
export async function createCalendarEvent(userId, task) {
  const calendar = await getCalendar(userId);

  const event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: new Date(task.dueDate).toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };

  if (task.link) {
    event.description += `\n\nLink: ${task.link}`;
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.data.id;
}

/**
 * Update Google Calendar event
 */
export async function updateCalendarEvent(userId, eventId, task) {
  const calendar = await getCalendar(userId);

  const event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: new Date(task.dueDate).toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC',
    },
  };

  if (task.link) {
    event.description += `\n\nLink: ${task.link}`;
  }

  await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    resource: event,
  });
}

/**
 * Delete Google Calendar event
 */
export async function deleteCalendarEvent(userId, eventId) {
  const calendar = await getCalendar(userId);

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
}

/**
 * Get events from Google Calendar
 */
export async function getCalendarEvents(userId, timeMin, timeMax) {
  const calendar = await getCalendar(userId);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

/**
 * Disconnect Google Calendar (delete tokens)
 */
export async function disconnectCalendar(userId) {
  await connect();
  await GoogleToken.findOneAndDelete({ userId });
}

