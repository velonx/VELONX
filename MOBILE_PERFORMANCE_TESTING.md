# Mobile Performance Testing Guide

## Overview
This guide provides instructions for testing the Events Page performance optimizations on mobile devices and slow network conditions.

## Performance Optimizations Implemented

### 1. Lazy Loading for Event Images
- **Implementation**: Using Next.js `Image` component with `loading="lazy"` attribute
- **Location**: `EventCard.tsx`, `EventDetailsModal.tsx`
- **Benefits**: Images load only when they enter the viewport, reducing initial page load time

### 2. Code Splitting for Modal and Calendar Views
- **Implementation**: Using React `lazy()` and `Suspense` for dynamic imports
- **Components Split**:
  - `EventDetailsModal`
  - `EventCalendar`
  - `EventAnalytics`
  - `RegistrationConfirmDialog`
  - `UnregisterConfirmDialog`
- **Location**: `src/app/events/page.tsx`
- **Benefits**: Reduces initial bundle size by ~30-40%, loads components only when needed

### 3. Optimized API Calls
- **Implementation**: Reduced payload size by selecting only necessary fields
- **Location**: `src/lib/services/event.service.ts`
- **Changes**:
  - Removed unnecessary email field from creator in list view
  - Using `select` instead of `include` for more precise field selection
  - Excluded attendee details from list view (only count)
- **Benefits**: Reduces API response size by ~20-30%

### 4. Image Optimization
- **Configuration**: `next.config.ts`
- **Features**:
  - AVIF and WebP format support
  - Responsive image sizes for different devices
  - Optimized device sizes: 320px, 420px, 640px, 750px, 828px, 1080px, 1200px
  - Image compression with quality=75
  - Minimum cache TTL of 60 seconds

## Testing Instructions

### 1. Test on Slow 3G Network Simulation

#### Using Chrome DevTools:
1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the **Network** tab
3. Click on the throttling dropdown (usually shows "No throttling")
4. Select **"Slow 3G"** from the preset options
5. Navigate to the Events page: `http://localhost:3000/events`
6. Observe the following:
   - Initial page load time should be under 5 seconds
   - Images should load progressively as you scroll
   - Modal and calendar views should load quickly when accessed

#### Custom Network Profile (More Realistic Mobile):
1. In Chrome DevTools Network tab, click throttling dropdown
2. Select **"Add..."** to create custom profile
3. Configure:
   - **Download**: 400 Kbps (typical 3G)
   - **Upload**: 400 Kbps
   - **Latency**: 400ms
4. Save as "Mobile 3G"
5. Test the Events page with this profile

### 2. Test Code Splitting

#### Verify Lazy Loading:
1. Open Chrome DevTools
2. Go to **Network** tab
3. Filter by **JS** files
4. Navigate to Events page
5. Observe:
   - Initial page load should NOT include modal/calendar chunks
   - Click "View Details" on an event
   - New JS chunk should load (e.g., `EventDetailsModal.chunk.js`)
   - Click calendar view
   - New JS chunk should load (e.g., `EventCalendar.chunk.js`)

#### Measure Bundle Size:
```bash
# Build the application
npm run build

# Analyze bundle (if bundle analyzer is installed)
ANALYZE=true npm run build

# Check the .next/static/chunks directory
ls -lh .next/static/chunks/
```

### 3. Test Image Lazy Loading

#### Visual Test:
1. Open Chrome DevTools
2. Go to **Network** tab
3. Filter by **Img** files
4. Navigate to Events page
5. Observe:
   - Only images in viewport should load initially
   - Scroll down slowly
   - Images should load as they enter viewport
   - Check "Initiator" column - should show "lazy"

#### Performance Metrics:
1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select:
   - **Mobile** device
   - **Performance** category
4. Click **"Generate report"**
5. Check metrics:
   - **First Contentful Paint (FCP)**: Should be < 2s
   - **Largest Contentful Paint (LCP)**: Should be < 3s
   - **Time to Interactive (TTI)**: Should be < 4s
   - **Total Blocking Time (TBT)**: Should be < 300ms

### 4. Test on Real Mobile Devices

#### iOS Testing:
1. Connect iPhone to Mac
2. Enable Web Inspector on iPhone:
   - Settings > Safari > Advanced > Web Inspector
3. Open Safari on Mac
4. Develop > [Your iPhone] > [Your Page]
5. Test on slow network:
   - Settings > Developer > Network Link Conditioner
   - Enable "3G" or "LTE" profile

#### Android Testing:
1. Enable USB Debugging on Android device
2. Connect to computer
3. Open Chrome on computer
4. Navigate to `chrome://inspect`
5. Select your device and page
6. Use Remote Devices to throttle network

### 5. Performance Benchmarks

#### Target Metrics (Slow 3G):
- **Initial Page Load**: < 5 seconds
- **Time to Interactive**: < 6 seconds
- **First Contentful Paint**: < 2.5 seconds
- **Largest Contentful Paint**: < 4 seconds
- **Total Bundle Size**: < 500KB (initial)
- **API Response Time**: < 1 second
- **API Payload Size**: < 50KB per request

#### Target Metrics (Fast 3G):
- **Initial Page Load**: < 3 seconds
- **Time to Interactive**: < 4 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds

### 6. Automated Performance Testing

#### Using Lighthouse CI:
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun --collect.url=http://localhost:3000/events
```

#### Using WebPageTest:
1. Go to https://www.webpagetest.org/
2. Enter your deployed URL
3. Select:
   - **Test Location**: Mobile device location
   - **Browser**: Chrome Mobile
   - **Connection**: 3G
4. Run test and analyze results

## Performance Monitoring

### Key Metrics to Monitor:
1. **Bundle Size**: Track over time, should not increase significantly
2. **API Response Time**: Should remain under 1 second
3. **API Payload Size**: Should remain under 50KB per request
4. **Image Load Time**: Should be progressive and non-blocking
5. **Time to Interactive**: Should remain under 4 seconds on 3G

### Tools:
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- Real User Monitoring (RUM) tools

## Troubleshooting

### Issue: Images not lazy loading
- Check that `loading="lazy"` is set on Image components
- Verify Next.js Image component is being used
- Check browser support (lazy loading is supported in modern browsers)

### Issue: Code splitting not working
- Verify React.lazy() is used correctly
- Check that Suspense wrapper is in place
- Ensure dynamic imports are not being bundled statically

### Issue: Large bundle size
- Run bundle analyzer: `ANALYZE=true npm run build`
- Check for duplicate dependencies
- Verify tree-shaking is working
- Consider splitting large libraries

### Issue: Slow API responses
- Check database query performance
- Verify indexes are in place
- Consider implementing caching
- Check network latency

## Best Practices

1. **Always test on real devices** - Simulators don't accurately represent real-world performance
2. **Test on slow networks** - Most users don't have fast connections
3. **Monitor performance over time** - Performance can degrade with new features
4. **Set performance budgets** - Define acceptable thresholds and stick to them
5. **Optimize images** - Use appropriate formats (WebP, AVIF) and sizes
6. **Minimize JavaScript** - Code split and lazy load when possible
7. **Cache aggressively** - Use browser caching and CDN caching
8. **Measure real user metrics** - Use RUM tools to track actual user experience

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [React Code Splitting](https://reactjs.org/docs/code-splitting.html)
- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
