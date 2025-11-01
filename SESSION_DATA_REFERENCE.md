# 📚 Onboarding Session Data Reference

**Purpose:** Quick reference for developers working with onboarding session data  
**Location:** `req.session.onboarding`  
**Lifecycle:** Created on first POST, deleted on completion

---

## 📦 Session Structure

```javascript
req.session.onboarding = {
  children: [
    {
      name: String,      // Full name (combined first + last)
      birthDate: String, // ISO date format "YYYY-MM-DD"
      grade: String      // Optional school grade
    }
  ],
  adults: [
    {
      email: String,     // Normalized lowercase email
      role: String,      // "parent" | "grandparent"
      name: String       // Optional full name (currently null)
    }
  ],
  familySpace: {
    name: String,        // Family name (required, 2-100 chars)
    description: String  // Optional description
  }
}
```

---

## 🔄 Session Lifecycle

### 1. Creation (First POST)
```javascript
// Any POST route
if (!req.session.onboarding) {
  req.session.onboarding = {};
}
```

### 2. Population (Each Step)
```javascript
// POST /onboarding/children
req.session.onboarding.children = [...];

// POST /onboarding/adults
req.session.onboarding.adults = [...];

// POST /onboarding/family-space
req.session.onboarding.familySpace = {...};
```

### 3. Persistence (GET /ready)
```javascript
// Read all data
const data = req.session.onboarding;

// Persist to database
await persistToSupabase(data);

// Clear session
delete req.session.onboarding;
```

---

## 📊 Database Mapping

### Session → Supabase Tables

```javascript
// families table
{
  id: uuid (auto),
  name: session.familySpace.name,
  description: session.familySpace.description,
  created_by: user.id,
  created_at: timestamp (auto)
}

// family_members table
{
  family_id: families.id,
  user_id: user.id,
  role: 'admin', // Creator is always admin
  joined_at: timestamp (auto)
}

// children table (array insert)
session.children.map(child => ({
  family_id: families.id,
  name: child.name,
  birth_date: child.birthDate,
  grade: child.grade,
  created_at: timestamp (auto)
}))

// invitations table (array insert)
session.adults.map(adult => ({
  family_id: families.id,
  email: adult.email,
  role: adult.role,
  invited_by: user.id,
  status: 'pending',
  expires_at: now() + 7 days,
  created_at: timestamp (auto)
}))

// profiles table (update)
{
  onboarding_completed: true
}
```

---

## 🎨 Form Field Mapping

### Children Form (children.ejs)
```html
<!-- Hidden inputs created by JavaScript -->
<input type="hidden" name="children[0][name]" value="Jean Dupont">
<input type="hidden" name="children[0][birthDate]" value="2015-03-15">
<input type="hidden" name="children[0][grade]" value="">

<input type="hidden" name="children[1][name]" value="Marie Dupont">
<input type="hidden" name="children[1][birthDate]" value="2018-07-22">
<input type="hidden" name="children[1][grade]" value="">
```

**Backend receives:**
```javascript
req.body.children = [
  { name: "Jean Dupont", birthDate: "2015-03-15", grade: "" },
  { name: "Marie Dupont", birthDate: "2018-07-22", grade: "" }
]
```

### Adults Form (adults.ejs)
```html
<!-- Hidden inputs created by JavaScript -->
<input type="hidden" name="adults[0][email]" value="grandpa@example.com">
<input type="hidden" name="adults[0][role]" value="grandparent">
<input type="hidden" name="adults[0][name]" value="">
```

**Backend receives:**
```javascript
req.body.adults = [
  { email: "grandpa@example.com", role: "grandparent", name: "" }
]
```

### Family Space Form (family-space.ejs)
```html
<!-- Standard form inputs -->
<input type="text" name="familyName" value="Famille Dupont">
<textarea name="familyDescription">Notre belle famille!</textarea>
```

**Backend receives:**
```javascript
req.body = {
  familyName: "Famille Dupont",
  familyDescription: "Notre belle famille!"
}
```

