# MeLorAly - Prototype Development Plan

**Version:** 1.0  
**Date:** November 1, 2025  
**Target:** MVP Prototype Development

---

## 🎯 Prototype Objectives

### Goals
1. **Validate** the core concept with real families
2. **Test** user flows and interface usability
3. **Demonstrate** key features to stakeholders/investors
4. **Gather** user feedback for iteration
5. **Estimate** full development scope and timeline

### Scope
- **Functional web application** (responsive)
- **Core MVP features** only (see Phase 1 in specs)
- **Simulated backend** initially, then basic real backend
- **10-20 test families** for beta testing

---

## 🏗️ Recommended Technology Stack

### Frontend

#### Framework: **Next.js 14** (App Router)
**Why:**
- ✅ React-based (large ecosystem, hiring pool)
- ✅ Server-side rendering (SEO, performance)
- ✅ Built-in routing and API routes
- ✅ Image optimization out of the box
- ✅ Excellent developer experience
- ✅ Easy deployment (Vercel)

**Alternatives Considered:**
- Vite + React (simpler but need separate backend)
- Remix (good but smaller ecosystem)
- SvelteKit (great but less developer availability)

#### Styling: **Tailwind CSS**
**Why:**
- ✅ Already used in HTML prototypes
- ✅ Rapid development
- ✅ Consistent design system
- ✅ Built-in dark mode support
- ✅ Easy customization

**Additional:**
- **shadcn/ui** - Pre-built accessible components
- **Radix UI** - Headless UI primitives
- **Framer Motion** - Smooth animations

#### State Management: **Zustand**
**Why:**
- ✅ Lightweight (< 1KB)
- ✅ Simple API
- ✅ No boilerplate
- ✅ Works great with Next.js

**Alternative:** React Context API for simple cases

#### Forms: **React Hook Form**
- ✅ Performant (minimal re-renders)
- ✅ Built-in validation
- ✅ TypeScript support

#### Real-time: **Pusher** or **Supabase Realtime**
- WebSockets for messaging
- Live notifications
- Online status

### Backend

#### Option 1 (Recommended): **Supabase** 🏆
**Why:**
- ✅ PostgreSQL database (with real-time!)
- ✅ Built-in authentication (email + OAuth)
- ✅ File storage included
- ✅ Row-level security
- ✅ Auto-generated REST & GraphQL APIs
- ✅ Free tier generous for prototyping
- ✅ Fast setup (hours, not days)

**Perfect for:**
- Rapid prototyping
- Real-time features
- Quick iteration

#### Option 2: **Custom Node.js Backend**
**Stack:**
- Express.js or Fastify
- Prisma ORM
- PostgreSQL
- JWT authentication
- AWS S3 for storage

**Use if:**
- Need complete control
- Complex business logic
- Specific compliance requirements

**Recommendation:** Start with Supabase for MVP, migrate later if needed

### Database Schema (PostgreSQL)

```sql
-- Users (handled by Supabase Auth)
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  created_at timestamp
)

-- Profiles (extended user info)
profiles (
  id uuid PRIMARY KEY REFERENCES users,
  full_name text,
  avatar_url text,
  role text, -- 'parent', 'grandparent'
  created_at timestamp
)

-- Families
families (
  id uuid PRIMARY KEY,
  name text,
  avatar_url text,
  created_by uuid REFERENCES users,
  created_at timestamp
)

-- Family Members (join table)
family_members (
  id uuid PRIMARY KEY,
  family_id uuid REFERENCES families,
  user_id uuid REFERENCES users,
  role text, -- 'admin', 'member', 'grandparent'
  joined_at timestamp
)

-- Children
children (
  id uuid PRIMARY KEY,
  family_id uuid REFERENCES families,
  name text,
  birth_date date,
  grade text,
  avatar_url text,
  created_at timestamp
)

-- Messages
messages (
  id uuid PRIMARY KEY,
  family_id uuid REFERENCES families,
  user_id uuid REFERENCES users,
  content text,
  created_at timestamp
)

-- Notifications
notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  type text,
  title text,
  message text,
  read boolean DEFAULT false,
  created_at timestamp
)

-- Invitations
invitations (
  id uuid PRIMARY KEY,
  family_id uuid REFERENCES families,
  email text,
  role text,
  invited_by uuid REFERENCES users,
  status text, -- 'pending', 'accepted', 'expired'
  created_at timestamp,
  expires_at timestamp
)
```

