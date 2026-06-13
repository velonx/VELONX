## 2024-11-20 - [ARIA Labels for mobile buttons]
**Learning:** Found missing aria labels in mobile PostCard voting buttons even though desktop buttons had them.
**Action:** Ensure aria labels are duplicated/applied across responsive breakpoint component variants.
## 2026-06-13 - Enhance accessibility for PostCard and CommentItem
**Learning:** Found missing ARIA attributes (aria-expanded, aria-controls, aria-haspopup) on interactive dropdowns and toggle buttons within community components. Without these, screen readers struggle to understand the state and relationship of these UI elements.
**Action:** Added proper ARIA attributes to `PostCard.tsx` and `CommentItem.tsx` to improve the screen reader experience. Next time, always ensure toggleable elements have `aria-expanded` and `aria-controls`/`aria-haspopup`.
