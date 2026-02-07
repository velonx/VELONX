# Keyboard Navigation - Events Page

## Overview

The Events page now includes comprehensive keyboard navigation support to ensure accessibility for all users, particularly those who rely on keyboard-only navigation.

**Requirements Implemented:**
- ✅ 9.1: All interactive elements are keyboard accessible (Tab navigation)
- ✅ 9.2: Visible focus indicators (outline or ring)

## Features

### 1. Skip Links

Skip links allow keyboard users to quickly jump to main content areas without tabbing through all navigation elements.

**Available Skip Links:**
- Skip to main content (`#main-content`)
- Skip to navigation (`#main-navigation`)

**How to Use:**
- Press `Tab` when the page loads
- The first focusable element will be the skip link
- Press `Enter` to jump to the target section

**Implementation:**
```tsx
<SkipLinks />
```

### 2. Keyboard Shortcuts

Global keyboard shortcuts are available throughout the Events page:

| Shortcut | Action | Description |
|----------|--------|-------------|
| `/` | Focus Search | Focuses the search input field (when available) |
| `Escape` | Close Modal | Closes any open modal or dialog |
| `Tab` | Next Element | Moves focus to the next interactive element |
| `Shift + Tab` | Previous Element | Moves focus to the previous interactive element |
| `Enter` | Activate | Activates the currently focused button or link |
| `Space` | Activate | Activates the currently focused button |

**Note:** The `/` shortcut will not trigger when typing in input fields (except for Escape, which always works).

### 3. Focus Indicators

All interactive elements have visible focus indicators when navigating with the keyboard:

**Focus Styles:**
- **Default Elements:** 3px solid ring in brand color (#219EBC) with 2px offset
- **Buttons:** Enhanced focus with glow effect
- **Cards:** 2px solid outline with 4px offset
- **Navigation Links:** Background highlight with outline
- **Form Inputs:** Ring with shadow effect

**CSS Classes:**
```css
*:focus-visible {
  outline: 3px solid var(--color-ring, #219EBC);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 4. Focus Management

**Modal Focus Trap:**
- When a modal opens, focus is automatically moved to the first focusable element
- Tab navigation is trapped within the modal
- When the modal closes, focus returns to the element that triggered it

**Focus Return:**
- Implemented using `useFocusReturn` hook
- Automatically stores the previously focused element
- Returns focus when modal closes

### 5. ARIA Landmarks

The Events page uses semantic HTML and ARIA landmarks for better screen reader navigation:

| Landmark | Element | Purpose |
|----------|---------|---------|
| `role="banner"` | Hero section | Page header and title |
| `role="main"` | Main content | Primary page content |
| `role="complementary"` | Sidebar | Filters and navigation |
| `role="region"` | Events list | Events grid area |
| `role="status"` | Empty states | Dynamic status messages |

### 6. Keyboard Navigation Tracking

The page tracks keyboard usage to show enhanced focus indicators:

**How it Works:**
- When `Tab` key is pressed, the `using-keyboard` class is added to `<body>`
- When mouse is used, the class is removed
- This allows for different focus styles for keyboard vs. mouse users

**CSS Example:**
```css
body.using-keyboard *:focus {
  outline: 3px solid var(--color-ring, #219EBC);
  outline-offset: 2px;
}
```

## Implementation Details

### Custom Hooks

#### `useKeyboardNavigation`

Manages keyboard shortcuts and focus tracking.

```tsx
const { getFocusableElements, focusNext, focusPrevious } = useKeyboardNavigation({
  shortcuts: [
    {
      key: '/',
      handler: (e) => {
        e.preventDefault();
        searchInputRef.current?.focus();
      },
    },
    {
      key: 'Escape',
      handler: () => {
        handleCloseModal();
      },
    },
  ],
  enableFocusTracking: true,
});
```

**Options:**
- `shortcuts`: Array of keyboard shortcut configurations
- `enableFocusTracking`: Enable/disable keyboard usage tracking
- `trapFocus`: Enable focus trap for modals
- `containerRef`: Container element for focus trap

#### `useFocusReturn`

Manages focus return after modal close.

```tsx
useFocusReturn(isModalOpen);
```

#### `useSkipLinks`

Provides skip link navigation functions.

```tsx
const { skipToMain, skipToNav } = useSkipLinks();
```

### Components

#### `SkipLinks`

Renders skip links for keyboard navigation.

```tsx
<SkipLinks 
  links={[
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
  ]}
/>
```

## Testing

### Manual Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test `/` shortcut to focus search
- [ ] Test `Escape` to close modals
- [ ] Verify skip links work
- [ ] Test focus trap in modals
- [ ] Verify focus returns after modal close
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/VoiceOver)

### Automated Tests

Tests are located in:
- `src/lib/hooks/__tests__/useKeyboardNavigation.test.tsx`
- `src/components/__tests__/SkipLinks.test.tsx`

Run tests:
```bash
npm run test -- src/lib/hooks/__tests__/useKeyboardNavigation.test.tsx
npm run test -- src/components/__tests__/SkipLinks.test.tsx
```

## Browser Support

Keyboard navigation is supported in:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Accessibility Standards

This implementation follows:
- WCAG 2.1 Level AA
- Section 508
- ARIA 1.2 specifications

## Future Enhancements

Potential improvements for future iterations:
- [ ] Add more keyboard shortcuts (e.g., arrow keys for navigation)
- [ ] Implement roving tabindex for card grids
- [ ] Add keyboard shortcuts help dialog (`?` key)
- [ ] Implement keyboard shortcuts for pagination
- [ ] Add keyboard shortcuts for filter controls

## Resources

- [WCAG 2.1 Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog) (used for modals with built-in focus trap)
