# Screen Reader Testing Guide - Events Page

## Overview
This guide provides step-by-step instructions for manually testing the Events page with screen readers to verify accessibility compliance.

## Prerequisites

### Windows (NVDA)
1. Download and install [NVDA](https://www.nvaccess.org/download/)
2. Install Chrome or Firefox browser
3. Familiarize yourself with basic NVDA commands

### macOS (VoiceOver)
1. VoiceOver is built into macOS
2. Open Safari (recommended) or Chrome
3. Familiarize yourself with basic VoiceOver commands

### Windows (JAWS)
1. Download and install [JAWS](https://www.freedomscientific.com/products/software/jaws/)
2. Install Chrome browser
3. Familiarize yourself with basic JAWS commands

## Basic Screen Reader Commands

### NVDA (Windows)
| Action | Command |
|--------|---------|
| Start/Stop NVDA | Ctrl + Alt + N |
| Read next item | Down Arrow |
| Read previous item | Up Arrow |
| Navigate by heading | H |
| Navigate by link | K |
| Navigate by button | B |
| Navigate by form field | F |
| Read current line | NVDA + Up Arrow |
| Read all from cursor | NVDA + Down Arrow |
| Stop reading | Ctrl |

### VoiceOver (macOS)
| Action | Command |
|--------|---------|
| Start/Stop VoiceOver | Cmd + F5 |
| Read next item | VO + Right Arrow |
| Read previous item | VO + Left Arrow |
| Navigate by heading | VO + Cmd + H |
| Navigate by link | VO + Cmd + L |
| Navigate by button | VO + Cmd + B |
| Navigate by form field | VO + Cmd + J |
| Read current item | VO + A |
| Stop reading | Ctrl |

*Note: VO = Ctrl + Option*

### JAWS (Windows)
| Action | Command |
|--------|---------|
| Read next item | Down Arrow |
| Read previous item | Up Arrow |
| Navigate by heading | H |
| Navigate by link | Tab |
| Navigate by button | B |
| Navigate by form field | F |
| Read current line | Insert + Up Arrow |
| Read all from cursor | Insert + Down Arrow |
| Stop reading | Ctrl |

## Test Scenarios

### Test 1: Event Card Navigation

#### Objective
Verify that event cards are properly announced with all relevant information.

#### Steps
1. Navigate to the Events page
2. Use Tab key to navigate to the first event card
3. Listen to the announcement

#### Expected Results
- [ ] Card is announced as "article" or "region"
- [ ] Event title is announced clearly
- [ ] Event type is announced (Workshop, Hackathon, etc.)
- [ ] Event date is announced with "Event date:" prefix
- [ ] Event time is announced with "Event time:" prefix
- [ ] Urgency badges are announced (if applicable):
  - [ ] "New event" for new events
  - [ ] "Event starting soon" for events within 24 hours
  - [ ] "Event almost full" for events >80% capacity
- [ ] Attendee count is announced as "X out of Y attendees registered"
- [ ] Capacity progress bar is announced with percentage
- [ ] Action buttons have descriptive labels:
  - [ ] "View details for [Event Title]"
  - [ ] "Register for [Event Title]" or "You are registered for [Event Title]. Click to unregister"

#### Pass/Fail Criteria
✅ Pass: All information is announced clearly and in logical order  
❌ Fail: Missing information or unclear announcements

---

### Test 2: Event Image Alt Text

#### Objective
Verify that event images have descriptive alt text.

#### Steps
1. Navigate to an event card with an image
2. Focus on the image element
3. Listen to the alt text announcement

#### Expected Results
- [ ] Alt text includes event title
- [ ] Alt text includes event type
- [ ] Alt text includes event date
- [ ] Format: "Banner image for [Title] - [Type] event on [Date]"

#### Example
"Banner image for Web Development Workshop - WORKSHOP event on Dec 25, 2024"

#### Pass/Fail Criteria
✅ Pass: Alt text is descriptive and provides context  
❌ Fail: Alt text is missing or not descriptive

---

### Test 3: Registration Flow Announcements

#### Objective
Verify that registration actions are announced to screen readers.

#### Steps
1. Navigate to an event card
2. Tab to the "Register Now" button
3. Press Enter to register
4. Listen for announcements during the process

#### Expected Results
- [ ] Initial announcement: "Registering for [Event Title]. Please wait."
- [ ] Success announcement: "Successfully registered for [Event Title]. Check your email for details."
- [ ] Button changes to "Registered" with new label: "You are registered for [Event Title]. Click to unregister"

#### Error Scenario
If registration fails:
- [ ] Error announcement: "Registration failed. [Error Message]"

#### Pass/Fail Criteria
✅ Pass: All announcements are clear and timely  
❌ Fail: Missing or unclear announcements

---

### Test 4: Unregistration Flow Announcements

#### Objective
Verify that unregistration actions are announced to screen readers.

#### Steps
1. Navigate to an event you're registered for
2. Tab to the "Registered" button
3. Press Enter to unregister
4. Confirm unregistration in the dialog
5. Listen for announcements during the process

#### Expected Results
- [ ] Initial announcement: "Unregistering from [Event Title]. Please wait."
- [ ] Success announcement: "Successfully unregistered from [Event Title]"
- [ ] Button changes back to "Register Now"

#### Error Scenario
If unregistration fails:
- [ ] Error announcement: "Unregistration failed. [Error Message]"

#### Pass/Fail Criteria
✅ Pass: All announcements are clear and timely  
❌ Fail: Missing or unclear announcements

---

### Test 5: Add Event Form Labels

#### Objective
Verify that all form inputs have proper labels and descriptions.

#### Steps
1. Click "Add Event" button (admin only)
2. Navigate through the form using Tab key
3. Listen to each field announcement

#### Expected Results

**Event Title Field:**
- [ ] Label announced: "Event Title"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Enter a descriptive title for your event"
- [ ] Field type announced: "edit" or "text input"

**Description Field:**
- [ ] Label announced: "Description"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Provide a brief description of what attendees can expect from this event"
- [ ] Field type announced: "multiline edit" or "textarea"

**Date Field:**
- [ ] Label announced: "Date"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Select the date when the event will take place"
- [ ] Field type announced: "date picker" or "date input"

**Time Field:**
- [ ] Label announced: "Time"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Enter the time range for the event, for example 9:00 - 11:00 AM"
- [ ] Field type announced: "edit" or "text input"

**Meeting Platform Field:**
- [ ] Label announced: "Meeting Platform" or "Select meeting platform"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Choose the platform where the event will be hosted"
- [ ] Field type announced: "combo box" or "select"

**Event Type Field:**
- [ ] Label announced: "Event Type" or "Select event type"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Select the type of event you are creating"
- [ ] Field type announced: "combo box" or "select"

**Meeting Link Field:**
- [ ] Label announced: "Meeting Link"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Enter the full URL for the meeting link where attendees will join"
- [ ] Field type announced: "edit" or "URL input"

**Maximum Attendees Field:**
- [ ] Label announced: "Maximum Attendees"
- [ ] Required indicator announced: "required"
- [ ] Hint announced: "Enter the maximum number of people who can register for this event"
- [ ] Field type announced: "spin button" or "number input"

#### Pass/Fail Criteria
✅ Pass: All fields have clear labels, required indicators, and helpful hints  
❌ Fail: Missing labels, unclear descriptions, or inaccessible fields

---

### Test 6: Decorative Icons

#### Objective
Verify that decorative icons are hidden from screen readers.

#### Steps
1. Navigate through event cards
2. Listen for icon announcements
3. Verify that only meaningful content is announced

#### Expected Results
- [ ] Calendar icons are not announced
- [ ] Clock icons are not announced
- [ ] User icons are not announced
- [ ] Location icons are not announced
- [ ] Only the text content next to icons is announced

#### Pass/Fail Criteria
✅ Pass: Decorative icons are hidden (aria-hidden="true")  
❌ Fail: Icons are announced unnecessarily

---

### Test 7: Event Details Modal

#### Objective
Verify that the event details modal is accessible and properly announced.

#### Steps
1. Navigate to an event card
2. Press Enter on "View Details" button
3. Navigate through the modal content
4. Press Escape to close the modal

#### Expected Results
- [ ] Modal opening is announced
- [ ] Modal title is announced: "Event Details" or event title
- [ ] Focus moves into the modal
- [ ] All modal content is accessible via keyboard
- [ ] Close button is announced: "Close modal"
- [ ] Escape key closes the modal
- [ ] Focus returns to the trigger button after closing

#### Pass/Fail Criteria
✅ Pass: Modal is fully accessible and focus is managed properly  
❌ Fail: Modal is not accessible or focus is lost

---

### Test 8: Filter Panel

#### Objective
Verify that the filter panel is accessible and properly announced.

#### Steps
1. Navigate to the filter panel (desktop) or filter button (mobile)
2. Navigate through filter options
3. Apply filters and listen for announcements

#### Expected Results
- [ ] Filter panel is announced as "region" with label "Event filters"
- [ ] Filter count is announced: "X filters active"
- [ ] Each filter type is announced with its label
- [ ] Checkboxes announce their state (checked/unchecked)
- [ ] Radio buttons announce their state (selected/not selected)
- [ ] "Clear All" button is announced clearly
- [ ] Filter changes trigger result count updates

#### Pass/Fail Criteria
✅ Pass: All filters are accessible and state changes are announced  
❌ Fail: Filters are not accessible or state changes are not announced

---

## Common Issues and Solutions

### Issue 1: Announcements Not Heard
**Symptoms:** Screen reader doesn't announce registration status  
**Solutions:**
- Verify ARIA live region is created (`#event-registration-announcer`)
- Check that `aria-live="polite"` is set
- Ensure announcements have a 100ms delay before setting text
- Verify screen reader is not in forms mode

### Issue 2: Form Labels Not Announced
**Symptoms:** Screen reader doesn't read form labels  
**Solutions:**
- Verify `htmlFor` attribute matches input `id`
- Check that `aria-describedby` points to existing hint element
- Ensure labels are not hidden with `display: none`
- Verify `aria-required` is set on required fields

### Issue 3: Images Not Described
**Symptoms:** Screen reader doesn't read image alt text  
**Solutions:**
- Verify `alt` attribute is present and not empty
- Check that alt text is descriptive and contextual
- Ensure images are not decorative (use `alt=""` for decorative images)
- Verify Next.js Image component is rendering correctly

### Issue 4: Buttons Not Descriptive
**Symptoms:** Screen reader announces "button" without context  
**Solutions:**
- Add `aria-label` attribute with descriptive text
- Ensure button text is meaningful
- Avoid generic labels like "Click here" or "Submit"
- Include event title in button labels

## Testing Checklist

### Pre-Testing
- [ ] Screen reader software is installed and running
- [ ] Browser is compatible with screen reader
- [ ] Events page is loaded and ready
- [ ] Test user account is logged in (if needed)

### During Testing
- [ ] Take notes on each test scenario
- [ ] Record any issues or unexpected behavior
- [ ] Test with multiple screen readers if possible
- [ ] Test on different browsers
- [ ] Test on different devices (desktop, mobile)

### Post-Testing
- [ ] Document all findings
- [ ] Categorize issues by severity (critical, major, minor)
- [ ] Create bug reports for any failures
- [ ] Verify fixes with re-testing
- [ ] Update documentation with any new findings

## Severity Levels

### Critical (P0)
- Content is completely inaccessible
- Screen reader cannot navigate the page
- Form cannot be submitted
- Registration flow is broken

### Major (P1)
- Important information is missing
- Announcements are unclear or confusing
- Some content is difficult to access
- Workarounds are complex

### Minor (P2)
- Minor improvements needed
- Announcements could be clearer
- Some labels could be more descriptive
- Non-critical content is affected

### Enhancement (P3)
- Nice-to-have improvements
- Better wording suggestions
- Additional context could help
- Cosmetic issues

## Reporting Template

```markdown
### Issue: [Brief Description]

**Severity:** [Critical/Major/Minor/Enhancement]

**Screen Reader:** [NVDA/VoiceOver/JAWS]

**Browser:** [Chrome/Firefox/Safari/Edge]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Recording:**
[If applicable]

**Suggested Fix:**
[If known]
```

## Resources

### Screen Reader Downloads
- [NVDA](https://www.nvaccess.org/download/) (Free, Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Paid, Windows)
- VoiceOver (Built-in, macOS/iOS)
- TalkBack (Built-in, Android)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [WAVE](https://wave.webaim.org/extension/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

### Documentation
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Conclusion

This testing guide provides comprehensive instructions for manually verifying screen reader accessibility on the Events page. Follow each test scenario carefully and document all findings. Remember that automated tests cannot catch all accessibility issues, so manual testing with real screen readers is essential.

**Happy Testing! 🎯**
