# Implementation Plan: Backend API and Database Integration

## Overview

This implementation plan breaks down the backend API and database integration into incremental, testable steps. Each task builds on previous work, starting with database setup, then core API infrastructure, followed by entity-specific endpoints, and finally frontend integration. The plan includes both implementation tasks and testing tasks to ensure correctness at each step.

## Tasks

- [x] 1. Database setup and schema definition
  - [x] 1.1 Install and configure Prisma ORM
    - Install Prisma CLI and client packages
    - Initialize Prisma with MongoDB provider
    - Configure MongoDB connection string in .env (DATABASE_URL)
    - _Requirements: 1.1, 1.2_
  
  - [x] 1.2 Define core database schema models
    - Create User model with authentication fields (id, name, email, password, role, xp, level)
    - Use @id @default(auto()) @map("_id") @db.ObjectId for MongoDB
    - Create Account, Session, VerificationToken models for NextAuth
    - Define UserRole enum (STUDENT, ADMIN)
    - Add @@map directives for collection names
    - _Requirements: 1.3, 2.3, 2.5_
  
  - [x] 1.3 Define Event and related models
    - Create Event model with all fields (title, description, type, date, maxSeats, status)
    - Use @db.ObjectId for all ID fields and foreign keys
    - Create EventAttendee junction collection for many-to-many relationship
    - Define EventType enum (HACKATHON, WORKSHOP, WEBINAR)
    - Define EventStatus enum (UPCOMING, ONGOING, COMPLETED, CANCELLED)
    - Define AttendeeStatus enum (REGISTERED, ATTENDED, CANCELLED)
    - Add @@map directives for collection names
    - _Requirements: 1.3, 1.4, 3.6, 3.8_
  
  - [x] 1.4 Define Project and related models
    - Create Project model with all fields (title, description, techStack, status, outcomes)
    - Use @db.ObjectId for all ID fields and foreign keys
    - Create ProjectMember junction collection for many-to-many relationship
    - Define ProjectStatus enum (PLANNING, IN_PROGRESS, COMPLETED, ARCHIVED)
    - Add @@map directives for collection names
    - _Requirements: 1.3, 1.4, 4.3, 4.4_
  
  - [x] 1.5 Define remaining entity models
    - Create Mentor model (name, expertise, company, bio, rating, totalSessions)
    - Create Resource model with ResourceCategory and ResourceType enums
    - Create BlogPost model with PostStatus enum (DRAFT, PUBLISHED)
    - Create Meeting and MeetingAttendee models with MeetingAttendeeStatus enum
    - Create UserRequest model with RequestType and RequestStatus enums
    - Use @db.ObjectId for all ID fields and foreign keys
    - Add @@map directives for all collection names
    - _Requirements: 1.3, 1.4, 1.7_
  
  - [x] 1.6 Push schema to MongoDB and verify
    - Run prisma db push to sync schema with MongoDB
    - Verify all collections are created correctly
    - Check indexes are created in MongoDB
    - Test Prisma client generation
    - _Requirements: 1.6_
  
  - [x] 1.7 Create database seed script
    - Create seed.ts with sample users (students and admins)
    - Add sample events, projects, mentors, resources, blog posts
    - Add sample relationships (event attendees, project members)
    - Run seed script and verify data
    - _Requirements: 1.8_

