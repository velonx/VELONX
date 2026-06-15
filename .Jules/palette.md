## 2024-11-20 - [ARIA Labels for mobile buttons]
**Learning:** Found missing aria labels in mobile PostCard voting buttons even though desktop buttons had them.
**Action:** Ensure aria labels are duplicated/applied across responsive breakpoint component variants.
## 2026-06-13 - Enhance accessibility for PostCard and CommentItem
**Learning:** Found missing ARIA attributes (aria-expanded, aria-controls, aria-haspopup) on interactive dropdowns and toggle buttons within community components. Without these, screen readers struggle to understand the state and relationship of these UI elements.
**Action:** Added proper ARIA attributes to `PostCard.tsx` and `CommentItem.tsx` to improve the screen reader experience. Next time, always ensure toggleable elements have `aria-expanded` and `aria-controls`/`aria-haspopup`.
## 2026-06-15 - [Screen reader support for password toggles]
**Learning:** Found that "show/hide password" buttons consisting of only `Eye` and `EyeOff` icons lacked accessible names, causing screen readers to misidentify the interactive element.
**Action:** Added dynamic `aria-label` attributes (`aria-label={showPassword ? "Hide password" : "Show password"}`) to properly announce the toggling functionality to screen reader users. Always ensure icon-only buttons have descriptive labels.
