# 🔍 CSRF Test Failures - Investigation Report

**Date:** November 5, 2025  
**Issue:** 3 tests failing - expecting 500 CSRF errors, getting 302 redirects

---

## 📋 Test Failures Summary

### Failing Tests:
1. `POST /education/activity/:id/complete` - Expected 500, got 302
2. `POST /notifications/:id/read` - Expected 500, got 302  
3. `POST /notifications/mark-all` - Expected 500, got 302

---

## 🐛 Root Cause

### **Middleware Order Problem**

Current flow for unauthenticated requests:
```
Request → requireAuth → [REDIRECT 302 to /auth/login] → CSRF never reached
```

Expected test flow:
```
Request → CSRF validation → [500 CSRF error]
```

### **Current Implementation Issues**

#### 1. **Notifications Routes** (`routes/notifications.js`)
```javascript
router.use(requireAuth);  // ❌ Auth BEFORE CSRF

router.post('/:id/read', async (req, res) => {
  // NO CSRF PROTECTION AT ALL
});

router.post('/mark-all', async (req, res) => {
  // NO CSRF PROTECTION AT ALL
});
```
**Problem:** 
- No CSRF middleware on notifications POST routes
- Auth middleware redirects before CSRF can be checked

#### 2. **Education Routes** (`routes/education.js`)
```javascript
const csrfProtection = csrf({ cookie: false });
router.use(requireAuth);  // ❌ Auth BEFORE CSRF

router.post('/activity/:id/complete', csrfProtection, async (req, res) => {
  // CSRF is here but auth checked first
});
```
**Problem:**
- CSRF exists but comes AFTER auth redirect
- Unauthenticated requests never reach CSRF validation

---

## 🎯 Why This Matters (Security Impact)

### **Current Vulnerabilities:**

1. **Notifications** - COMPLETELY UNPROTECTED
   - ❌ No CSRF tokens required
   - ❌ Vulnerable to cross-site POST attacks
   - ⚠️ Attacker could mark notifications read/unread while user is logged in

2. **Education Activity Completion** - CSRF exists but tests reveal logic flaw
   - ✅ CSRF protection present
   - ⚠️ But middleware order suggests unclear security model

### **Real-World Attack Scenario:**

```html
<!-- Malicious site visited by logged-in MeLorAly user -->
<form action="https://meloraly.com/notifications/mark-all" method="POST">
  <input type="submit" value="Click for free stuff!">
</form>
<script>document.forms[0].submit();</script>
```

**Result:** All user's notifications marked as read without consent (no CSRF token required!)

---

## ✅ Correct Design Patterns

### **Option A: CSRF Before Auth (Public endpoints)**
For endpoints that should validate CSRF even for unauthenticated users:
```javascript
router.post('/some-endpoint', csrfProtection, requireAuth, async (req, res) => {
  // CSRF checked first, then auth
});
```
**Use when:** Forms accessible to non-logged-in users (e.g., login, register)

### **Option B: Auth Before CSRF (Protected endpoints)**
For endpoints only accessible when authenticated:
```javascript
router.post('/some-endpoint', requireAuth, csrfProtection, async (req, res) => {
  // Auth checked first, then CSRF
});
```
**Use when:** API endpoints only for authenticated users

### **Option C: Combined Middleware (Recommended for this project)**
```javascript
// In server.js
app.use('/notifications', csrfProtection, setCsrfToken, requireAuth, notificationsRoutes);
```
**Why best:** Clear, centralized, consistent across all routes

---

## 🛠️ Recommended Fixes

### **Priority 1: Fix Notifications (HIGH RISK)**

#### Current (server.js):
```javascript
app.use('/notifications', notificationsRoutes);
```

#### Fixed:
```javascript
app.use('/notifications', csrfProtection, setCsrfToken, requireAuth, notificationsRoutes);
```

### **Priority 2: Standardize Education Routes**

#### Current:
- CSRF defined inside route file
- Inconsistent with other routes
- Causes test confusion

#### Fixed (server.js):
```javascript
app.use('/education', csrfProtection, setCsrfToken, requireAuth, educationRoutes);
```

#### Then remove from routes/education.js:
```javascript
// DELETE these lines:
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });
const setCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

// And remove from individual routes:
router.get('/', async (req, res) => {  // Remove csrfProtection here
router.post('/activity/:id/complete', async (req, res) => {  // And here
```

### **Priority 3: Fix Tests**

The tests are **actually correct** - they're exposing the security gap!

#### Current test assumption:
```javascript
it('should reject without CSRF token', (done) => {
  request(app)
    .post('/notifications/123/read')
    .expect(500)  // Expects CSRF error
    .end(done);
});
```

#### Two options:

**Option A:** Fix routes, keep test (RECOMMENDED)
- Add CSRF protection to routes
- Tests will pass as-is

