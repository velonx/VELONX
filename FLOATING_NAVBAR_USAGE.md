# Floating Navbar - Usage Guide

## ✅ Installation Complete

- ✅ **@tabler/icons-react** v3.36.1 installed
- ✅ **floating-navbar.tsx** component created in `src/components/ui/`
- ✅ **floating-navbar-demo.tsx** demo component created

## 📦 Component Files

1. **Core Component**: `src/components/ui/floating-navbar.tsx`
2. **Demo Component**: `src/components/floating-navbar-demo.tsx`

## 🚀 Quick Usage

### Basic Implementation

```tsx
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
];

<FloatingNav navItems={navItems} />
```

### Use the Demo Component

```tsx
import FloatingNavDemo from "@/components/floating-navbar-demo";

export default function Page() {
  return <FloatingNavDemo />;
}
```

## 🎨 Customization

### Change Colors

Edit `src/components/ui/floating-navbar.tsx`:

```tsx
// Line 60-61, change background and border:
"dark:bg-black bg-white"  // → Change to your colors
"border-transparent dark:border-white/[0.2]"  // → Change border
```

### Adjust Scroll Threshold

```tsx
// Line 32, change when navbar appears:
if (scrollYProgress.get() < 0.05) {  // 5% of page
  // Change to 0.1 for 10%, 0.2 for 20%, etc.
}
```

### Modify Animation Speed

```tsx
// Line 56, change duration:
transition={{
  duration: 0.2,  // Change to 0.3, 0.4, etc.
}}
```

## 📚 Available @tabler Icons

Browse all icons at: https://tabler.io/icons

Common icons:
- `IconHome`
- `IconUser`
- `IconMessage`
- `IconSettings`
- `IconBell`
- `IconSearch`
- `IconMenu`
- And 5000+ more!

## 🎯 Integration Options

### Option 1: Add to Layout
```tsx
// app/layout.tsx
import FloatingNavDemo from "@/components/floating-navbar-demo";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FloatingNavDemo />
        {children}
      </body>
    </html>
  );
}
```

### Option 2: Add to Specific Page
```tsx
// app/page.tsx
import FloatingNavDemo from "@/components/floating-navbar-demo";

export default function HomePage() {
  return (
    <>
      <FloatingNavDemo />
      {/* Your page content */}
    </>
  );
}
```

## 🔧 Component Props

```typescript
interface FloatingNavProps {
  navItems: {
    name: string;           // Display name
    link: string;           // URL to navigate to
    icon?: React.ReactNode; // Optional icon (shown on mobile)
  }[];
  className?: string;       // Optional additional CSS classes
}
```

## ✨ Features

- ✅ Scroll-based visibility (appears when scrolling up)
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design (icons on mobile, text on desktop)
- ✅ Dark mode support
- ✅ Customizable styling
- ✅ TypeScript support

## 🎨 Styling Classes

The component uses these Tailwind classes:
- `fixed top-10` - Position at top
- `z-[5000]` - High z-index to stay on top
- `rounded-full` - Pill shape
- `backdrop-blur` - Glassmorphism effect
- `shadow-[...]` - Custom shadow

## 📱 Responsive Behavior

- **Mobile (<640px)**: Shows icons only
- **Desktop (≥640px)**: Shows icons + text

## 🐛 Troubleshooting

### Navbar not appearing?
- Scroll down past 5% of the page
- Check z-index isn't being overridden

### Icons not showing?
- Verify @tabler/icons-react is installed: `npm list @tabler/icons-react`
- Check icon imports are correct

### Styling issues?
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Verify Tailwind is processing the files

## 🎉 You're Ready!

The floating navbar is now installed and ready to use. Customize it to match your design and integrate it into your pages!
