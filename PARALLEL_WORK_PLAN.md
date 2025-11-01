# 🚀 Parallel Work Plan - Week 1 Implementation
**Date:** November 1, 2025  
**Goal:** Complete Onboarding Backend + Security Hardening  
**Team:** 2 Agents working in parallel

---

## 📋 Work Distribution Strategy

### 🔵 AGENT A (Primary) - Onboarding Flow Expert
**Focus:** Backend logic, data persistence, form integration

### 🟢 AGENT B (Secondary) - Security & Infrastructure Expert  
**Focus:** Security middleware, validation, documentation

---

## ⚡ Parallel Execution Plan

### PHASE 1: Independent Setup (Can run simultaneously)

#### 🔵 AGENT A - Start Immediately
```
Task #1: Onboarding Backend Logic (2-3 hours)
├── File: MeLorAly/app/routes/onboarding.js
├── Action: Add POST routes
│   ├── POST /onboarding/children
│   ├── POST /onboarding/adults  
│   └── POST /onboarding/family-space
├── Implementation:
│   ├── Use req.session.onboarding = {} to store state
│   ├── Add error handling with try/catch
│   ├── Redirect to next step on success
│   └── Redirect back with errors on failure
└── Dependencies: NONE - can start now
```

**Code Pattern:**
```javascript
// Example for POST /onboarding/children
router.post('/children', (req, res) => {
  try {
    if (!req.session.onboarding) {
      req.session.onboarding = {};
    }
    
    // Store children data in session
    req.session.onboarding.children = req.body.children; // Array of {name, birthDate, grade}
    
    // Redirect to next step
    res.redirect('/onboarding/adults');
  } catch (error) {
    console.error('Error saving children:', error);
    req.flash('error', 'Erreur lors de l\'enregistrement des enfants');
    res.redirect('/onboarding/children');
  }
});
```

---

#### 🟢 AGENT B - Start Immediately (PARALLEL)
```
Task #2: Security Dependencies & Config (1-2 hours)
├── Action: Install packages
│   └── Run: npm install helmet express-rate-limit
├── File: MeLorAly/app/server.js
├── Implementation:
│   ├── Import helmet and express-rate-limit
│   ├── Add helmet() middleware (after body-parser, before routes)
│   ├── Add rate limiter to /auth routes
│   └── Configure rate limits: 5 attempts per 15 minutes
├── File: MeLorAly/.env.example (CREATE)
│   └── Document: NODE_ENV, PORT, SUPABASE_URL, SUPABASE_KEY
└── Dependencies: NONE - can start now
```

**Code Pattern:**
```javascript
// In server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Add after session middleware
app.use(helmet());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Trop de tentatives, veuillez réessayer plus tard'
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

---

### PHASE 2: Dependent Tasks (Agent A continues, Agent B starts new parallel work)

#### 🔵 AGENT A - After Task #1
```
Task #3: Onboarding Supabase Integration (2-3 hours)
├── File: MeLorAly/app/routes/onboarding.js
├── Action: Add database persistence to /ready route
├── Implementation:
│   ├── Read data from req.session.onboarding
│   ├── Insert children to 'children' table
│   ├── Create family in 'families' table
│   ├── Send invitations to 'invitations' table
│   ├── Update user profile (onboarding_completed = true)
│   └── Clear session data
├── Dependencies: REQUIRES Task #1 (session structure)
└── Blocker: Agent B can work on Task #4 during this
```

**Code Pattern:**
```javascript
router.get('/ready', requireAuth, async (req, res) => {
  try {
    const onboardingData = req.session.onboarding;
    
    if (!onboardingData) {
      return res.redirect('/onboarding/welcome');
    }
    
    // 1. Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name: onboardingData.familyName,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (familyError) throw familyError;
    
    // 2. Insert children
    const childrenToInsert = onboardingData.children.map(child => ({
      family_id: family.id,
      name: child.name,
      birth_date: child.birthDate,
      grade: child.grade
    }));
    
    await supabase.from('children').insert(childrenToInsert);
    
    // 3. Send invitations
    // ... similar pattern
    
    // 4. Mark onboarding complete
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', req.user.id);
    
    // Clear session
    delete req.session.onboarding;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Onboarding error:', error);
    res.redirect('/onboarding/welcome');
  }
});
```

---

#### 🟢 AGENT B - After Task #2 (PARALLEL with Agent A's Task #3)
```
Task #4: Input Validation Setup (2 hours)
├── File: MeLorAly/app/middleware/validators.js (CREATE)
├── Action: Create validation middleware
├── Implementation:
│   ├── Import express-validator
│   ├── Create childrenValidator (array validation)
│   ├── Create adultsValidator (email validation)
│   ├── Create familySpaceValidator (name validation)
│   └── Export all validators
├── Dependencies: NONE - can start after Task #2
└── Note: Agent A will wire these up later
```

**Code Pattern:**
```javascript
// middleware/validators.js
const { body, validationResult } = require('express-validator');

