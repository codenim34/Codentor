# Task Management System - Setup Guide

## 🎉 Features Implemented

✅ **Core Task Management**
- Create, edit, delete tasks
- Task fields: title, description, link, due date, priority, tags, status
- Today's tasks and remaining tasks filters
- Multiple views: List, Calendar, Kanban board
- Drag-and-drop task rescheduling (Calendar view)
- Drag-and-drop status changes (Kanban view)

✅ **Google Calendar Integration**
- Two-way sync with Google Calendar
- OAuth 2.0 authentication
- Manual sync button
- Auto-sync capability
- Connect/disconnect Google Calendar

✅ **Multi-Channel Notifications**
- Email notifications (via SMTP or SendGrid)
- Browser push notifications
- In-app notifications (via Pusher)
- Automatic reminders (24 hours and 1 hour before due date)

✅ **Beautiful UI**
- Modern, responsive design
- Dark theme with emerald accents
- Interactive calendar with color-coded priorities
- Kanban board with smooth drag-and-drop
- Task statistics dashboard

---

## 📋 Required Setup

### 1. Google Calendar API Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

#### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (or "Internal" if using Google Workspace)
3. Fill in required fields:
   - App name: **Codentor**
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `.../auth/calendar`
   - `.../auth/calendar.events`
5. Add test users (your email) if in testing mode
6. Save and continue

#### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: **Codentor Task Manager**
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Click "Create"
7. **Save the Client ID and Client Secret**

---

### 2. Email Service Setup

Choose **ONE** of the following options:

#### Option A: Gmail SMTP (Recommended for Development)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
3. Use these environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password (16 characters, no spaces)
EMAIL_FROM=your-email@gmail.com
```

#### Option B: SendGrid (Recommended for Production)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Give it "Full Access" or "Mail Send" permission
3. Verify sender email in SendGrid
4. Use these environment variables:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=verified-email@yourdomain.com
```

---

### 3. Web Push Notifications Setup

#### Generate VAPID Keys
Run this command in your project directory:
```bash
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BNz1...
Private Key: abc123...
```

Add these to your environment variables:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

---

### 4. Environment Variables

Create or update your `.env.local` file with ALL of the following:

```env
# MongoDB (already configured)
MONGODB_URI=your-mongodb-uri

# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret

# Pusher (already configured)
PUSHER_APP_ID=your-pusher-app-id
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster

# Google Calendar API (NEW - REQUIRED)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email Service (NEW - Choose Option A or B)
# Option A: SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# OR Option B: SendGrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# EMAIL_FROM=verified-email@yourdomain.com

# Web Push Notifications (NEW - REQUIRED)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Usage Guide

### Accessing the Task Manager
Navigate to: `http://localhost:3000/tasks`

### Creating Tasks
1. Click "New Task" button
2. Fill in task details:
   - **Title** (required)
   - **Description** (optional)
   - **Related Link** (optional)
   - **Due Date** (required)
   - **Priority**: Low, Medium, High
   - **Status**: To Do, In Progress, Completed
   - **Tags**: Comma-separated (e.g., "work, urgent")
3. Click "Create Task"

### View Options

#### List View (Default)
- See all tasks in a list format
- Click task to edit
- Toggle completion status
- Filter by: All, Today, Remaining, Completed

#### Calendar View
- Visual calendar with color-coded tasks
- **Drag and drop** tasks to reschedule
- Switch between Month, Week, Day views
- Color legend:
  - 🔴 Red = High Priority
  - 🟡 Yellow = Medium Priority
  - 🔵 Blue = Low Priority
  - ⚫ Gray = Completed

#### Kanban Board
- Three columns: To Do, In Progress, Completed
- **Drag and drop** tasks between columns
- Visual progress tracking
- Task cards show due dates and tags

### Google Calendar Sync

#### Connect Google Calendar
1. Click "Connect" in the Google Calendar Sync section
2. Sign in to your Google account
3. Grant permissions
4. You'll be redirected back to the tasks page

#### Sync Tasks
- **Manual Sync**: Click "Sync Now" button to import Google Calendar events as tasks
- **Auto-Sync**: Set up a cron job to sync automatically (see below)

#### Disconnect
Click "Disconnect" to remove Google Calendar integration (tasks remain in app)

### Notifications

#### Enable Browser Push Notifications
1. Click "Show Notification Settings"
2. Under "Browser Push Notifications", click "Enable"
3. Allow notifications in browser prompt

#### Notification Schedule
- 📧 Email: 24 hours before + 1 hour before due date
- 📱 Push: 24 hours before + 1 hour before due date
- 🔔 In-App: Real-time via Pusher

---

## ⚙️ Advanced Configuration

### Automatic Reminder System

#### Option A: Vercel Cron Jobs (Recommended for Production)
Create `vercel.json` in project root:
```json
{
  "crons": [{
    "path": "/api/tasks/reminders",
    "schedule": "0 * * * *"
  }]
}
```

