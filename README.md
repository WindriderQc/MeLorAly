# MeLorAly 👨‍👩‍👧‍👦

**Multi-generational family educational support platform**

MeLorAly connects parents, children, and grandparents in a collaborative educational ecosystem. Track progress, share resources, and support each other's learning journey.

---

## 🌟 Features

### ✅ Complete User Authentication
- Session-based authentication with Supabase
- Secure registration and login flows
- Role-based access (parent, grandparent, admin)

### ✅ 5-Step Onboarding Flow
- Profile creation
- Children profile setup
- Family member invitations
- Family space configuration
- CSRF-protected forms

### ✅ Enhanced Dashboard
- Real-time family statistics
- Member avatars (stacked display, max 4 + overflow)
- Clickable children cards with ages
- Pending invitations counter
- Quick action buttons

### ✅ Family Management
- Create and manage multiple families
- Invite members by email
- Role management (admin/member/grandparent)
- Remove members with safeguards
- View family details and activities

### ✅ Children Profiles
- Individual child profiles with avatars
- Age calculation from birth date
- Grade/level tracking
- Edit profile with validation
- Delete profiles (admin only)
- Avatar upload (5MB limit, image files only)

### ✅ Ressources éducatives interactives
- Catalogue structuré par tranche d'âge et thématique
- Fiches activité détaillées (objectifs, matériel, étapes, astuces)
- Filtre d'âge instantané directement dans l'interface
- Suivi des complétions par enfant (journalisé dans Supabase)
- Comptabilisation automatique du temps d'apprentissage
- Plans d'apprentissage hebdomadaires générés automatiquement par enfant
- Recommandations personnalisées avec suivi des séries de progression
- Export du plan au format calendrier (.ics) pour partager avec la famille

### ✅ Centre de notifications
- Panneau latéral interactif depuis la barre de navigation
- Récupération dynamique des 10 dernières notifications
- Lecture individuelle ou globale (CSRF protégé)
- Indicateur d'activités non lues synchronisé en temps réel

### ✅ Design System
- 40+ CSS variables (WCAG AA compliant)
- Bootstrap 5 integration
- Material Symbols icons
- Responsive layouts
- Consistent color palette

---

## 🛠️ Tech Stack

**Backend:**
- Node.js 20+ / Express.js 5.1
- Supabase (PostgreSQL + Auth)
- Session-based authentication
- Input validation (express-validator)
- CSRF protection (selective)
- File uploads (multer)

**Frontend:**
- EJS templating
- Bootstrap 5.3.8
- Material Symbols icons
- Custom CSS with design tokens
- Responsive grid layouts

**Security:**
- Secure session secrets
- CSRF tokens on sensitive routes
- Input sanitization
- Permission-based access control
- SQL injection protection (Supabase)
- Adaptive rate limiting (global + auth entry points)
- Admin-protected Supabase service key usage for critical flows

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/WindriderQc/MeLorAly.git
cd MeLorAly/MeLorAly/app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_secure_random_string
PORT=3012
# Optional SMTP configuration for support emails
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_inbox_username
SMTP_PASSWORD=your_inbox_password
SMTP_SECURE=false
SUPPORT_INBOX=contact@yourdomain.com
```

4. **Set up database**
Run the SQL schema in your Supabase SQL editor:
```bash
cat database/schema.sql
```

5. **Start the server**
```bash
npm start
```

Visit `http://localhost:3012` 🎉

---

## 📁 Project Structure

```
MeLorAly/
├── app/
│   ├── config/              # Configuration files
│   ├── database/
│   │   └── schema.sql       # Supabase database schema
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── validators.js    # Input validation rules
│   ├── public/
│   │   ├── css/
│   │   │   └── app.css      # Main stylesheet (design tokens)
│   │   ├── images/          # Static images
│   │   └── js/
│   │       └── app.js       # Client-side JavaScript
│   ├── routes/
│   │   ├── auth.js          # Login/register/logout
│   │   ├── children.js      # Children profile CRUD
│   │   ├── dashboard.js     # Main dashboard
│   │   ├── education.js     # Educational resources + progress tracking
│   │   ├── family.js        # Family management
│   │   ├── messages.js      # Messaging (skeleton)
│   │   ├── onboarding.js    # 5-step onboarding
│   │   ├── profile.js       # User profile
│   │   ├── notifications.js # JSON API for notification panel
│   │   └── support.js       # FAQ/Contact (with email + persistence)
│   ├── views/
│   │   ├── auth/            # Login/register views
│   │   ├── children/        # Children profile views
│   │   ├── dashboard/       # Dashboard views
│   │   ├── family/          # Family management views
│   │   ├── onboarding/      # Onboarding flow views
│   │   ├── partials/        # Reusable components
│   │   └── ...
│   ├── .env                 # Environment variables (not in git)
│   ├── .env.example         # Environment template
│   ├── package.json         # Dependencies
│   └── server.js            # Express app entry point
├── docs/                    # Documentation
│   ├── API_ROUTES.md        # API endpoint reference
│   ├── DASHBOARD_ENHANCEMENTS.md
│   ├── DESIGN_TOKENS.md     # Design system guide
│   └── QUICK_REFERENCE.md   # Developer quick reference
├── archive/                 # Old progress reports
└── README.md               # This file
```

---

## 🔌 API Routes

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login
- `GET /auth/logout` - Logout

### Dashboard
- `GET /dashboard` - Main dashboard (role-based)
- `GET /dashboard/grandparent` - Grandparent-specific dashboard

