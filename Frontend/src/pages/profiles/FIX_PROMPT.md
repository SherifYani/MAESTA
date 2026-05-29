# Profile Pages API Integration - Comprehensive Fix Prompt

## Context
The Frontend profile pages have API integration issues identified in `PROFILE_INTEGRATION_AUDIT.md`. This prompt instructs you to fix all 8 identified issues across 8 profile-related pages.

---

## Issues to Fix

### 🔴 CRITICAL - Priority 1

#### Issue #1: Implement EditClientProfile.jsx
**File**: `Frontend/src/pages/profiles/EditClientProfile.jsx`  
**Status**: NOT IMPLEMENTED - Page is empty

**Task**: Create a complete EditClientProfile component following the pattern of EditJobSeekerProfile.jsx and EditCompanyProfile.jsx

**Requirements**:
- Import necessary dependencies: React, useState, useNavigate, useProfile, profileService
- Create form state for client profile fields
- Display form fields for: fullName, email, phoneNumber, profilePictureUrl, bio, location, companyName, industry, website
- Implement form input change handlers
- Add form validation (email format, required fields)
- Call `profileService.updateClientProfile()` on submit
- Update ProfileContext after successful API call
- Show loading spinner during submit
- Display error and success messages
- Add Cancel button that confirms before leaving
- Navigate to `/dashboard/profile` after success
- Use BEM CSS classes (profile.css and edit-profile.css)
- Follow accessibility best practices (aria labels, proper form structure)

**Reference**: Use EditJobSeekerProfile.jsx (lines 1-348) as template

---

#### Issue #2: Remove Duplicate Error Messages
**File**: `Frontend/src/pages/profiles/EditJobSeekerProfile.jsx`  
**Lines**: 403-415 and 992-996

**Task**: Remove duplicate error message displays

**Current Problem**:
```javascript
{error && (
  <div className="edit__error-banner" role="alert">
    {error}
  </div>
)}
// DUPLICATE - appears twice
{error && (
  <div className="edit__error-message" role="alert">
    {error}
  </div>
)}
```

**Fix**: Keep only ONE error display (the banner version). Delete the duplicate message div around line 992-996.

---

#### Issue #3: Fix API Response Context Update - ALL EDIT PAGES
**Files**: 
- `EditJobSeekerProfile.jsx` (line 336-339)
- `EditCompanyProfile.jsx` (line 220-223)
- `EditFreelancerProfile.jsx` (line ~150)

**Task**: Update context with API response instead of local data

**Current Problem**:
```javascript
await profileService.updateJobseekerProfile(updatedJobSeekerData);
updateJobSeekerData(updatedJobSeekerData);  // ❌ Uses local data
```

**Fix**: Use API response:
```javascript
const response = await profileService.updateJobseekerProfile(updatedJobSeekerData);
updateJobSeekerData(response);  // ✅ Uses API response
```

**Apply to**:
1. EditJobSeekerProfile.jsx - handleSubmit function
2. EditCompanyProfile.jsx - handleSubmit function  
3. EditFreelancerProfile.jsx - handleSubmit function

---

### 🟡 HIGH PRIORITY - Priority 2

#### Issue #4: Remove RegisterStep2 Anti-pattern
**File**: `Frontend/src/pages/profiles/EditJobSeekerProfile.jsx`  
**Lines**: 295-310

**Task**: Remove the upsert logic that calls authService.registerStep2

**Current Problem**:
```javascript
// This is WRONG - edit page should not call registration endpoints
if (!jobSeekerData.jobSeekerId) {
  console.log("Profile record missing (404 seeded state). Creating profile first...");
  await authService.registerStep2({...});
  const freshProfile = await profileService.getJobseekerProfile();
  updateJobSeekerData(freshProfile);
}
```

**Fix**: Replace with proper error handling:
```javascript
if (!jobSeekerData.jobSeekerId) {
  setError("Profile not found. Please complete registration first.");
  setLoading(false);
  return;
}
```

**Rationale**: Profile should already exist after Step 2 registration. If it doesn't, it's a real error that should be reported, not worked around.

---

#### Issue #5: Fix useEffect Dependency Array
**File**: `Frontend/src/pages/profiles/EditJobSeekerProfile.jsx`  
**Lines**: 71-77

**Task**: Add missing dependency and remove eslint-disable

**Current Problem**:
```javascript
useEffect(() => {
  setFormData(buildFormState(jobSeekerData, user));
  setSkills(jobSeekerData.skills || []);
  setExperiences(jobSeekerData.experiences || []);
  setEducation(jobSeekerData.education || []);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [jobSeekerData]);  // ❌ Missing 'user' dependency
```

**Fix**:
```javascript
useEffect(() => {
  setFormData(buildFormState(jobSeekerData, user));
  setSkills(jobSeekerData.skills || []);
  setExperiences(jobSeekerData.experiences || []);
  setEducation(jobSeekerData.education || []);
}, [jobSeekerData, user]);  // ✅ Include both dependencies
```

---

#### Issue #6: Improve Error Handling - ALL EDIT PAGES
**Files**:
- `EditJobSeekerProfile.jsx` (line 343)
- `EditCompanyProfile.jsx` (line 226)
- `EditFreelancerProfile.jsx` (line ~150)

**Task**: Improve error message extraction

