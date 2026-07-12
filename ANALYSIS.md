# VELONX — Codebase & Structure Analysis

Community-driven learning platform. Students build projects, connect with mentors, join events/communities, and earn gamified recognition (XP, badges, leaderboard, swag).

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 18, TypeScript |
| Database | MongoDB via Prisma ORM |
| Auth | NextAuth v5 (Prisma adapter) |
| Caching / rate-limit | Redis (Upstash + ioredis) |
| Media | Cloudinary |
| Email | Resend + React Email |
| Real-time | Custom WebSocket server (`ws`) |
| UI | Tailwind v4, Radix UI, Framer Motion, GSAP, Tiptap (rich text) |
| AI | Google Generative AI |
| Testing | Vitest (unit/integration), Playwright (E2E) |
| Deploy | Vercel / GCP (Dockerfile present) |

## Architecture

- **Custom server**: `server.js` + `src/app.ts` wrap Next.js to attach a WebSocket layer (`src/lib/websocket`) for real-time features (chat/notifications). `next dev`/`next start` remain available as fallback scripts.
- **Middleware**: `src/middleware.ts` plus `src/lib/middleware/` — `auth.middleware.ts`, `csrf.middleware.ts`, `rate-limit.middleware.ts`, `security-headers.middleware.ts` handle cross-cutting request concerns.
- **Auth config**: `src/auth.ts` (NextAuth v5).
- **Service layer**: `src/lib/services/` (~35 files) cleanly separates domain/business logic from route handlers — e.g. `xp.service`, `badge.service`, `leaderboard.service`, `moderation.service`, `brute-force-protection.service`, `cache.service`, `performance-monitor.service`.

## Data model (`prisma/schema.prisma`, ~70 models)

- **Identity/social**: User, Account, Session, Connection, Follow, UserBlock, UserMute
- **Community**: CommunityGroup, CommunityPost, PostComment/Reaction, DiscussionRoom, ChatMessage, GroupMember/Moderator, ModerationLog, Report
- **Learning**: LearningPath, Module, UserPathProgress/ModuleProgress, Resource
- **Mentorship**: Mentor, MentorSession, MentorReview, Meeting/MeetingAttendee, MockInterview
- **Projects**: Project, ProjectMember (submission/completion flow)
- **Events**: Event, EventAttendee, EventFAQ, EventReward, registration-closure/anti-abuse models
- **Gamification**: Badge, UserBadge, Achievement, XPTransaction, LeaderboardSnapshot, SwagItem/Order
- **Careers**: Opportunity, OpportunityApplication
- **Comms**: Notification, EmailNotificationPreference, DirectMessage/Conversation

## Application routes (`src/app`, 42 pages)

- **Public/marketing**: `/`, `about`, `blog`, `career`, `contact`, `events`, `mentors`, `projects`, `resources`, `privacy`, `terms`, `community-guidelines`
- **Auth flows**: `auth/login`, `signup`, `forgot-password`, `reset-password`, `verify`
- **Authenticated app**: `dashboard` (`admin` and `student` sub-areas), `community` (groups, threads, search), `messages`, `network`, `notifications`, `leaderboard`, `settings`, `referrals`, `swag`, `submit-project`, `apply-mentor`

## API surface (`src/app/api`, 155 route handlers)

Mirrors the domain model: `admin`, `ai`, `auth`, `blog`, `community`, `connections`, `contact`, `cron`, `email`, `events`, `leaderboard`, `learning-paths`, `meetings`, `mentor-sessions`, `mentors`, `messages`, `mock-interviews`, `notifications`, `opportunities`, `projects`, `referral`, `reports`, `resources`, `swag`, `upload`, `user(s)`, `verify`. Also `api-docs` (Swagger UI via `next-swagger-doc`) and a `health` check endpoint.

## Testing

- `src/__tests__`: unit / integration / api / services / config / performance (Vitest)
- `e2e/`: Playwright end-to-end suite
- Component-level `__tests__` folders alongside `admin`, `events`, `projects`, `resources` components

## Summary

A mature, full-featured EdTech/community platform — social networking, structured learning paths, mentorship marketplace, event management with anti-abuse protections, gamification (XP/badges/leaderboard/swag store), and a careers board, all behind a layered Next.js + Prisma/MongoDB backend with real-time and email notification channels.
