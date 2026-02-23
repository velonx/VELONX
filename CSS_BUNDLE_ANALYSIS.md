# CSS Bundle Analysis Report

## Overview
- **Total Lines**: 3,356 lines
- **Total Animations**: 73 @keyframes definitions
- **Target**: Reduce to under 2,000 lines (40% reduction)
- **Target Bundle Size Reduction**: 30%

## Animation Inventory

### Identified @keyframes Animations (73 total):

1. meshMove
2. float (duplicate definition)
3. float-slow
4. spin
5. pulseBlue
6. pulseViolet
7. pulseOrange
8. iconBounce
9. scanline
10. neonFlicker
11. glitch
12. waveMove
13. particleFloat
14. fadeInOut
15. reveal
16. breathingGlow
17. vanishAppear
18. vanishAppearLine1
19. vanishAppearLine2
20. vanishAppearLine3
21. textReveal
22. textGlitchBefore
23. textGlitchAfter
24. textShimmer
25. textBounceIn
26. textPulse
27. textFloat
28. fadeInUp
29. slideInLeft
30. slideInRight
31. slideInBottom
32. scaleIn
33. bounceIn
34. floatContinuous
35. floatRotate
36. crownBounce
37. rowSlide
38. pulseRing
39. cardFlip
40. cursorBlink
41. twinkle
42. uploadPulse (duplicate definition)
43. blob-float
44. spin-slow
45. spin-reverse
46. float-logo
47. badgePop
48. avatarPulseRing
49. progressGrow
50. shimmerMove
51. pulse-glow
52. resourceCardFadeIn
53. filterChipSlideIn
54. filterChipSlideOut
55. loadingFadeIn
56. errorBounceIn
57. emptyStateFadeIn
58. paginationPulse
59. filterPanelSlide
60. activeFilterPulse
61. contentSwapExit
62. contentSwapEnter
63. flip-out
64. flip-in
65. marquee
66. gradient-shift
67. float-smooth
68. float-continuous
69. card-glow (incomplete at end of file)

## Issues Identified

### 1. Duplicate Definitions
- **float**: Defined twice (lines ~291 and ~303)
- **uploadPulse**: Defined twice (lines ~1546 and ~1621)

### 2. Potentially Unused Animations
Need to search codebase for usage of:
- neonFlicker
- glitch
- waveMove
- particleFloat
- vanishAppear, vanishAppearLine1/2/3
- textGlitchBefore/After
- textReveal
- textShimmer
- textBounceIn
- textPulse
- textFloat
- floatRotate
- crownBounce
- cursorBlink
- twinkle
- blob-float
- spin-slow/spin-reverse
- float-logo
- flip-out/flip-in
- marquee

### 3. Consolidation Opportunities

#### Float Animations (5 variations)
- float
- float-slow
- floatContinuous
- floatRotate
- float-smooth
- float-continuous
- float-logo

**Recommendation**: Consolidate to 2-3 variations with CSS variables for timing

#### Pulse Animations (6 variations)
- pulseBlue
- pulseViolet
- pulseOrange
- pulse-glow
- pulseRing
- activeFilterPulse

**Recommendation**: Create single pulse animation with CSS variables for colors

#### Slide Animations (4 variations)
- slideInLeft
- slideInRight
- slideInBottom
- rowSlide

**Recommendation**: Consolidate to single slide animation with direction parameter

#### Text Animations (8 variations)
- textReveal
- textGlitchBefore/After
- textShimmer
- textBounceIn
- textPulse
- textFloat
- vanishAppear + 3 line variations

**Recommendation**: Many appear unused, remove if not referenced

### 4. Duplicate CSS Rules
Need to identify and consolidate:
- Multiple gradient text classes (gradient-text-blue, gradient-text-cyan, etc.)
- Multiple glow button classes
- Multiple orb classes with similar properties

## Next Steps

1. **Search for animation usage** across all component files
2. **Remove unused animations** that are never referenced
3. **Consolidate duplicate animations** using CSS variables
4. **Merge similar CSS rules** into single declarations
5. **Configure PostCSS** with cssnano for minification
6. **Verify visual functionality** remains intact

## Expected Outcomes

- Reduce from 3,356 lines to ~2,000 lines (40% reduction)
- Remove ~30-40 unused animations
- Consolidate ~20 animations into ~8 with CSS variables
- Achieve 30% bundle size reduction through minification