---

## 🔍 Debugging Session Data

### Method 1: Console Logging
```javascript
// In any route
console.log('Session Data:', JSON.stringify(req.session.onboarding, null, 2));
```

### Method 2: Debug Middleware
```javascript
// Use middleware/debug-onboarding.js
const { debugOnboardingSession } = require('../middleware/debug-onboarding');

router.post('/children', debugOnboardingSession, (req, res) => {
  // Session data will be logged automatically
});
```

### Method 3: Browser DevTools
```javascript
// In view JavaScript
console.log('Children:', children);
console.log('Adults:', invited);
```

---

## ⚠️ Common Issues

### Issue 1: Session Not Persisting
**Symptom:** Data disappears between steps  
**Cause:** Session middleware not configured or cookies disabled  
**Fix:** Check `server.js` session config

### Issue 2: Empty Arrays
**Symptom:** `req.body.children` is undefined  
**Cause:** Form inputs not created or no children added  
**Fix:** Validate array exists before processing:
```javascript
const children = [];
if (Array.isArray(req.body.children)) {
  req.body.children.forEach(child => {
    if (child.name && child.birthDate) {
      children.push(child);
    }
  });
}
```

### Issue 3: User ID Missing
**Symptom:** `req.session.user.id` is undefined  
**Cause:** User not logged in or session expired  
**Fix:** Use `requireAuth` middleware

---

## 🧪 Testing Session Data

### Test Case 1: Single Child
```javascript
POST /onboarding/children
{
  children: [{
    name: "Test Child",
    birthDate: "2020-01-01",
    grade: null
  }]
}

Expected Session:
{
  children: [{
    name: "Test Child",
    birthDate: "2020-01-01",
    grade: null
  }]
}
```

### Test Case 2: Multiple Children
```javascript
POST /onboarding/children
{
  children: [
    { name: "Child 1", birthDate: "2015-03-15", grade: null },
    { name: "Child 2", birthDate: "2018-07-22", grade: null }
  ]
}

Expected Session:
{
  children: [
    { name: "Child 1", birthDate: "2015-03-15", grade: null },
    { name: "Child 2", birthDate: "2018-07-22", grade: null }
  ]
}
```

### Test Case 3: Skip Adults
```javascript
POST /onboarding/adults
{
  adults: []  // Empty array
}

Expected Session:
{
  children: [...],
  adults: []  // Stored as empty array
}
```

### Test Case 4: Complete Flow
```javascript
After all steps:
{
  children: [{...}],
  adults: [{...}],
  familySpace: { name: "...", description: "..." }
}

After GET /ready:
undefined  // Session cleared
```

---

## 📝 Validation Rules

### Children (will be enforced in Task #7)
- ✅ Array must have at least 1 item
- ✅ Each child must have `name` (string, not empty)
- ✅ Each child must have `birthDate` (valid ISO date)
- ⚠️ `grade` is optional

### Adults (will be enforced in Task #7)
- ✅ Array can be empty (invitations optional)
- ✅ Each adult must have `email` (valid email format)
- ✅ Each adult must have `role` (either "parent" or "grandparent")
- ⚠️ `name` is optional

### Family Space (will be enforced in Task #7)
- ✅ `familyName` required (string, 2-100 characters)
- ⚠️ `familyDescription` optional

---

## 🚀 Quick Commands

### Check session in route:
```javascript
if (!req.session.onboarding) {
  console.log('No onboarding session');
} else {
  console.log('Steps completed:', Object.keys(req.session.onboarding));
}
```

### Clear session manually:
```javascript
delete req.session.onboarding;
```

### Pre-populate form:
```javascript
res.render('onboarding/children', {
  formData: req.session.onboarding?.children || []
});
```

---

**Last Updated:** November 1, 2025  
**Version:** 1.0 (Post Task #1, #3, #5)  
**Next Update:** After Task #7 (validators added)
