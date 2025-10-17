## Codentor

An AI-powered learning and interview preparation platform built with Next.js. Codentor helps users learn efficiently, practice with AI-driven mock interviews, track progress, and receive personalized recommendations — all in a cohesive, modern UI themed in deep green and black.

### Key Features
- AI Interview sessions with scores, strengths/weaknesses, recommendations, and transcripts
- Dashboard with interview stats, task completion stats, compact AI suggestions, and quick actions
- Learning Hub with AI assistant to find tutorials based on your problem
- Interview history and detailed view per session
- Tasks manager with progress and Google Calendar sync
- Social feed with posts and comments
- Connections and notifications
- Consistent deep green/black theme across the app

### Tech Stack
- Next.js (App Router)
- React, Tailwind CSS
- Clerk (Authentication)
- MongoDB with Mongoose
- Groq and Google Generative AI (Gemini) for AI features
- Pusher (Realtime) and Web Push (optional)
- Axios, date-fns

---

## Prerequisites
- Node.js 18+ and npm 9+ (LTS recommended)
- MongoDB instance (Atlas or local)
- Clerk account and application (for auth)
- Groq API key (for AI coach and interview analysis)
- Google Generative AI key (optional, for coding assistance)
- (Optional) Google API credentials if enabling Calendar sync
- (Optional) Pusher app credentials for realtime features

---

## Getting Started

### 1) Clone the repository
```bash
git clone <your-repo-url>
cd Codentor
```

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment variables
Create a `.env.local` in the project root:
```bash
# Server URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_********************************
CLERK_SECRET_KEY=sk_********************************

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Groq (AI)
GROQ_API_KEY=****************************

# Google Generative AI (optional)
GOOGLE_API_KEY=****************************

# Pusher (optional, for realtime)
PUSHER_APP_ID=********
PUSHER_KEY=********
PUSHER_SECRET=********
PUSHER_CLUSTER=***
NEXT_PUBLIC_PUSHER_KEY=********
NEXT_PUBLIC_PUSHER_CLUSTER=***

# Web Push / VAPID (optional)
VAPID_PUBLIC_KEY=********************************
VAPID_PRIVATE_KEY=********************************

# Other (if applicable to your deployment)
NEXT_TELEMETRY_DISABLED=1
```

Notes:
- Clerk: Make sure authorized redirect/callback URLs in your Clerk dashboard include `http://localhost:3000` for local dev.
- MongoDB: Provide a valid connection string. The code uses `lib/mongodb/mongoose.js` to connect.
- Groq: Required for AI Coach and interview analysis endpoints under `app/api/ai-coach/*` and interview APIs.
- Google Generative AI: Used for coding assistance (optional). If unused, you may leave it blank.
- Pusher & VAPID: Optional features, safe to omit if not needed.

### 4) (Optional) Generate VAPID keys
If you plan to use web push notifications:
```bash
npm run generate:vapid
```
This runs `scripts/generate-vapid-keys.js` and prints keys to add into `.env.local`.

### 5) Run the development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 6) Build and start (production)
```bash
npm run build
npm start
```

---

## Project Structure (high-level)
```
app/
  api/               # Next.js API routes (AI coach, interview, tasks, etc.)
  components/        # UI components (Header, Sidebar/Drawer, feed, editor, etc.)
  dashboard/         # Dashboard page
  interview/         # Interview lobby, session, details
  learn/             # Learning hub
  notes/             # Notes route
  tasks/             # Task manager
  ...
components/          # Shared components (ui/, playground/, learn/)
lib/
  models/            # Mongoose models
  mongodb/           # Mongo connection helper
  utils/             # Utilities (email, push notifications, etc.)
public/              # Static assets, icons, service worker
scripts/             # Helper scripts (e.g., VAPID key generation)
```

---

## Core Routes
- `/dashboard` — Home with stats and AI suggestions
- `/learn` — Learning Hub, with AI assistant button and modal
- `/feed` — Social feed and comments
- `/connections` — Manage connections
- `/codelab` — Coding lab
- `/interview` — Start interviews and view history
- `/interview/details/[id]` — Detailed view for a specific interview
- `/tasks` — Task Manager
- `/notes` — Notes

Key API routes (non-exhaustive):
- `GET /api/interview/stats` — Interview stats for dashboard/history
- `GET /api/interview/details/[id]` — Specific interview details
- `POST /api/ai-coach/initialize` — Initialize AI coach chat
- `POST /api/ai-coach/chat` — AI coach conversation
- `GET /api/dashboard/ai-suggestions` — Personalized AI suggestions
- `GET /api/tasks/stats` — Task completion stats

---

## Authentication (Clerk)
- Wrap your app with Clerk provider in `app/layout.jsx` (already configured).
- Protect API routes server-side using `auth` from `@clerk/nextjs/server`.
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set.

---

## Common Issues & Troubleshooting
- AI Coach shows an error: Verify `GROQ_API_KEY` is set and that API routes use `auth` from `@clerk/nextjs/server`. Check server logs for fallback to the secondary model (`llama-3.1-70b-versatile`).
- Mongo connection errors: Confirm `MONGODB_URI` and network access rules. The code uses a single shared connection via `lib/mongodb/mongoose.js`.
- 401/Redirect loops: Ensure Clerk URLs are configured for your domain and `NEXT_PUBLIC_APP_URL` is correct.
- Missing notes/interview routes: Verify the `app/notes` and `app/interview` directories exist and export pages.
- Web push not working: Make sure you generated and configured VAPID keys and Service Worker (`public/sw.js`).

---

## Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Run production server
npm run generate:vapid  # (optional) Generate VAPID keys
```

---

## Contributing
Issues and PRs are welcome. Please follow the established code style and ensure there are no linter errors.

---

## License
This project is licensed under the MIT License. See `LICENSE` for details.