- [x] 2. Core API infrastructure and authentication
  - [x] 2.1 Set up Prisma client singleton
    - Create lib/prisma.ts with singleton pattern
    - Configure logging for development
    - Export prisma client instance
    - _Requirements: 1.2_
  
  - [x] 2.2 Configure NextAuth with Prisma adapter
    - Update lib/auth.ts with PrismaAdapter
    - Configure Google, GitHub, and Credentials providers
    - Implement JWT callbacks to include user role
    - Configure session strategy and custom pages
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [x] 2.3 Create authentication middleware
    - Implement requireAuth function in lib/middleware/auth.middleware.ts
    - Implement requireAdmin function for admin-only routes
    - Add session verification and role checking
    - Return appropriate error responses (401, 403)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 2.4 Create error handling utilities
    - Define AppError base class and specific error classes
    - Implement handleError function for consistent error responses
    - Add Prisma error handling (P2002, P2025)
    - Add Zod validation error handling
    - _Requirements: 12.1, 12.4, 12.5, 13.7_
  
  - [x] 2.5 Create validation schemas with Zod
    - Create lib/validations/user.ts with user schemas
    - Create lib/validations/event.ts with event schemas
    - Create lib/validations/project.ts with project schemas
    - Add validation for required fields, types, formats, and lengths
    - _Requirements: 12.2, 12.3, 12.7, 12.8, 12.9_
  
  - [ ]* 2.6 Write property tests for authentication
    - **Property 1: Default Role Assignment**
    - **Property 2: Session Data Completeness**
    - **Property 29: Authentication Verification**
    - **Property 30: Authorization Verification**
    - **Validates: Requirements 2.4, 2.6, 11.2, 11.3, 11.4, 11.5**

- [x] 3. User management API
  - [x] 3.1 Create user service layer
    - Implement UserService class in lib/services/user.service.ts
    - Add methods: listUsers, getUserById, updateUser, getUserStats
    - Include pagination, filtering, and proper error handling
    - _Requirements: 2.7, 2.8_
  
  - [x] 3.2 Implement user API endpoints
    - Create GET /api/users route (admin only, paginated)
    - Create GET /api/users/[id] route
    - Create PATCH /api/users/[id] route with authorization check
    - Create GET /api/users/[id]/stats route
    - Add authentication and authorization middleware
    - _Requirements: 2.7, 2.8, 2.9_
  
  - [ ]* 3.3 Write property tests for user management
    - **Property 3: Profile Update Round-Trip**
    - **Property 4: Authorization Boundary**
    - **Property 14: Owner Resource Access**
    - **Validates: Requirements 2.8, 2.9, 11.7**
  
  - [ ]* 3.4 Write unit tests for user edge cases
    - Test updating non-existent user returns 404
    - Test invalid email format is rejected
    - Test bio exceeding max length is rejected
    - _Requirements: 2.8, 12.6, 12.7, 12.9_

- [x] 4. Events management API
  - [x] 4.1 Create event service layer
    - Implement EventService class in lib/services/event.service.ts
    - Add methods: listEvents, getEventById, createEvent, updateEvent, deleteEvent
    - Add methods: registerForEvent, unregisterFromEvent
    - Include pagination, filtering, seat availability checks
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  
  - [x] 4.2 Implement event API endpoints
    - Create GET /api/events route (paginated, filterable)
    - Create POST /api/events route (admin only)
    - Create GET /api/events/[id] route
    - Create PATCH /api/events/[id] route (admin only)
    - Create DELETE /api/events/[id] route (admin only)
    - Create POST /api/events/[id]/register route
    - Create DELETE /api/events/[id]/register route
    - _Requirements: 3.1, 3.2, 3.3, 3.9_
  
  - [ ]* 4.3 Write property tests for events
    - **Property 6: Universal Filtering** (events)
    - **Property 7: Event Registration with Available Seats**
    - **Property 9: Event Response Completeness**
    - **Property 10: Universal Input Validation** (events)
    - **Validates: Requirements 3.2, 3.4, 3.7, 3.9**
  
  - [ ]* 4.4 Write unit tests for event edge cases
    - Test event at capacity rejects registration (Property 8 edge case)
    - Test duplicate registration is rejected
    - Test invalid event type is rejected
    - Test past date is rejected
    - _Requirements: 3.5, 3.7, 3.8_

