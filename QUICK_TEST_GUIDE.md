# Quick Test Guide - User Account Settings

## 🚀 Quick Start (5 Minutes)

### 1. Verify Implementation
```bash
cd VELONX
node verify-user-settings-implementation.js
```
**Expected:** ✅ 15/15 checks passed

### 2. Start Development Server
```bash
npm run dev
```
**Expected:** Server running on http://localhost:3000

### 3. Quick Smoke Test
1. Open http://localhost:3000
2. Log in with test account
3. Click avatar → "Account Settings"
4. Change your name
5. Click "Save Changes"
6. Verify success message
7. Check navigation - name should update immediately

**Expected:** ✅ All steps work without errors

---

## 📋 Full Testing

### Manual Testing Checklist
Open and follow: `USER_SETTINGS_INTEGRATION_TEST_CHECKLIST.md`
- 40+ test cases
- All requirements covered
- Step-by-step instructions

### Automated Tests (when vitest is installed)
```bash
npm test -- user-settings-integration.test.ts --run
```

---

## 🔍 What to Test

### Critical Flows (Must Test)
1. ✅ Login → Settings → Update Profile → Verify
2. ✅ Select predefined avatar → Save → Verify
3. ✅ Upload custom image → Save → Verify
4. ✅ Form validation (empty name, too long)
5. ✅ Error handling (network error, upload error)
6. ✅ Session updates (name/avatar in navigation)
7. ✅ Responsive design (mobile, tablet, desktop)

### Security (Must Test)
1. ✅ XSS prevention (try `<script>alert('XSS')</script>`)
2. ✅ Unauthenticated access (logout, try /settings)
3. ✅ File type validation (try uploading .txt file)
4. ✅ File size validation (try uploading large file)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot access /settings"
**Solution:** Make sure you're logged in first

### Issue: "Image upload fails"
**Solution:** Check Cloudinary credentials in `.env`

### Issue: "Database error"
**Solution:** Verify MongoDB connection in `.env`

### Issue: "Session not updating"
**Solution:** Check NextAuth configuration

---

## ✅ Success Criteria

Your implementation passes if:
- ✅ Verification script shows 15/15 passed
- ✅ All critical flows work without errors
- ✅ Security tests pass (no XSS, proper validation)
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Error messages are clear and helpful
- ✅ Session updates immediately after save

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Verification Script: ☐ Pass ☐ Fail
Critical Flows: ☐ Pass ☐ Fail
Security Tests: ☐ Pass ☐ Fail
Responsive Design: ☐ Pass ☐ Fail

Issues Found: _______________

Overall Status: ☐ Pass ☐ Fail ☐ Pass with Issues
```

---

## 📚 Documentation

- **Full Checklist:** `USER_SETTINGS_INTEGRATION_TEST_CHECKLIST.md`
- **Implementation Summary:** `USER_SETTINGS_INTEGRATION_COMPLETE.md`
- **Requirements:** `.kiro/specs/user-account-settings/requirements.md`
- **Design:** `.kiro/specs/user-account-settings/design.md`
- **Tasks:** `.kiro/specs/user-account-settings/tasks.md`

---

## 🎯 Next Steps After Testing

1. Document any issues found
2. Fix critical bugs
3. Re-test fixed issues
4. Get user acceptance sign-off
5. Deploy to production

