## 2026-06-19 - Add aria-labels to RichTextEditor Toolbar
 **Learning:** Icon-only buttons with titles for tooltips often miss explicit aria-labels for screen readers. Tools like TipTap editors can have many of these in their toolbars.
 **Action:** When reviewing toolbars or icon-heavy interfaces, ensure every button without a visible text node has an explicit aria-label matching its intent (or its title attribute).