### Infrastructure

#### Hosting: **Vercel** (Frontend)
- ✅ Next.js optimized
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Free tier for prototyping
- ✅ Excellent DX

#### Backend: **Supabase Cloud** (Free tier)
- ✅ Database, Auth, Storage, Realtime
- ✅ Generous free tier
- ✅ Easy scaling path

#### File Storage: **Supabase Storage**
- User avatars
- Family photos
- Shared documents
- Educational resources

#### Monitoring & Analytics
- **Vercel Analytics** - Performance
- **Sentry** - Error tracking (free tier)
- **PostHog** - Product analytics (open source, free tier)

---

## 📅 Development Timeline (8-12 Weeks)

### Week 1-2: Setup & Foundation
**Deliverables:**
- [x] Project scaffolding (Next.js + Tailwind)
- [x] Supabase project setup
- [x] Design system implementation (colors, fonts, components)
- [x] Basic routing structure
- [x] Database schema creation
- [x] Authentication flow (email + Google OAuth)

**Tasks:**
```bash
# Initialize Next.js project
npx create-next-app@latest meloraly --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand react-hook-form zod
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react # Icons (Material Symbols alternative)
```

### Week 3-4: Authentication & Onboarding
**Deliverables:**
- [x] Login/Register pages
- [x] Social authentication (Google, Apple)
- [x] Password reset flow
- [x] 5-step onboarding wizard
- [x] Profile creation

**Key Features:**
- Email verification
- Form validation
- Progress indicators
- Mobile-responsive design

### Week 5-6: Family & Dashboard
**Deliverables:**
- [x] Family creation
- [x] Add children profiles
- [x] Invite family members (email)
- [x] Parental dashboard
- [x] Grandparent view
- [x] Member management

**Key Features:**
- Multi-step forms
- Avatar upload
- Invitation system
- Role-based access control

### Week 7-8: Messaging & Notifications
**Deliverables:**
- [x] Family chat interface
- [x] Real-time messaging
- [x] Notification center
- [x] Push notification setup (web)
- [x] Read receipts

**Key Features:**
- WebSocket integration
- Message history
- Typing indicators
- Notification preferences

### Week 9-10: Educational Content & Resources
**Deliverables:**
- [x] Educational resource pages
- [x] Pre-school activities
- [x] School support content
- [x] Parental guidance articles
- [x] Content categorization

**Key Features:**
- Content management
- Search & filtering
- Bookmarking
- Progress tracking (basic)

### Week 11-12: Polish & Testing
**Deliverables:**
- [x] Settings & preferences
- [x] Profile editing
- [x] FAQ & support pages
- [x] Dark mode refinement
- [x] Performance optimization
- [x] Bug fixes
- [x] User acceptance testing

**Key Features:**
- Accessibility improvements
- Error handling
- Loading states
- Empty states
- Mobile optimization

---

## 🛠️ Development Best Practices

### Code Quality
- **TypeScript** - Type safety throughout
- **ESLint** + **Prettier** - Code formatting
- **Husky** - Pre-commit hooks
- **Conventional Commits** - Clear commit messages

### Testing Strategy
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright (critical user flows)
- **Visual Regression:** Chromatic (optional)
- **Manual Testing:** User acceptance testing