- [x] 5. Checkpoint - Verify authentication and events
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Projects management API
  - [x] 6.1 Create project service layer
    - Implement ProjectService class in lib/services/project.service.ts
    - Add methods: listProjects, getProjectById, createProject, updateProject, deleteProject
    - Add methods: addProjectMember, removeProjectMember
    - Include pagination, filtering, and authorization checks
    - _Requirements: 4.1, 4.5, 4.7_
  
  - [x] 6.2 Implement project API endpoints
    - Create GET /api/projects route (paginated, filterable)
    - Create POST /api/projects route
    - Create GET /api/projects/[id] route
    - Create PATCH /api/projects/[id] route (owner/admin only)
    - Create DELETE /api/projects/[id] route (owner/admin only)
    - Create POST /api/projects/[id]/members route
    - Create DELETE /api/projects/[id]/members/[userId] route
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 4.8_
  
  - [ ]* 6.3 Write property tests for projects
    - **Property 6: Universal Filtering** (projects)
    - **Property 10: Universal Input Validation** (projects)
    - **Property 11: Project Member Addition**
    - **Property 12: Project Completion Outcomes**
    - **Property 13: Role-Based Resource Access** (projects)
    - **Validates: Requirements 4.2, 4.5, 4.7, 4.8, 4.9**
  
  - [ ]* 6.4 Write unit tests for project edge cases
    - Test non-owner cannot update project
    - Test removing non-existent member fails gracefully
    - Test project with empty tech stack is rejected
    - _Requirements: 4.2, 4.7, 4.8_

- [x] 7. Mentors and resources APIs
  - [x] 7.1 Create mentor service layer
    - Implement MentorService class in lib/services/mentor.service.ts
    - Add methods: listMentors, getMentorById, createMentor, updateMentor, deleteMentor
    - Include pagination, filtering, and rating calculation
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [x] 7.2 Implement mentor API endpoints
    - Create GET /api/mentors route (paginated, filterable)
    - Create POST /api/mentors route (admin only)
    - Create GET /api/mentors/[id] route
    - Create PATCH /api/mentors/[id] route (admin only)
    - Create DELETE /api/mentors/[id] route (admin only)
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 5.8_
  
  - [x] 7.3 Create resource service layer
    - Implement ResourceService class in lib/services/resource.service.ts
    - Add methods: listResources, getResourceById, createResource, updateResource, deleteResource
    - Add method: trackResourceAccess to increment access count
    - Include pagination and filtering
    - _Requirements: 6.1, 6.3, 6.7_
  
  - [x] 7.4 Implement resource API endpoints
    - Create GET /api/resources route (paginated, filterable)
    - Create POST /api/resources route (admin only)
    - Create GET /api/resources/[id] route
    - Create PATCH /api/resources/[id] route (admin only)
    - Create DELETE /api/resources/[id] route (admin only)
    - Create POST /api/resources/[id]/access route
    - _Requirements: 6.1, 6.3, 6.4, 6.6, 6.7, 6.8_
  
  - [ ]* 7.5 Write property tests for mentors and resources
    - **Property 6: Universal Filtering** (mentors, resources)
    - **Property 10: Universal Input Validation** (mentors, resources)
    - **Property 13: Role-Based Resource Access** (mentors, resources)
    - **Property 15: Mentor Rating Calculation**
    - **Property 16: Mentor Session Count**
    - **Property 17: Resource Access Tracking**
    - **Validates: Requirements 5.2, 5.5, 5.6, 5.7, 5.8, 6.3, 6.6, 6.7, 6.8**