### Family Management
- `GET /family` - List user's families
- `GET /family/create` - Create family form
- `POST /family/create` - Process family creation
- `GET /family/:id` - View family details
- `GET /family/:id/manage` - Manage family (admin only)
- `POST /family/:id/invite` - Invite member by email
- `PATCH /family/:id/member/:memberId/role` - Update member role
- `DELETE /family/:id/member/:memberId` - Remove member
- `DELETE /family/:id/invitation/:invitationId` - Cancel invitation

### Children Profiles
- `GET /children/:childId` - View child profile
- `GET /children/:childId/edit` - Edit form
- `POST /children/:childId/edit` - Update child
- `POST /children/:childId/avatar` - Upload avatar
- `DELETE /children/:childId` - Delete child (admin only)

### Onboarding
- `GET /onboarding/welcome` - Step 1: Welcome
- `GET/POST /onboarding/children` - Step 2: Add children
- `GET/POST /onboarding/adults` - Step 3: Invite adults
- `GET/POST /onboarding/family-space` - Step 4: Name family
- `GET /onboarding/ready` - Step 5: Complete & redirect

**See [docs/API_ROUTES.md](docs/API_ROUTES.md) for detailed endpoint documentation.**

---

## 🎨 Design System

MeLorAly uses a comprehensive design system with 40+ CSS variables for consistent styling.

**Color Palette:**
- Primary: `#2A6FE3` (Blue)
- Secondary: `#EE8E3A` (Orange)
- Success: `#22c55e`
- Warning: `#f59e0b`
- Danger: `#ef4444`

**Typography:**
- Font: Inter (sans-serif)
- Scale: 0.75rem to 3rem
- Weights: 400, 500, 600, 700, 800, 900

**Spacing:**
- 8px grid system
- Consistent padding/margins

**See [docs/DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) for complete design system documentation.**

---

## 🔒 Security

### Implemented
- ✅ Session-based authentication (express-session)
- ✅ Secure session secrets (64-char random)
- ✅ CSRF protection on onboarding routes
- ✅ Input validation on all POST routes
- ✅ Permission-based access control
- ✅ SQL injection protection (Supabase parameterized queries)
- ✅ File upload validation (type, size limits)

### Environment Variables
Never commit `.env` files. Use strong session secrets in production.

---

## 🧪 Testing

### Automated Test Suite ✅

**Status:** 38 tests passing  
**Framework:** Mocha + Chai + Supertest

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test category
npm run test:auth

# Verbose output
npm run test:verbose
```

**Test Coverage:**
- ✅ Authentication (10 tests)
- ✅ Dashboard routes (2 tests)
- ✅ Family management (3 tests)
- ✅ Children profiles (3 tests)
- ✅ Education (2 tests)
- ✅ Onboarding flow (5 tests)
- ✅ Profile management (4 tests)
- ✅ Notifications (3 tests)
- ✅ Support pages (5 tests)
- ✅ App health (1 test)

**See [MeLorAly/app/test/README.md](MeLorAly/app/test/README.md) for complete testing documentation.**

### Manual Testing Checklist
1. **Registration & Login**
   - Create account → Login → Logout
   - Invalid credentials handling
   
2. **Onboarding Flow**
   - Complete all 5 steps
   - CSRF token validation
   - Session persistence
   
3. **Dashboard**
   - View family statistics
   - Click children cards → Navigate to profiles
   - Member avatars display correctly
   
4. **Family Management**
   - Create family
   - Invite members (check email format)
   - Update member roles (admin only)
   - Remove members (prevent last admin)
   
5. **Children Profiles**
   - View profile with age calculation
   - Edit profile with validation
   - Upload avatar (image files only, 5MB limit)
   - Delete profile (admin permission check)

---

## 📚 Documentation

- **[API Routes](docs/API_ROUTES.md)** - Complete API endpoint reference
- **[Design Tokens](docs/DESIGN_TOKENS.md)** - Design system guide
- **[Dashboard Enhancements](docs/DASHBOARD_ENHANCEMENTS.md)** - Dashboard feature documentation
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Developer quick reference

---

## 🤝 Contributing

This is a collaborative multi-agent development project. Contributions welcome!

### Development Workflow
1. Create feature branch from `main`
2. Make changes
3. Test locally
4. Submit pull request
5. Code review
6. Merge to `main`

### Code Style
- Use ES6+ features
- Async/await for database queries
- Descriptive variable names
- Comments for complex logic
- Follow existing patterns

---

## 📝 License

[Add your license here]

---

## 👥 Team

Multi-agent collaborative development:
- **Agent A**: Dashboard enhancement, coordination, optimization
- **Agent B**: Family management system
- **Agent C**: Children profile system

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅ (Complete)
- [x] Authentication & onboarding
- [x] Dashboard with real-time stats
- [x] Family management
- [x] Children profiles
- [x] Design system

### Phase 2: Features (In Progress)
- [ ] Messaging system (backend ready, UI needed)
- [ ] Educational resources hub
- [ ] Activity tracking
- [ ] Progress reports
- [ ] Notifications system

### Phase 3: Advanced
- [ ] Mobile app (React Native)
- [ ] Real-time chat (WebSockets)
- [ ] File sharing
- [ ] Calendar integration
- [ ] Achievement badges
- [ ] Analytics dashboard

### Phase 4: Scale
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced permissions
- [ ] API for third-party integrations

---

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/WindriderQc/MeLorAly/issues)
- **Documentation**: See `/docs` folder
- **FAQ**: Visit `/faq` on running app

---

## 🎉 Acknowledgments

Built with ❤️ using:
- [Express.js](https://expressjs.com/)
- [Supabase](https://supabase.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Material Symbols](https://fonts.google.com/icons)

---

**Made with multi-agent collaboration** 🤖🤖🤖