const childrenValidator = [
  body('children').isArray({ min: 1 }).withMessage('Au moins un enfant requis'),
  body('children.*.name').notEmpty().trim().withMessage('Nom requis'),
  body('children.*.birthDate').isDate().withMessage('Date de naissance invalide'),
  body('children.*.grade').optional().isString()
];

const adultsValidator = [
  body('adults').optional().isArray(),
  body('adults.*.email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('adults.*.role').isIn(['parent', 'grandparent']).withMessage('Rôle invalide')
];

const familySpaceValidator = [
  body('familyName').notEmpty().trim().isLength({ min: 2, max: 100 })
    .withMessage('Nom de famille requis (2-100 caractères)')
];

module.exports = {
  childrenValidator,
  adultsValidator,
  familySpaceValidator
};
```

---

### PHASE 3: Integration (Agent A continues, Agent B adds CSRF)

#### 🔵 AGENT A - After Task #3
```
Task #5: Update Onboarding Views (1-2 hours)
├── Files: 
│   ├── MeLorAly/app/views/onboarding/children.ejs
│   ├── MeLorAly/app/views/onboarding/adults.ejs
│   └── MeLorAly/app/views/onboarding/family-space.ejs
├── Action: Convert to proper forms
├── Implementation:
│   ├── Add <form method="POST" action="/onboarding/children">
│   ├── Add proper name attributes to inputs
│   ├── Add error display section
│   └── Keep existing styling/structure
├── Dependencies: REQUIRES Task #1 (routes exist)
└── Note: Will add CSRF tokens later (Agent B Task #6)
```

**Pattern for children.ejs:**
```html
<form method="POST" action="/onboarding/children">
  <% if (locals.errors && errors.length > 0) { %>
    <div class="alert alert-danger">
      <ul>
        <% errors.forEach(error => { %>
          <li><%= error.msg %></li>
        <% }); %>
      </ul>
    </div>
  <% } %>
  
  <!-- Existing form fields with proper names -->
  <input type="text" name="children[0][name]" required>
  <input type="date" name="children[0][birthDate]" required>
  <select name="children[0][grade]">...</select>
  
  <button type="submit">Continuer</button>
</form>
```

---

#### 🟢 AGENT B - After Task #4 (PARALLEL with Agent A's Task #5)
```
Task #6: CSRF Protection Implementation (2 hours)
├── Action: Install and configure CSRF
│   └── Run: npm install csurf
├── File: MeLorAly/app/server.js
├── Implementation:
│   ├── Import csurf
│   ├── Add csrf middleware (after session)
│   ├── Add error handler for CSRF failures
│   └── Add res.locals.csrfToken in middleware
├── File: MeLorAly/app/views/layout.ejs
│   └── Add <meta name="csrf-token" content="<%= csrfToken %>">
├── Update ALL forms to include CSRF token
├── Dependencies: NONE - independent
└── Coordination: Will touch same view files as Agent A
```

**Code Pattern:**
```javascript
// In server.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false }); // Use session

app.use(csrfProtection);

// Make token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Jeton CSRF invalide');
  }
  next(err);
});
```

**In forms:**
```html
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

---

### PHASE 4: Final Integration

#### 🔵 AGENT A - After Task #5
```
Task #7: Wire Validators to Routes (30 min)
├── File: MeLorAly/app/routes/onboarding.js
├── Action: Import validators and add to routes
├── Implementation:
│   ├── Import from middleware/validators.js
│   ├── Add validation middleware to POST routes
│   ├── Add validationResult error handling
│   └── Pass errors to views
├── Dependencies: REQUIRES Task #4 (validators exist)
└── This is quick - just wire existing pieces
```

**Code Pattern:**
```javascript
const { childrenValidator, adultsValidator, familySpaceValidator } = require('../middleware/validators');
const { validationResult } = require('express-validator');

router.post('/children', childrenValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('onboarding/children', { 
      errors: errors.array(),
      formData: req.body 
    });
  }
  
  // ... rest of logic from Task #1
});
```