**Option B:** Update tests to match current (insecure) behavior
```javascript
it('should redirect to login when not authenticated', (done) => {
  request(app)
    .post('/notifications/123/read')
    .expect(302)  // Redirects instead
    .end(done);
});
```
⚠️ **Don't do this** - it hides the security problem!

---

## 📊 Complete Audit: CSRF Coverage

| Route | CSRF Protected? | Auth Protected? | Status |
|-------|----------------|-----------------|--------|
| `/auth/login` | ❌ | No | ⚠️ Should add |
| `/auth/register` | ❌ | No | ⚠️ Should add |
| `/onboarding/*` | ✅ | ✅ | ✅ Good |
| `/education/*` | ✅ (internal) | ✅ | ⚠️ Move to server.js |
| `/notifications/*` | ❌ | ✅ | ❌ **CRITICAL** |
| `/family/*` | ❌ | ✅ | ❌ **CRITICAL** |
| `/children/*` | ❌ | ✅ | ❌ **CRITICAL** |
| `/profile/*` | ❌ | ✅ | ❌ **CRITICAL** |
| `/messages/*` | ❌ | ✅ | ❌ **CRITICAL** |

**Summary:** 6 out of 9 route groups lack CSRF protection! 🚨

---

## 🎯 Action Plan (Recommended Order)

### **Immediate (Security Critical - 30 min)**
1. ✅ Add CSRF to `/notifications` 
2. ✅ Add CSRF to `/family`
3. ✅ Add CSRF to `/children`
4. ✅ Add CSRF to `/profile`
5. ✅ Add CSRF to `/messages`

### **Short-term (Security Best Practice - 1 hour)**
6. ✅ Add CSRF to `/auth` routes
7. ✅ Standardize `/education` CSRF application
8. ✅ Add CSRF tokens to all forms

### **Validation (Confirm fixes - 15 min)**
9. ✅ Run tests - should all pass
10. ✅ Manual testing of forms
11. ✅ Check browser console for CSRF errors

---

## 💡 Key Insights from This Investigation

### **What the Tests Taught Us:**

1. **Tests were RIGHT, code was WRONG**
   - Tests expected CSRF protection
   - Code didn't have it
   - This is **security debt**

2. **Middleware order matters**
   - `requireAuth` before CSRF = redirects bypass CSRF
   - CSRF before `requireAuth` = proper validation

3. **Partial implementation is dangerous**
   - Having CSRF on `/onboarding` but not `/notifications` creates false security
   - Users assume protection is consistent

### **Why This Wasn't Caught Earlier:**

- ❌ Manual testing only (logged in users pass auth)
- ❌ No automated security scanning
- ❌ Tests were written but not run regularly
- ✅ **Running tests exposed the gap** 👏

---

## 🚀 Implementation Guide

### **Step 1: Update server.js**

```javascript
// Add CSRF protection to all authenticated routes
app.use('/auth', csrfProtection, setCsrfToken, authRoutes);
app.use('/dashboard', csrfProtection, setCsrfToken, requireAuth, dashboardRoutes);
app.use('/family', csrfProtection, setCsrfToken, requireAuth, familyRoutes);
app.use('/children', csrfProtection, setCsrfToken, requireAuth, childrenRoutes);
app.use('/onboarding', csrfProtection, setCsrfToken, requireAuth, onboardingRoutes);
app.use('/messages', csrfProtection, setCsrfToken, requireAuth, messagesRoutes);
app.use('/education', csrfProtection, setCsrfToken, requireAuth, educationRoutes);
app.use('/profile', csrfProtection, setCsrfToken, requireAuth, profileRoutes);
app.use('/notifications', csrfProtection, setCsrfToken, requireAuth, notificationsRoutes);
```

### **Step 2: Clean up education.js**

Remove duplicate CSRF setup from `routes/education.js`:
- Lines 3, 17-24 (CSRF imports and middleware definitions)
- Remove `csrfProtection, setCsrfToken` from individual routes

### **Step 3: Add CSRF tokens to forms**

Add to any forms missing it:
```html
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

### **Step 4: Add CSRF headers to fetch calls**

For AJAX requests:
```javascript
headers: {
  'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
}
```

### **Step 5: Run tests**

```bash
npm test
```

Expected: **All tests pass** ✅

---

## 📚 References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Express CSURF Documentation](https://github.com/expressjs/csurf)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

## ✅ Conclusion

**The failing tests are a GIFT** 🎁

They revealed:
- Missing CSRF protection on 6 route groups
- Middleware ordering issues
- Security assumptions vs. reality gap

**Next Steps:**
1. Implement fixes (30-60 min)
2. Verify tests pass
3. Consider this a lesson in test-driven security

---

*"The best time to add security was at the start. The second best time is now."*
