# Career System - Quick Start Guide

## 🎉 System is Ready!

All backend and frontend components are implemented and integrated.

## Quick Access

### For Students:
- **URL:** `/career`
- **Features:**
  - Apply for mock interviews
  - Browse internships
  - Browse jobs

### For Admins:
- **URL:** `/dashboard/admin` → Click "Career" tab
- **Features:**
  - Manage mock interview applications
  - Create/edit internships
  - Create/edit jobs

## Admin Quick Actions

### Managing Mock Interviews:
1. Go to Career tab → Mock Interviews
2. Click "Manage" on any application
3. Update status, add meeting link, schedule date
4. Save changes

### Adding an Internship:
1. Go to Career tab → Internships
2. Click "Add Internship"
3. Fill in:
   - Title, Company, Description
   - Requirements (one per line)
   - Location, Duration, Salary
   - Application URL
4. Set status (Active/Draft/Closed)
5. Submit

### Adding a Job:
1. Go to Career tab → Jobs
2. Click "Add Job"
3. Fill in details (similar to internship, no duration field)
4. Submit

## Status Meanings

### Mock Interview Status:
- **PENDING** - Waiting for admin review
- **APPROVED** - Approved, waiting to be scheduled
- **REJECTED** - Application declined
- **SCHEDULED** - Interview date/time set
- **COMPLETED** - Interview finished

### Opportunity Status:
- **ACTIVE** - Visible to students, accepting applications
- **CLOSED** - No longer accepting applications
- **DRAFT** - Not yet published to students

## API Endpoints (for reference)

### Mock Interviews:
- `POST /api/mock-interviews` - Submit application
- `GET /api/mock-interviews` - List applications
- `PATCH /api/mock-interviews/[id]` - Update (admin)

### Opportunities:
- `POST /api/opportunities` - Create (admin)
- `GET /api/opportunities?type=INTERNSHIP` - List internships
- `GET /api/opportunities?type=JOB` - List jobs
- `PATCH /api/opportunities/[id]` - Update (admin)
- `DELETE /api/opportunities/[id]` - Delete (admin)

## Database Collections

- `mock_interviews` - Stores mock interview applications
- `opportunities` - Stores internships and jobs

## Need Help?

Check `CAREER_SYSTEM_IMPLEMENTATION.md` for detailed documentation.
