# Referral Code Signup Testing Guide

This guide provides manual testing steps for the referral code functionality in the registration form.

## Task 13.1: Update registration form to support referral codes

### Requirements Implemented

- ✅ **Requirement 3.1**: Extract and validate referral code from URL
- ✅ **Requirement 3.2**: Pre-fill referral code field when ref parameter present
- ✅ **Requirement 3.3**: Display error for invalid codes, allow registration without referral

## Manual Testing Steps

### Test 1: Pre-fill from URL Parameter

**Steps:**
1. Get a valid referral code from an existing user (check database or use `/api/referral/code` endpoint)
2. Navigate to: `http://localhost:3000/auth/signup?ref=ABC12345` (replace with actual code)
3. Observe the referral code field

**Expected Result:**
- Referral code field should be pre-filled with "ABC12345"
- A validation spinner should appear briefly
- A green checkmark with "✓ Valid referral code" should appear below the field

### Test 2: Invalid Referral Code

**Steps:**
1. Navigate to: `http://localhost:3000/auth/signup?ref=INVALID999`
2. Observe the referral code field

**Expected Result:**
- Referral code field should be pre-filled with "INVALID999"
- A validation spinner should appear briefly
- A yellow warning message should appear: "Invalid referral code. You can still register without one."
- The form should still be submittable

### Test 3: Manual Entry and Validation

**Steps:**
1. Navigate to: `http://localhost:3000/auth/signup` (no ref parameter)
2. Fill in all required fields (name, email, password)
3. Type a valid referral code in the "Referral Code" field
4. Click outside the field (blur event)

**Expected Result:**
- Validation spinner appears
- Green checkmark appears if code is valid
- Yellow warning appears if code is invalid
- Form remains submittable in both cases

### Test 4: Registration Without Referral Code

**Steps:**
1. Navigate to: `http://localhost:3000/auth/signup`
2. Fill in all required fields (name, email, password)
3. Leave referral code field empty
4. Check "I agree to Terms" checkbox
5. Click "Create Account"

**Expected Result:**
- Registration should succeed
- User should be created without a referral relationship
- User should be redirected to `/dashboard/student`

### Test 5: Registration With Valid Referral Code

**Steps:**
1. Create a test referrer user first (or use existing user)
2. Get their referral code
3. Navigate to signup page with ref parameter
4. Complete registration with all required fields
5. Submit the form

**Expected Result:**
- Registration should succeed
- User should be created with a referral relationship
- Referrer should receive 25 XP for signup milestone
- User should be redirected to `/dashboard/student`

### Test 6: Error Clearing on Type

**Steps:**
1. Navigate to signup page
2. Enter an invalid referral code
3. Blur the field to trigger validation
4. Wait for error message to appear
5. Start typing in the referral code field again

**Expected Result:**
- Error message should disappear as soon as user starts typing
- Validation should not trigger until blur event

## Automated Tests

Run the test suite:

```bash
npm test -- src/__tests__/components/signup-referral.test.tsx
```

All 6 tests should pass:
- ✅ Extract and pre-fill referral code from URL
- ✅ Display error message for invalid code
- ✅ Allow registration without referral code
- ✅ Show validation spinner
- ✅ Show success indicator for valid code
- ✅ Clear error when typing after validation error

## API Endpoints Used

### POST /api/referral/validate
- **Purpose**: Validate referral code
- **Request**: `{ code: string }`
- **Response**: `{ success: boolean, data: { valid: boolean, referrerId?: string } }`

### POST /api/auth/signup
- **Purpose**: Create new user account
- **Request**: `{ name, email, password, role, referralCode? }`
- **Response**: `{ success: boolean, data: user }`

## Database Verification

After successful registration with referral code, verify in database:

```sql
-- Check user was created with referral code
SELECT id, name, email, referralCode FROM User WHERE email = 'test@example.com';

-- Check referral relationship was created
SELECT * FROM ReferralRelationship WHERE refereeId = '<new-user-id>';

-- Check referrer received XP
SELECT * FROM XPAward WHERE userId = '<referrer-id>' AND reason LIKE '%referral%';
```

## UI/UX Features

### Visual Feedback
- 🔄 **Loading spinner**: Shows during validation
- ✅ **Success indicator**: Green text with checkmark for valid codes
- ⚠️ **Warning message**: Yellow text for invalid codes (non-blocking)
- 🎁 **Gift icon**: Visual indicator for referral code field

### User Experience
- **Optional field**: Clearly marked as "(Optional)"
- **Non-blocking errors**: Invalid codes show warning but don't prevent registration
- **Real-time validation**: Validates on blur, not on every keystroke
- **Error clearing**: Errors clear when user starts typing again
- **URL parameter support**: Seamless pre-filling from referral links

## Edge Cases Handled

1. ✅ Empty referral code (registration proceeds)
2. ✅ Invalid referral code (warning shown, registration proceeds)
3. ✅ Valid referral code (success indicator, relationship created)
4. ✅ Self-referral attempt (prevented by backend)
5. ✅ Network error during validation (graceful fallback)
6. ✅ Duplicate referral relationship (prevented by backend)

## Implementation Summary

### Files Modified
- `src/app/auth/signup/page.tsx`: Added referral code field and validation logic

### Files Created
- `src/__tests__/components/signup-referral.test.tsx`: Unit tests
- `src/__tests__/integration/signup-referral.integration.test.ts`: Integration tests

### Key Features
1. **URL Parameter Extraction**: Uses `useSearchParams` to extract `ref` parameter
2. **Async Validation**: Calls `/api/referral/validate` endpoint on blur
3. **Visual Feedback**: Loading, success, and error states
4. **Non-blocking**: Invalid codes don't prevent registration
5. **Error Handling**: Graceful fallback for network errors
6. **Backend Integration**: Passes referral code to signup API

## Compliance with Requirements

✅ **Requirement 3.1**: System extracts and validates referral code from URL  
✅ **Requirement 3.2**: System pre-fills referral code field when valid code detected  
✅ **Requirement 3.3**: System displays error for invalid code and allows registration to proceed  

All requirements for Task 13.1 have been successfully implemented and tested.