### Version Control
```
main (production)
├── develop (staging)
    ├── feature/authentication
    ├── feature/onboarding
    ├── feature/messaging
    └── feature/dashboard
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 📂 Project Structure

```
meloraly/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (grouped)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   │
│   ├── (onboarding)/           # Onboarding flow
│   │   ├── welcome/
│   │   ├── children/
│   │   ├── adults/
│   │   ├── family-space/
│   │   └── ready/
│   │
│   ├── (app)/                  # Main app (authenticated)
│   │   ├── dashboard/
│   │   ├── family/
│   │   ├── messages/
│   │   ├── education/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   │
│   ├── api/                    # API routes
│   │   ├── invitations/
│   │   └── notifications/
│   │
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/                 # React components
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── auth/                   # Auth-specific
│   ├── dashboard/              # Dashboard components
│   ├── messaging/              # Chat components
│   └── shared/                 # Shared components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Avatar.tsx
│
├── lib/                        # Utilities
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   ├── server.ts           # Server-side Supabase
│   │   └── middleware.ts       # Auth middleware
│   │
│   ├── store/                  # Zustand stores
│   │   ├── userStore.ts
│   │   ├── familyStore.ts
│   │   └── messageStore.ts
│   │
│   └── utils/                  # Helper functions
│       ├── validation.ts
│       ├── date.ts
│       └── constants.ts
│
├── types/                      # TypeScript types
│   ├── database.ts             # Supabase types
│   ├── user.ts
│   └── family.ts
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── .env.local                  # Environment variables
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json
```

---

## 🚀 Deployment Strategy

### Environments

#### Development
- **URL:** http://localhost:3000
- **Database:** Supabase dev project
- **Hot reload:** Yes

#### Staging
- **URL:** https://staging.meloraly.com
- **Database:** Supabase staging project
- **Auto-deploy:** From `develop` branch
- **Testing:** User acceptance testing

#### Production
- **URL:** https://meloraly.com
- **Database:** Supabase production project
- **Deploy:** Manual from `main` branch
- **Monitoring:** Sentry + Vercel Analytics

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: vercel/action@v1
```

---

## 💰 Budget Estimate (Prototype Phase)

### Infrastructure Costs (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| Custom Domain | - | $12/year |
| Sentry | Developer | $0 |
| **Total** | | **~$1/month** |

### Development Costs (12 weeks)

| Role | Hours/Week | Rate | Total |
|------|------------|------|-------|
| Full-Stack Developer | 40 | $50-100 | $24,000-48,000 |
| UI/UX Designer | 10 | $50-80 | $6,000-9,600 |
| Content Creator | 5 | $30-50 | $1,800-3,000 |
| **Total** | | | **$31,800-60,600** |

**Note:** Costs vary significantly based on:
- In-house vs. outsourced
- Junior vs. senior developers
- Location (US, Europe, Asia)
- Part-time vs. full-time

### Alternative: No-Code/Low-Code (Faster but Limited)
- **Bubble.io** - Visual programming (~4-6 weeks)
- **FlutterFlow** - Mobile app builder (~6-8 weeks)
- **Webflow** + **Supabase** - Hybrid approach (~5-7 weeks)

**Pros:** Faster, cheaper initial build  
**Cons:** Limited customization, scalability concerns

---

## 🧪 Testing Plan

### User Testing Protocol

#### Recruitment (10-20 families)
- Mix of demographics (age, family size)
- Tech-savvy and non-tech-savvy
- Urban and rural locations
- Incentivize with free premium access

#### Testing Scenarios
1. **Registration & Onboarding** (15 min)
   - Sign up with email
   - Complete 5-step onboarding
   - Add first child profile

2. **Family Management** (10 min)
   - Invite family member
   - Accept invitation (as grandparent)
   - Manage child profiles

3. **Messaging** (10 min)
   - Send first message
   - Share a photo
   - Receive notification

4. **Educational Resources** (15 min)
   - Browse pre-school activities
   - Bookmark an article
   - Provide feedback

5. **Settings** (5 min)
   - Toggle dark mode
   - Update notification preferences
   - Edit profile

#### Metrics to Track
- **Task Completion Rate** (should be > 90%)
- **Time on Task** (vs. expected time)
- **Error Rate** (form errors, navigation mistakes)
- **System Usability Scale (SUS)** score (target > 70)
- **Net Promoter Score (NPS)** (target > 30)

#### Feedback Collection
- Post-task surveys
- Exit interviews (30 min)
- Session recordings (Hotjar)
- Feature requests logging

---

## 📊 Success Criteria (Prototype)

### Technical
- ✅ All MVP features functional
- ✅ 99% uptime during testing
- ✅ Page load < 2 seconds
- ✅ Zero critical bugs
- ✅ Mobile responsive

### User Experience
- ✅ SUS score > 70
- ✅ NPS > 30
- ✅ Task completion rate > 90%
- ✅ 80% would recommend to friends

### Business
- ✅ Positive stakeholder feedback
- ✅ Clear path to monetization validated
- ✅ Beta user retention > 60%
- ✅ Development cost within budget

---

## 🔄 Post-Prototype Next Steps

