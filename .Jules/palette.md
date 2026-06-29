## 2024-11-20 - [ARIA Labels for mobile buttons]
**Learning:** Found missing aria labels in mobile PostCard voting buttons even though desktop buttons had them.
**Action:** Ensure aria labels are duplicated/applied across responsive breakpoint component variants.
## 2026-06-13 - Enhance accessibility for PostCard and CommentItem
**Learning:** Found missing ARIA attributes (aria-expanded, aria-controls, aria-haspopup) on interactive dropdowns and toggle buttons within community components. Without these, screen readers struggle to understand the state and relationship of these UI elements.
**Action:** Added proper ARIA attributes to `PostCard.tsx` and `CommentItem.tsx` to improve the screen reader experience. Next time, always ensure toggleable elements have `aria-expanded` and `aria-controls`/`aria-haspopup`.
## 2026-06-15 - [Screen reader support for password toggles]
**Learning:** Found that "show/hide password" buttons consisting of only `Eye` and `EyeOff` icons lacked accessible names, causing screen readers to misidentify the interactive element.
**Action:** Added dynamic `aria-label` attributes (`aria-label={showPassword ? "Hide password" : "Show password"}`) to properly announce the toggling functionality to screen reader users. Always ensure icon-only buttons have descriptive labels.
## 2026-06-16 - Add ARIA Labels to Rich Text Editor Toolbar Buttons
**Learning:** Found that numerous icon-only buttons in the RichTextEditor.tsx toolbar lacked aria-label attributes, making it difficult for screen readers to identify their actions.
**Action:** Added aria-label attributes to all icon-only toolbar buttons to ensure full accessibility for screen reader users.

## 2024-06-20 - Adding ARIA labels to career management buttons
**Learning:** Icon-only buttons for CRUD operations (like Edit or Delete) need descriptive `aria-label`s to be accessible. Dynamically generating these labels with contextual information (e.g. `aria-label="Edit Software Engineer job"`) significantly improves the screen reader experience compared to generic labels like "Edit".
**Action:** When creating lists of items with actions, always ensure action buttons either have visible text or include specific `aria-label`s incorporating the item's title or identifying information.
## 2024-05-24 - Accessibility for Mobile Nav Buttons
**Learning:** Icon-only buttons used to trigger mobile navigations (like the Sheet trigger in EventsSidebar) are often overlooked for ARIA labels because they function as secondary navigation elements. These need explicit labeling so screen readers can convey the action to the user properly.
**Action:** Always verify that `<SheetTrigger asChild><Button size="icon">` implementations include an `aria-label` describing the action (e.g., "Toggle navigation menu").
## 2024-05-20 - Semantic Image Links in PostCard
**Learning:** Using a `<div>` with an `onClick` handler for image links breaks accessibility as it cannot be focused via keyboard, is not announced as a link to screen readers, and disables native browser features like right-clicking to "Open in new tab".
**Action:** Always wrap actionable external images in semantic `<a>` tags with appropriate `target="_blank"`, `rel="noopener noreferrer"`, `focus-visible` styling, and an `aria-label` to ensure fully accessible navigation.

## 2024-05-20 - Announcing Share Button State in PostCard
**Learning:** When a button briefly changes text (e.g., from "Share" to "Copied") without moving focus or opening a dialog, screen readers miss the feedback because there's no live region alert.
**Action:** Add `aria-live="polite"` to buttons with temporary text state changes (like "Copied" indicators) to ensure screen readers announce the success state without interrupting the user.
