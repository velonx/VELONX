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
