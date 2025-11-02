# Changelog

All notable changes to the MeLorAly project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Password reset functionality
- Email verification
- Social login (Google, Apple, Facebook)
- Full messaging system UI
- Mobile app (React Native)

---

## [1.0.0] - 2025-11-02

### 🎉 Initial Production Release

#### Added
- **Authentication System**
  - Session-based authentication with Supabase
  - Secure registration and login flows
  - Role-based access control (parent, grandparent, admin)
  - Logout functionality

- **5-Step Onboarding Flow**
  - Welcome introduction
  - Children profile setup
  - Family member invitations
  - Family space configuration
  - CSRF-protected forms with validation

- **Enhanced Dashboard**
  - Real-time family statistics
  - Member avatars with stacked display (max 4 + overflow)
  - Clickable children cards showing ages
  - Pending invitations counter
  - Quick action buttons
  - Role-based dashboards (parent/grandparent)

- **Family Management**
  - Create and manage multiple families
  - Invite members by email
  - Role management (admin/member/grandparent)
  - Remove members with safeguards
  - View family details and activities
  - Admin-only family settings

- **Children Profiles**
  - Individual child profiles with avatars
  - Age calculation from birth date
  - Grade/level tracking
  - Edit profile with validation
  - Delete profiles (admin only)
  - Avatar upload (5MB limit, image validation)
  - Create children after onboarding

- **Educational Resources**
  - Catalog structured by age groups and themes
  - Detailed activity cards (objectives, materials, steps, tips)
  - Instant age filter in UI
  - Completion tracking per child (logged in Supabase)
  - Automatic learning time calculation
  - Weekly auto-generated learning plans per child
  - Personalized recommendations with progress tracking
  - Export to .ics calendar format

- **Notifications Center**
  - Interactive side panel from navigation bar
  - Dynamic retrieval of latest 10 notifications
  - Individual or bulk read marking (CSRF protected)
  - Real-time unread activity indicator

- **Profile Management**
  - User profile editing (name, email, bio)
  - Password change functionality
  - Notification preferences
  - Privacy settings
  - Account deletion with full cleanup
  - Profile root route redirect

- **Support System**
  - FAQ page with common questions
  - Contact form with email integration
  - Support requests saved to database
  - SMTP email sending (configurable)

- **Design System**
  - 40+ CSS variables (WCAG AA compliant)
  - Bootstrap 5.3.8 integration
  - Material Symbols icons
  - Responsive layouts
  - Consistent color palette
  - 8px grid system

- **Test Suite** ✨
  - 38 automated tests
  - Mocha + Chai + Supertest framework
  - Test coverage for all major routes
  - Test helpers and mock data generators
  - Comprehensive test documentation

#### Security
- Session-based authentication (express-session)
- Secure session secrets (64-char random)
- CSRF protection on sensitive routes
- Input validation on all POST routes (express-validator)
- Permission-based access control
- SQL injection protection (Supabase parameterized queries)
- File upload validation (type, size limits)
- Rate limiting (adaptive global + auth entry points)
- Admin-protected Supabase service key for critical flows
- Production-ready session and cookie configuration

#### Documentation
- Comprehensive README (460+ lines)
- API Routes documentation
- Design Tokens guide
- Dashboard Enhancements documentation
- Quick Reference guide
- Production Deployment guide
- Test Suite documentation
- Contributing guidelines
- MIT License

#### Technical Stack
- Node.js 20+
- Express.js 5.1
- Supabase (PostgreSQL + Auth + Storage)
- EJS templating
- Bootstrap 5.3.8
- Session-based authentication
- CSRF protection (csurf)
- Rate limiting (express-rate-limit)
- Input validation (express-validator)
- File uploads (multer)
- Email sending (nodemailer)

#### Infrastructure
- PM2 process management
- Nginx reverse proxy configuration
- Production deployment guide
- Environment variable management
- Git workflow established

---

## [0.9.0] - 2025-11-01

### Added
- Project initialization
- Basic Express.js setup
- Supabase integration
- Initial route structure
- Basic authentication scaffolding

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| **1.0.0** | 2025-11-02 | 🎉 **Production Release** - Full platform with 38 tests |
| 0.9.0 | 2025-11-01 | Initial setup and scaffolding |

---

## Future Releases

### v1.1.0 (Planned)
- Password reset functionality
- Email verification
- Enhanced messaging system
- Performance optimizations

### v1.2.0 (Planned)
- Social login integration
- Mobile responsive improvements
- Redis session store
- Enhanced analytics

### v2.0.0 (Future)
- Mobile app (React Native)
- Real-time chat (WebSockets)
- Multi-language support
- Advanced permissions system

---

**Maintained by:** MeLorAly Development Team  
**License:** MIT
