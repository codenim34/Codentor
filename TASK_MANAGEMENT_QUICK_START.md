# Task Management - Quick Start Guide ⚡

## 🎯 You Asked For

✅ Task creation (title, description, link, due date)
✅ Today's tasks and remaining tasks views
✅ Google Calendar integration (two-way sync)
✅ Browser + email + in-app notifications
✅ Calendar view + List view + Kanban board

## ✨ Everything is Ready!

All code is implemented and working. You just need to configure external APIs.

---

## 🚀 Instant Start (No APIs Needed)

You can start using the task manager RIGHT NOW without any setup:

```bash
# Navigate to the task page
http://localhost:3000/tasks
```

**What works without API setup:**
- ✅ Create, edit, delete tasks
- ✅ All 3 views (List, Calendar, Kanban)
- ✅ Drag and drop
- ✅ Filters and search
- ✅ Task statistics

---

## 🔧 API Setup (Optional but Recommended)

### 1. Generate VAPID Keys (1 minute)

```bash
node scripts/generate-vapid-keys.js
```

Copy the output to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### 2. Google Calendar (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Calendar API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 3. Email Service (5 minutes)

**Option A: Gmail (Easy)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password  # Generate in Google Account → Security → App Passwords
EMAIL_FROM=your-email@gmail.com
```

**Option B: SendGrid (Production)**
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=verified-email@yourdomain.com
```

---

## 📋 Complete .env.local Template

```env
# Existing (already configured)
MONGODB_URI=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
PUSHER_APP_ID=...
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# NEW - Add these:

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (choose ONE option)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎮 How to Use

### Create a Task
1. Go to `http://localhost:3000/tasks`
2. Click "New Task"
3. Fill in details and save

### Switch Views
- **List**: Traditional task list
- **Calendar**: Drag tasks to reschedule
- **Kanban**: Drag between To Do / In Progress / Done

### Connect Google Calendar
1. Click "Connect" button
2. Authorize with Google
3. Click "Sync Now" to import events

### Enable Notifications
1. Click "Show Notification Settings"
2. Enable push notifications
3. Emails work automatically

---

## ⚡ What Requires API Keys?

| Feature | Without Setup | With Setup |
|---------|---------------|------------|
| Task CRUD | ✅ Works | ✅ Works |
| List/Calendar/Kanban | ✅ Works | ✅ Works |
| Google Calendar Sync | ❌ Button inactive | ✅ Full sync |
| Email Reminders | ⚠️ Logs only | ✅ Real emails |
| Push Notifications | ❌ Button inactive | ✅ Browser alerts |
| In-App Notifications | ✅ Works (Pusher) | ✅ Works |

---

## 🔔 Setting Up Auto-Reminders

Tasks send reminders 24h and 1h before due date.

To automate this, set up a cron job to call:
```
GET http://localhost:3000/api/tasks/reminders
```

**Options:**
1. **Vercel Cron** (in production)
2. **Cron-job.org** (free service)
3. **Manual**: `curl http://localhost:3000/api/tasks/reminders`

---

## 📚 Documentation

- **Full Setup Guide**: `TASK_MANAGEMENT_SETUP.md` (detailed instructions)
- **Implementation Details**: `TASK_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`
- **This File**: Quick reference for getting started

---

## 🎯 Testing Checklist

- [ ] Create a task
- [ ] View in all 3 views (List, Calendar, Kanban)
- [ ] Drag task in calendar
- [ ] Drag task in kanban
- [ ] Filter by "Today"
- [ ] Edit a task
- [ ] Delete a task
- [ ] Connect Google Calendar (if setup)
- [ ] Enable push notifications (if setup)

---

## 🐛 Troubleshooting

**"Google Calendar won't connect"**
- Check if redirect URI matches exactly in Google Console
- Ensure Calendar API is enabled

**"Email not sending"**
- For Gmail: Need 2FA + App Password (not regular password)
- Check spam folder

**"Push notifications not working"**
- Need HTTPS in production
- Check if VAPID keys are set correctly

**"Tasks not loading"**
- Check browser console for errors
- Verify MongoDB connection

---

## 🎉 You're All Set!

The system is fully implemented and ready to use. Start without any APIs and add them later as needed.

**Access:** `http://localhost:3000/tasks`

Need help? Check the full documentation in `TASK_MANAGEMENT_SETUP.md`

Happy task managing! 🚀