**Current Problem**:
```javascript
catch (err) {
  setError(err.message || "Failed to update profile.");
}
```

**Fix**: Check for backend error format first:
```javascript
catch (err) {
  const msg = err?.response?.data?.message 
    || err?.message 
    || "Failed to update profile. Please try again.";
  setError(msg);
}
```

**Apply to all three edit pages in their handleSubmit catch blocks**

---

### 🟠 MEDIUM PRIORITY - Priority 3

#### Issue #7: Add Loading State to Form Inputs - ALL EDIT PAGES
**Files**:
- `EditJobSeekerProfile.jsx` (add `disabled={loading}` to all inputs)
- `EditCompanyProfile.jsx` (add `disabled={loading}` to all inputs)
- `EditFreelancerProfile.jsx` (add `disabled={loading}` to all inputs)

**Task**: Disable all form input fields while loading to prevent editing during submission

**Changes Required**:
Add `disabled={loading}` attribute to:
- All `<input>` elements
- All `<textarea>` elements
- All `<select>` or component select elements (GeneralSelect needs disabled prop)

**Example Fix**:
```javascript
// BEFORE
<input
  type="text"
  id="fullName"
  name="fullName"
  value={formData.fullName}
  onChange={handleInputChange}
  className="edit__input"
/>

// AFTER
<input
  type="text"
  id="fullName"
  name="fullName"
  value={formData.fullName}
  onChange={handleInputChange}
  disabled={loading}  // ← ADD THIS
  className="edit__input"
/>
```

**Note for GeneralSelect component**: Ensure it accepts and uses `disabled` prop

---

#### Issue #8: Standardize ProfileService Error Handling
**File**: `Frontend/src/services/profileService.js`  
**All methods in catch blocks**

**Task**: Standardize error throwing format

**Current Problem**:
```javascript
catch (error) {
  throw error.response?.data || error.message;  // ❌ Sometimes object, sometimes string
}
```

**Fix**: Always throw Error object with message:
```javascript
catch (error) {
  const errorData = error.response?.data;
  const message = typeof errorData === 'object' && errorData.message 
    ? errorData.message 
    : error.message 
    || 'An error occurred';
  throw new Error(message);
}
```

**Apply to these methods**:
- getMyProfile
- getProfileById
- updateProfile
- uploadProfilePicture
- deleteProfilePicture
- getJobseekerProfile
- updateJobseekerProfile
- uploadResume
- addWorkExperience
- updateWorkExperience
- deleteWorkExperience
- addEducation
- updateEducation
- deleteEducation
- updateSkills
- getFreelancerProfile
- updateFreelancerProfile
- addPortfolioItem
- updatePortfolioItem
- deletePortfolioItem
- updateHourlyRate
- getCompanyProfile
- updateCompanyProfile
- uploadCompanyLogo
- addTeamMember
- removeTeamMember
- getClientProfile
- updateClientProfile
- updateNotificationPreferences
- deleteAccount

---

## Implementation Order

1. **First**: Fix Issues #2, #5, #6 (Simple, no new components)
2. **Second**: Fix Issue #4 (Remove problematic code)
3. **Third**: Fix Issue #3 (Context updates across all pages)
4. **Fourth**: Fix Issue #8 (ProfileService standardization)
5. **Fifth**: Fix Issue #7 (Add loading disabled to inputs)
6. **Last**: Fix Issue #1 (Implement EditClientProfile)

---

## Testing Checklist After Fixes

- [ ] EditJobSeekerProfile submits successfully and updates context with API response
- [ ] EditCompanyProfile submits successfully and updates context with API response
- [ ] EditFreelancerProfile submits successfully and updates context with API response
- [ ] EditClientProfile (newly created) submits successfully and updates context
- [ ] No duplicate error messages display in any edit page
- [ ] Error messages show backend response message when available
- [ ] All form inputs are disabled during API call (loading state)
- [ ] Errors from API are properly caught and displayed
- [ ] Success message displays after successful update
- [ ] Navigation happens after success (2-3 second delay for message display)
- [ ] Browser console shows no React warnings or errors
- [ ] profileService methods throw consistent Error objects

---

## Files to Modify

**Pages** (6 files):
1. EditJobSeekerProfile.jsx
2. EditCompanyProfile.jsx
3. EditFreelancerProfile.jsx
4. EditClientProfile.jsx (Create new)

**Services** (1 file):
1. profileService.js

**Total Changes**: ~250-350 lines of code modifications

---

## Code Style Guide

- Use BEM CSS classes (edit__, profile__, etc.)
- Use React functional components with hooks
- Add proper error handling and user feedback
- Include accessibility attributes (aria-label, aria-required, role)
- Follow the existing code patterns in the project
- Use camelCase for variables and functions
- Add comments for complex logic
- Remove console.log statements (except for errors)

---

## Expected Outcomes

After completing all fixes:
- ✅ 100% of profile pages properly integrated with API
- ✅ All data synced correctly from API responses
- ✅ Consistent error handling across all pages
- ✅ Better user experience (loading states, proper feedback)
- ✅ No deprecated or anti-pattern code
- ✅ All forms properly validated and accessible
- ✅ Production-ready code

---

**Estimated Total Time**: 4-5 hours

**Ready to implement?** Start with the simple fixes first to build momentum.