---

#### 🟢 AGENT B - After Task #6
```
Task #8: Environment Variables Migration (30 min)
├── File: MeLorAly/app/server.js
├── Action: Move SESSION_SECRET to .env
├── Implementation:
│   ├── Remove hardcoded secret from server.js
│   ├── Use process.env.SESSION_SECRET
│   ├── Add validation (throw error if missing)
│   └── Update .env.example
├── Dependencies: Can do after Agent A finishes backend work
└── Low risk - final cleanup task
```

**Code Pattern:**
```javascript
// In server.js - BEFORE app.use(session(...))
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in .env file');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  // ... rest of config
}));
```

**.env.example:**
```env
# Server Configuration
NODE_ENV=development
PORT=3012
SESSION_SECRET=your-random-64-character-string-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

---

### PHASE 5: Testing & Documentation

#### 🧪 BOTH AGENTS - Task #9
```
Integration Testing (1-2 hours each, parallel)

🔵 AGENT A: Functional Testing
├── Test user flow:
│   1. Register new account
│   2. Complete onboarding (all 5 steps)
│   3. Verify data in Supabase
│   4. Check dashboard shows correct data
├── Test error cases:
│   ├── Invalid child data
│   ├── Invalid email addresses
│   └── Session expiration
└── Document issues in testing-notes.md

🟢 AGENT B: Security Testing
├── Test security features:
│   1. Verify helmet headers (use browser DevTools)
│   2. Test rate limiting (make 6+ login attempts)
│   3. Test CSRF protection (submit form without token)
│   4. Check .env file is not committed
├── Verify:
│   ├── No secrets in code
│   ├── All forms have CSRF tokens
│   └── Rate limits work on auth routes
└── Document findings in security-audit.md
```

---

#### 📝 AGENT B - Task #10 (Can do anytime during gaps)
```
Create API_ROUTES.md (3-4 hours total, can be done in chunks)
├── Document all 31+ routes:
│   ├── Method (GET/POST)
│   ├── Path
│   ├── Auth required?
│   ├── Request body/params
│   ├── Response (render or redirect)
│   └── Example usage
├── Can work on this during waits
└── Low priority but valuable documentation
```

**Template:**
```markdown
## Authentication Routes

### POST /auth/login
- **Auth Required:** No
- **Request Body:** 
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** Redirect to /dashboard on success, /auth/login with error on failure
- **Validation:** Email format, password min 6 characters
```

---

## 🎯 Success Criteria

### Must Complete
- ✅ Users can complete full onboarding (all 5 steps save data)
- ✅ Onboarding data persists to Supabase
- ✅ Input validation works (prevents bad data)
- ✅ CSRF protection active on all forms
- ✅ Rate limiting active on auth routes
- ✅ Helmet security headers present
- ✅ No secrets in code (all in .env)

### Nice to Have
- ⚠️ API_ROUTES.md complete
- ⚠️ Testing documentation
- ⚠️ Error messages in French

---

## 📊 Time Estimates

| Agent | Tasks | Est. Time | Can Parallelize? |
|-------|-------|-----------|------------------|
| **Agent A** | #1, #3, #5, #7 | 6-8 hours | Mostly sequential |
| **Agent B** | #2, #4, #6, #8, #10 | 6-9 hours | Fully parallel |
| **Both** | #9 (Testing) | 2-3 hours | Parallel testing |

**Total Calendar Time (with parallelization):** 8-11 hours (vs 14-20 hours sequential)  
**Target Completion:** End of Day 1 or Day 2

---

## 🚨 Coordination Points

### Avoid Conflicts
1. **Agent A owns:** routes/onboarding.js (entire file)
2. **Agent B owns:** server.js (for middleware)
3. **Shared files:** Views (coordinate timing)

### Communication Protocol
- **Agent A:** Comment when Task #1 complete → Agent B can start Task #7
- **Agent A:** Comment when Task #3 complete → Agent B can start Task #8
- **Agent B:** Comment when Task #6 complete → Agent A can add CSRF tokens to forms

### Merge Order
1. Agent B commits: server.js, middleware/validators.js, .env.example
2. Agent A commits: routes/onboarding.js  
3. Either agent: Update views (or coordinate to avoid conflicts)

---

## 🎬 Ready to Start!

**Agent A:** Start with Task #1 (Onboarding Backend Logic)  
**Agent B:** Start with Task #2 (Security Dependencies & Config)

Both agents can work simultaneously with zero conflicts! 🚀