#### Option B: External Cron Service
Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Cron-Jobs.org](https://cron-job.org)

Set up a cron job to call:
```
GET https://yourdomain.com/api/tasks/reminders
```
Frequency: Every hour

#### Option C: Local Development
Use a tool like `node-cron` or manually trigger:
```bash
curl http://localhost:3000/api/tasks/reminders
```

### Auto-Sync Google Calendar

Similar to reminders, set up a cron job for:
```
GET https://yourdomain.com/api/tasks/sync
```
Frequency: Every 15 minutes (recommended)

---

## 🧪 Testing

### Test Email Notifications
1. Create a task with due date in next 24 hours
2. Call the reminders API:
```bash
curl http://localhost:3000/api/tasks/reminders
```
3. Check your email

### Test Push Notifications
1. Enable push notifications in settings
2. Create a test task
3. Send test reminder via API or wait for scheduled reminder

### Test Google Calendar Sync
1. Connect Google Calendar
2. Create an event in Google Calendar
3. Click "Sync Now" in the app
4. Event should appear as a task

---

## 📁 File Structure

### New Files Created
```
app/
├── tasks/
│   └── page.jsx                      # Main task management page
├── components/tasks/
│   ├── TaskForm.jsx                  # Create/edit task modal
│   ├── TaskList.jsx                  # List view component
│   ├── CalendarView.jsx              # Calendar view with drag-drop
│   ├── KanbanBoard.jsx               # Kanban board with drag-drop
│   ├── GoogleCalendarSync.jsx        # Google Calendar integration UI
│   └── NotificationSettings.jsx      # Notification preferences UI
├── api/
│   ├── tasks/
│   │   ├── route.js                  # CRUD operations
│   │   ├── sync/route.js             # Google Calendar sync
│   │   ├── reminders/route.js        # Send reminders
│   │   └── google-status/route.js    # Check connection status
│   ├── auth/google/
│   │   ├── route.js                  # Initiate OAuth
│   │   └── callback/route.js         # OAuth callback
│   └── notifications/
│       └── subscribe/route.js        # Push subscription management
lib/
├── models/
│   ├── taskModel.js                  # Task schema
│   ├── googleTokenModel.js           # OAuth token storage
│   └── pushSubscriptionModel.js      # Push subscription storage
└── utils/
    ├── googleCalendar.js             # Google Calendar API wrapper
    ├── emailService.js               # Email sending utility
    └── pushNotification.js           # Push notification utility
public/
└── sw.js                             # Service Worker for push notifications
```

---

## 🐛 Troubleshooting

### Google Calendar Not Connecting
- Check if redirect URI in Google Cloud Console matches exactly
- Verify both Client ID and Secret are correct
- Ensure Google Calendar API is enabled
- Check browser console for error messages

### Email Not Sending
- Verify SMTP credentials (especially app password for Gmail)
- Check if 2FA is enabled (required for Gmail app passwords)
- Test with a simple script first
- Check spam folder

### Push Notifications Not Working
- Ensure VAPID keys are correctly set
- Check if browser supports push notifications
- Verify service worker is registered (check in DevTools > Application > Service Workers)
- Check browser console for errors

### Tasks Not Syncing
- Verify Google Calendar is connected
- Check if calendar API quota is exceeded
- Ensure tasks have proper due dates
- Check API response in Network tab

---

## 🎨 Customization

### Change Reminder Times
Edit `app/api/tasks/reminders/route.js`:
```javascript
const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Change 24 to desired hours
const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Change 60 to desired minutes
```

### Add Custom Task Statuses
Edit `lib/models/taskModel.js`:
```javascript
status: {
  type: String,
  enum: ['pending', 'in-progress', 'completed', 'your-custom-status'],
  default: 'pending',
},
```

### Customize Email Templates
Edit `lib/utils/emailService.js` - modify the HTML template in `sendTaskReminderEmail` function

---

## 🔐 Security Notes

- Never commit `.env.local` file to version control
- Keep Google OAuth Client Secret secure
- Use environment variables for all sensitive data
- VAPID keys should be kept secret
- For production, use HTTPS for redirect URIs

---

## 📝 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks` - Update task
- `DELETE /api/tasks?taskId=ID` - Delete task

### Google Calendar
- `GET /api/auth/google` - Initiate OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/tasks/google-status` - Check connection
- `DELETE /api/tasks/google-status` - Disconnect
- `POST /api/tasks/sync` - Sync single task
- `GET /api/tasks/sync` - Import from Google Calendar

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push
- `DELETE /api/notifications/subscribe` - Unsubscribe
- `GET /api/tasks/reminders` - Send reminders (cron)
- `POST /api/tasks/reminders` - Send test reminder

---

## ✅ What's Working

1. ✅ Complete task CRUD operations
2. ✅ Multiple view options (List, Calendar, Kanban)
3. ✅ Drag-and-drop functionality
4. ✅ Google Calendar OAuth flow
5. ✅ Two-way calendar sync
6. ✅ Email notifications
7. ✅ Browser push notifications
8. ✅ In-app notifications via Pusher
9. ✅ Automatic reminder system
10. ✅ Responsive design
11. ✅ Task filtering and statistics

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check browser console for errors
4. Check server logs for API errors

---

## 🎯 Next Steps (Optional Enhancements)

- [ ] Recurring tasks
- [ ] Task templates
- [ ] Team collaboration / shared tasks
- [ ] Task comments and attachments
- [ ] Time tracking
- [ ] Task dependencies
- [ ] Custom reminder times per task
- [ ] Task categories/projects
- [ ] Export tasks to CSV/PDF
- [ ] Task analytics and reports

Enjoy your new task management system! 🚀