### If Successful (Proceed to Full Development)
1. **Incorporate feedback** from beta testing
2. **Finalize design** based on user preferences
3. **Plan Phase 2 features** (see APP_SPECIFICATIONS.md)
4. **Hire development team** if needed
5. **Secure funding** if required
6. **Start mobile app development**
7. **Prepare marketing strategy**

### If Needs Iteration
1. **Analyze feedback** - What didn't work?
2. **Prioritize changes** - Critical vs. nice-to-have
3. **Redesign/rebuild** problem areas
4. **Re-test** with same or new users
5. **Iterate** until success criteria met

### If Pivot Required
1. **Conduct user interviews** - Deep dive into needs
2. **Analyze competition** - What are they doing right?
3. **Brainstorm alternatives** - Different approach?
4. **Create new prototype** - Test new concept
5. **Validate again** - Smaller, faster tests

---

## 📋 Cleanup Execution Plan

### Before Starting Development

Run these PowerShell commands to clean up the folder:

```powershell
# Navigate to project
cd "\\192.168.2.31\Datalake\Code\NEMA\MeLorAly\MeLorAly\Onboarding\Données.stitch"

# 1. DELETE DUPLICATE FOLDERS
Remove-Item -Recurse -Force "a.propos.de.nous\stitch_accueil_familiale 6"
Remove-Item -Recurse -Force "accueil.familiale\stitch_accueil_familiale"
Remove-Item -Recurse -Force "ajouter.un.membre\stitch_accueil_familiale 3"

# 2. DELETE ALL ZIP FILES (28 files)
Get-ChildItem -Recurse -Filter "*.zip" | Remove-Item -Force

# 3. DELETE DUPLICATE SCREENSHOTS (keep SCREEN folder)
Get-ChildItem -Recurse -Path ".\*" -Include "*.png" -Exclude "SCREEN" | 
  Where-Object { $_.DirectoryName -notlike "*SCREEN*" } | 
  Remove-Item -Force

# 4. CREATE BACKUP BEFORE CLEANUP (RECOMMENDED!)
cd "\\192.168.2.31\Datalake\Code\NEMA\MeLorAly"
Compress-Archive -Path ".\MeLorAly" -DestinationPath ".\MeLorAly_BACKUP_$(Get-Date -Format 'yyyyMMdd').zip"
```

### After Cleanup
- Verify all unique HTML files remain
- Confirm SCREEN folder has all screenshots
- Check total size reduction (~10-12 MB)
- Document cleanup in Git commit

---

## 🎓 Learning Resources for Team

### Next.js
- [Official Docs](https://nextjs.org/docs)
- [Next.js 14 Tutorial](https://www.youtube.com/watch?v=wm5gMKuwSYk)

### Supabase
- [Official Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Tailwind CSS
- [Official Docs](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/) (premium components)

### React Best Practices
- [React Docs (Beta)](https://react.dev/)
- [Patterns.dev](https://www.patterns.dev/)

---

## ✅ Pre-Development Checklist

Before writing the first line of code:

- [ ] Stakeholders reviewed CLEANUP_ANALYSIS.md
- [ ] Stakeholders approved APP_SPECIFICATIONS.md
- [ ] This PROTOTYPE_PLAN.md is approved
- [ ] Budget allocated and approved
- [ ] Team assembled (developers, designer, content creator)
- [ ] Cleanup executed successfully
- [ ] Supabase account created
- [ ] Vercel account created
- [ ] Domain name registered (if needed)
- [ ] Development environment set up
- [ ] Git repository created
- [ ] Project kickoff meeting scheduled

---

**Document Status:** Ready for Review  
**Next Action:** Stakeholder approval to proceed with cleanup and development

---

## 🤝 Questions for Stakeholders

1. **Timeline:** Is 12 weeks acceptable, or do we need faster delivery?
2. **Budget:** What is the approved development budget?
3. **Team:** In-house development or outsource? Part-time or full-time?
4. **Tech Stack:** Approve Next.js + Supabase or different preference?
5. **Home Screen:** Which of the 3-4 variants should we use?
6. **Content:** Who will create educational resources and articles?
7. **Testing:** Can you help recruit beta testing families?
8. **Legal:** Do we need legal review for privacy/child protection policies?
9. **Monetization:** Should prototype include payment integration?
10. **Excel Spec:** Should we review the SPEC file together for additional requirements?

---

**Ready to build! 🚀**
