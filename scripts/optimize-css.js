#!/usr/bin/env node

/**
 * CSS Optimization Script
 * Removes unused animations and consolidates duplicate rules
 */

const fs = require('fs');
const path = require('path');

const CSS_FILE = path.join(__dirname, '../src/app/globals.css');
const OUTPUT_FILE = path.join(__dirname, '../src/app/globals.optimized.css');

// List of animations to remove (confirmed unused)
const UNUSED_ANIMATIONS = [
  'vanishAppear',
  'vanishAppearLine1',
  'vanishAppearLine2',
  'vanishAppearLine3',
  'textReveal',
  'textGlitchBefore',
  'textGlitchAfter',
  'textShimmer',
  'textBounceIn',
  'textPulse',
  'textFloat',
  'neonFlicker',
  'glitch',
  'waveMove',
  'particleFloat',
  'scanline',
  'floatRotate',
  'crownBounce',
  'cursorBlink',
  'twinkle',
  'fadeInOut',
];

console.log('Reading CSS file...');
let css = fs.readFileSync(CSS_FILE, 'utf8');

const originalLines = css.split('\n').length;
console.log(`Original file: ${originalLines} lines`);

// Remove unused animations and their class definitions
UNUSED_ANIMATIONS.forEach(animName => {
  console.log(`Removing animation: ${animName}`);
  
  // Remove @keyframes definition
  const keyframesRegex = new RegExp(
    `@keyframes ${animName}\\s*\\{[^}]*\\}`,
    'gs'
  );
  css = css.replace(keyframesRegex, '');
  
  // Remove class definitions that use this animation
  const classRegex = new RegExp(
    `\\.(?:animate-)?${animName}[^{]*\\{[^}]*animation:[^;]*${animName}[^}]*\\}`,
    'gs'
  );
  css = css.replace(classRegex, '');
});

// Remove duplicate float definition (keep first one)
console.log('Removing duplicate float animation...');
const floatMatches = css.match(/@keyframes float\s*\{[^}]*\}/gs);
if (floatMatches && floatMatches.length > 1) {
  // Remove second occurrence
  const firstIndex = css.indexOf(floatMatches[0]);
  const secondIndex = css.indexOf(floatMatches[1], firstIndex + floatMatches[0].length);
  css = css.substring(0, secondIndex) + css.substring(secondIndex + floatMatches[1].length);
}

// Remove duplicate uploadPulse definition
console.log('Removing duplicate uploadPulse animation...');
const uploadPulseMatches = css.match(/@keyframes uploadPulse\s*\{[^}]*\}/gs);
if (uploadPulseMatches && uploadPulseMatches.length > 1) {
  const firstIndex = css.indexOf(uploadPulseMatches[0]);
  const secondIndex = css.indexOf(uploadPulseMatches[1], firstIndex + uploadPulseMatches[0].length);
  css = css.substring(0, secondIndex) + css.substring(secondIndex + uploadPulseMatches[1].length);
}

// Remove excessive empty lines (more than 2 consecutive)
css = css.replace(/\n{4,}/g, '\n\n\n');

// Remove trailing whitespace
css = css.split('\n').map(line => line.trimEnd()).join('\n');

const optimizedLines = css.split('\n').length;
const reduction = ((originalLines - optimizedLines) / originalLines * 100).toFixed(1);

console.log(`\nOptimized file: ${optimizedLines} lines`);
console.log(`Reduction: ${originalLines - optimizedLines} lines (${reduction}%)`);
console.log(`Target: Under 2,000 lines`);
console.log(`Status: ${optimizedLines < 2000 ? '✓ Target met!' : '✗ Further optimization needed'}`);

fs.writeFileSync(OUTPUT_FILE, css, 'utf8');
console.log(`\nOptimized CSS written to: ${OUTPUT_FILE}`);
console.log('\nNext steps:');
console.log('1. Review the optimized file');
console.log('2. Test the application to ensure no visual regressions');
console.log('3. Replace globals.css with globals.optimized.css');
console.log('4. Configure PostCSS for further minification');
