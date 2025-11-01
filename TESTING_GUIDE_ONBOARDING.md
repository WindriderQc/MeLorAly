# 🧪 Testing Guide - Onboarding Flow

**Date:** November 1, 2025  
**Feature:** Complete onboarding backend integration  
**Status:** ✅ Ready for testing (Tasks #1, #3, #5 complete)

---

## 🎯 Test Scenario: New User Onboarding

### Prerequisites
- ✅ Server running on http://localhost:3012
- ✅ Supabase database configured
- ✅ .env file with valid credentials

---

## 📝 Manual Test Steps

### Step 1: Registration
1. Navigate to http://localhost:3012/auth/register
2. Fill in registration form:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Full Name: `Test User`
3. Submit form
4. **Expected:** Redirect to login or email verification

### Step 2: Login
1. Navigate to http://localhost:3012/auth/login
2. Login with credentials from Step 1
3. **Expected:** Redirect to `/onboarding/welcome` (if first login)

### Step 3: Onboarding - Welcome
1. **URL:** http://localhost:3012/onboarding/welcome
2. Click "Commencer" button
3. **Expected:** Redirect to `/onboarding/children`

### Step 4: Onboarding - Children
1. **URL:** http://localhost:3012/onboarding/children
2. Add at least one child:
   - Prénom: `Jean`
   - Nom: `Dupont`
   - Date de naissance: `2015-03-15`
3. Click "Ajouter cet enfant"
4. Verify child appears in list
5. Click "Continuer" button
6. **Expected:** 
   - Form submits to POST `/onboarding/children`
   - Data stored in session
   - Redirect to `/onboarding/adults`

**Test Data Validation:**
- Try submitting without adding a child → Should show error
- Add multiple children → All should be stored

### Step 5: Onboarding - Adults (Invitations)
1. **URL:** http://localhost:3012/onboarding/adults
2. **Option A:** Skip invitations (click "Continuer")
   - **Expected:** Redirect to `/onboarding/family-space`
3. **Option B:** Add invitations:
   - Click "Par email" button
   - Email: `grandpa@example.com`
   - Rôle: `Grand-parent`
   - Click "Ajouter cette invitation"
   - Verify invitation appears in list
   - Click "Continuer"
   - **Expected:** 
     - Form submits to POST `/onboarding/adults`
     - Data stored in session
     - Redirect to `/onboarding/family-space`

### Step 6: Onboarding - Family Space
1. **URL:** http://localhost:3012/onboarding/family-space
2. Fill in family details:
   - Nom de la famille: `Famille Dupont`
   - Description: `Notre belle famille!` (optional)
3. Verify live preview updates
4. Click "Continuer" button
5. **Expected:**
   - Form submits to POST `/onboarding/family-space`
   - Data stored in session
   - Redirect to `/onboarding/ready`

**Test Validation:**
- Try submitting with family name < 2 characters → Should show error
- Try with valid name → Should succeed

### Step 7: Onboarding - Ready (Data Persistence)
1. **URL:** http://localhost:3012/onboarding/ready
2. **Backend Process (automatic):**
   - GET request triggers data persistence
   - Creates family in `families` table
   - Adds user as admin in `family_members` table
   - Inserts children into `children` table
   - Creates invitations in `invitations` table
   - Marks `onboarding_completed = true` in `profiles`
   - Clears session data
3. Page displays success message
4. Click "Accéder à mon espace"
5. **Expected:** Redirect to `/dashboard`

### Step 8: Dashboard Verification
1. **URL:** http://localhost:3012/dashboard
2. Verify dashboard shows:
   - Family name
   - Children list
   - Recent notifications
3. **Expected:** All onboarding data displayed correctly

---

## 🔍 Database Verification

### Check Supabase Tables

**1. families table:**
```sql
SELECT * FROM families WHERE created_by = '<user_id>';
```
**Expected:** 1 row with `name = 'Famille Dupont'`

**2. family_members table:**
```sql
SELECT * FROM family_members WHERE user_id = '<user_id>';
```
**Expected:** 1 row with `role = 'admin'`

**3. children table:**
```sql
SELECT * FROM children WHERE family_id = '<family_id>';
```
**Expected:** 1+ rows (all children added)

**4. invitations table:**
```sql
SELECT * FROM invitations WHERE family_id = '<family_id>';
```
**Expected:** 1+ rows if invitations were sent

**5. profiles table:**
```sql
SELECT onboarding_completed FROM profiles WHERE id = '<user_id>';
```
**Expected:** `onboarding_completed = true`

---

## ❌ Error Cases to Test

### Session Expiry
1. Complete steps 1-3
2. Clear browser cookies
3. Try to access `/onboarding/children`
4. **Expected:** Redirect to `/auth/login`

### Missing Data
1. Complete step 4 (children)
2. Manually navigate to `/onboarding/ready` (skip steps 5-6)
3. **Expected:** Redirect to `/onboarding/welcome` with error

### Invalid Data
1. Try to submit children form with:
   - Empty name
   - Invalid date
   - SQL injection attempt: `'; DROP TABLE families; --`
2. **Expected:** Form validation errors (will be enhanced in Task #7)

### Back Navigation
1. Complete steps 4-6
2. Click "Retour" on step 6
3. **Expected:** Return to previous step, data preserved in session

---

## 📊 Session Data Structure

After completing all steps, `req.session.onboarding` should contain:

```javascript
{
  children: [
    {
      name: "Jean Dupont",
      birthDate: "2015-03-15",
      grade: null
    }
  ],
  adults: [
    {
      email: "grandpa@example.com",
      role: "grandparent",
      name: null
    }
  ],
  familySpace: {
    name: "Famille Dupont",
    description: "Notre belle famille!"
  }
}
```

**After `/ready` route completes:** Session should be cleared (`req.session.onboarding` deleted)

---

## 🐛 Known Issues (Pre-Validation)

### Current Limitations:
1. ❌ **No input validation** - express-validator not yet wired (Task #7)
2. ❌ **No CSRF protection** - tokens not added yet (Task #6)
3. ❌ **Email invitations not sent** - only database records created
4. ❌ **No file upload** - family photo removed from form
5. ⚠️ **Basic error handling** - could be more granular

### Will Be Fixed:
- Task #7: Add validators (Agent A, after Agent B completes Task #4)
- Task #6: CSRF tokens (Agent B)
- Email sending: Separate feature (future)

---

## ✅ Success Criteria

### Must Pass:
- [ ] User can register and login
- [ ] User can complete all 5 onboarding steps
- [ ] At least one child can be added
- [ ] Family space can be created
- [ ] Data persists to all 5 database tables
- [ ] User redirects to dashboard after completion
- [ ] Dashboard displays correct data
- [ ] Session is cleared after completion
- [ ] User cannot access onboarding again (onboarding_completed check)

### Nice to Have:
- [ ] Multiple children can be added
- [ ] Multiple invitations can be sent
- [ ] Error messages display correctly
- [ ] Back navigation preserves data
- [ ] Live preview works on family-space page

---

## 🎬 Quick Test Command

**Start server:**
```bash
cd /home/yb/servers/MeLorAly/MeLorAly/app
npm run dev
```

**Access in browser:**
1. http://localhost:3012/auth/register
2. Complete registration
3. Follow steps above

---

## 📝 Test Results Log

**Tester:** _____________  
**Date:** November 1, 2025  

| Step | Status | Notes |
|------|--------|-------|
| Registration | [ ] Pass / [ ] Fail | |
| Login | [ ] Pass / [ ] Fail | |
| Welcome | [ ] Pass / [ ] Fail | |
| Children | [ ] Pass / [ ] Fail | |
| Adults | [ ] Pass / [ ] Fail | |
| Family Space | [ ] Pass / [ ] Fail | |
| Ready | [ ] Pass / [ ] Fail | |
| Dashboard | [ ] Pass / [ ] Fail | |
| DB Verification | [ ] Pass / [ ] Fail | |

**Issues Found:**
- 
- 
- 

**Overall:** [ ] PASS / [ ] FAIL

---

## 🚀 Next Steps After Testing

If tests pass:
- ✅ Mark Task #9 (Agent A testing) complete
- ⏩ Wait for Agent B to complete Tasks #2, #4, #6
- ⏩ Continue with Task #7 (wire validators)

If tests fail:
- 🐛 Document bugs
- 🔧 Fix issues
- 🔄 Re-test