- [x] 8. Blog and leaderboard APIs
  - [x] 8.1 Create blog service layer
    - Implement BlogService class in lib/services/blog.service.ts
    - Add methods: listBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost
    - Include pagination, filtering, and draft visibility logic
    - _Requirements: 7.1, 7.4, 7.8_
  
  - [x] 8.2 Implement blog API endpoints
    - Create GET /api/blog route (paginated, filterable, draft filtering)
    - Create POST /api/blog route (admin only)
    - Create GET /api/blog/[id] route
    - Create PATCH /api/blog/[id] route (author/admin only)
    - Create DELETE /api/blog/[id] route (author/admin only)
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.7, 7.8_
  
  - [x] 8.3 Create XP and level calculation utilities
    - Implement calculateLevel function in lib/utils/xp.ts
    - Define XP_THRESHOLDS array
    - Define XP_REWARDS object for different actions
    - Implement awardXP function with level recalculation
    - _Requirements: 8.4, 8.5_
  
  - [x] 8.4 Create leaderboard service layer
    - Implement LeaderboardService class in lib/services/leaderboard.service.ts
    - Add methods: getLeaderboard with pagination and filtering
    - Add method: awardXP to user with automatic level calculation
    - Include rank calculation and project count
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [x] 8.5 Implement leaderboard API endpoints
    - Create GET /api/leaderboard route (paginated, filterable)
    - Create POST /api/leaderboard/award-xp route (admin only)
    - _Requirements: 8.1, 8.2, 8.3, 8.7_
  
  - [ ]* 8.6 Write property tests for blog and leaderboard
    - **Property 6: Universal Filtering** (blog)
    - **Property 10: Universal Input Validation** (blog)
    - **Property 13: Role-Based Resource Access** (blog)
    - **Property 18: Draft Post Visibility**
    - **Property 19: Leaderboard Ordering**
    - **Property 20: XP Award Consistency**
    - **Property 21: Level Calculation from XP**
    - **Property 22: Leaderboard Entry Completeness**
    - **Property 23: Ranking Consistency**
    - **Validates: Requirements 7.2, 7.4, 7.7, 7.8, 8.2, 8.4, 8.5, 8.6, 8.8**

- [ ] 9. Checkpoint - Verify core entities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Meetings and admin APIs
  - [x] 10.1 Create meeting service layer
    - Implement MeetingService class in lib/services/meeting.service.ts
    - Add methods: listMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting
    - Add methods: addMeetingAttendee, updateAttendeeStatus
    - Include pagination and filtering
    - _Requirements: 9.1, 9.4, 9.7_
  
  - [x] 10.2 Implement meeting API endpoints
    - Create GET /api/meetings route (paginated, filterable)
    - Create POST /api/meetings route
    - Create GET /api/meetings/[id] route
    - Create PATCH /api/meetings/[id] route (creator/admin only)
    - Create DELETE /api/meetings/[id] route (creator/admin only)
    - Create POST /api/meetings/[id]/attendees route
    - Create PATCH /api/meetings/[id]/attendees/[userId] route
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.7, 9.8_
  
  - [x] 10.3 Create admin service layer
    - Implement AdminService class in lib/services/admin.service.ts
    - Add methods: listUserRequests, approveRequest, rejectRequest
    - Add methods: getPlatformStats, logModerationAction
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.8_
  
  - [x] 10.4 Implement admin API endpoints
    - Create GET /api/admin/requests route (admin only, paginated)
    - Create PATCH /api/admin/requests/[id] route (admin only)
    - Create GET /api/admin/stats route (admin only)
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 10.5 Write property tests for meetings and admin
    - **Property 6: Universal Filtering** (meetings)
    - **Property 10: Universal Input Validation** (meetings)
    - **Property 13: Role-Based Resource Access** (admin)
    - **Property 24: Meeting Attendee Addition**
    - **Property 25: User Request Creation on Registration**
    - **Property 26: Request Approval Effect**
    - **Property 27: Request Rejection Effect**
    - **Property 28: Moderation Action Logging**
    - **Validates: Requirements 9.2, 9.4, 9.7, 10.2, 10.3, 10.4, 10.5, 10.7, 10.8**

- [ ] 11. Universal API properties and response formatting
  - [ ]* 11.1 Write property tests for pagination
    - **Property 5: Universal Pagination**
    - Test across all list endpoints (events, projects, mentors, resources, blog, leaderboard, meetings)
    - **Validates: Requirements 3.3, 4.6, 5.3, 6.4, 7.5, 8.3, 9.5, 14.4**
  
  - [ ]* 11.2 Write property tests for API response formatting
    - **Property 33: JSON Response Format**
    - **Property 34: Success Status Codes**
    - **Property 35: Paginated Response Structure**
    - **Property 36: ISO 8601 Timestamps**
    - **Property 37: Error Response Structure**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.6, 13.7, 13.8**
  
  - [ ]* 11.3 Write property tests for error handling
    - **Property 10: Universal Input Validation** (comprehensive test across all entities)
    - **Property 32: Resource Not Found**
    - Test validation errors return 400 with details
    - Test missing resources return 404
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.6, 12.7, 12.8, 12.9**
  
  - [ ]* 11.4 Write property test for rate limiting
    - **Property 31: Rate Limiting**
    - Test excessive requests are throttled
    - **Validates: Requirements 11.8**

- [x] 12. Frontend integration - Replace mock data with API calls
  - [x] 12.1 Create API client utilities
    - Create lib/api/client.ts with fetch wrapper
    - Add error handling and response parsing
    - Add TypeScript types for all API responses
    - Create hooks for data fetching (useEvents, useProjects, etc.)
    - _Requirements: 15.2, 15.3, 15.4, 15.5_
  
  - [x] 12.2 Replace mock data in dashboard components
    - Update student dashboard to fetch tasks, projects, calendar from API
    - Update admin dashboard to fetch user requests and stats from API
    - Add loading states and error handling
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [x] 12.3 Replace mock data in events pages
    - Update events list page to fetch from GET /api/events
    - Update event detail page to fetch from GET /api/events/[id]
    - Add event registration functionality using POST /api/events/[id]/register
    - Implement cache revalidation after registration
    - _Requirements: 15.1, 15.2, 15.7_
  
  - [x] 12.4 Replace mock data in projects pages
    - Update projects list page to fetch from GET /api/projects
    - Update project detail page to fetch from GET /api/projects/[id]
    - Add project creation form using POST /api/projects
    - Add member management using project member endpoints
    - _Requirements: 15.1, 15.2, 15.7_
  
  - [x] 12.5 Replace mock data in remaining pages
    - Update mentors page to fetch from GET /api/mentors
    - Update resources page to fetch from GET /api/resources
    - Update blog page to fetch from GET /api/blog
    - Update leaderboard page to fetch from GET /api/leaderboard
    - Update meetings/calendar to fetch from GET /api/meetings
    - _Requirements: 15.1, 15.2_
  
  - [x] 12.6 Implement optimistic updates
    - Add optimistic updates for event registration
    - Add optimistic updates for project member addition
    - Add optimistic updates for meeting creation
    - Implement rollback on error
    - _Requirements: 15.8_
  
  - [ ]* 12.7 Write property tests for frontend integration
    - **Property 38: Frontend API Integration**
    - **Property 39: Cache Revalidation on Mutation**
    - Test components fetch from correct endpoints
    - Test mutations trigger cache updates
    - **Validates: Requirements 15.2, 15.7**

- [ ] 13. Final checkpoint and testing
  - [ ]* 13.1 Run full test suite
    - Run all property tests (minimum 100 iterations each)
    - Run all unit tests
    - Run all integration tests
    - Verify test coverage meets 80% minimum
  
  - [ ] 13.2 Manual testing and verification
    - Test authentication flows (Google, GitHub, Credentials)
    - Test admin vs student permissions
    - Test all CRUD operations through UI
    - Test pagination and filtering
    - Test error handling and edge cases
    - _Requirements: All_
  
  - [ ] 13.3 Performance verification
    - Verify database indexes are created
    - Test query performance with large datasets
    - Verify pagination limits are enforced
    - Check API response times
    - _Requirements: 1.7, 14.1, 14.4_

- [ ] 14. Final integration and cleanup
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout implementation
- Frontend integration happens after all API endpoints are complete and tested
