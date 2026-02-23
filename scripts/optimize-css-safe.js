#!/usr/bin/env node

/**
 * Safe CSS Optimization Script
 * Only removes confirmed unused animations
 */

const fs = require('fs');
const path = require('path');

const CSS_FILE = path.join(__dirname, '../src/app/globals.css');
const OUTPUT_FILE = path.join(__dirname, '../src/app/globals.css');

// List of animations confirmed unused (not found in any component)
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
const originalSize = Buffer.byteLength(css, 'utf8');
console.log(`Original file: ${originalLines} lines, ${(originalSize / 1024).toFixed(2)} KB`);

// Remove unused animations
UNUSED_ANIMATIONS.forEach(animName => {
  console.log(`Removing animation: ${animName}`);
  
  // Remove @keyframes definition with all its content
  const keyframesRegex = new RegExp(
    `@keyframes\\s+${animName}\\s*\\{[^}]*(?:\\{[^}]*\\}[^}]*)*\\}`,
    'gs'
  );
  css = css.replace(keyframesRegex, '');
  
  // Remove class definitions that reference this animation
  const classRegex = new RegExp(
    `\\.(?:text-)?${animName}(?:-\\w+)?\\s*\\{[^}]*\\}`,
    'gs'
  );
  css = css.replace(classRegex, '');
});

// Remove excessive empty lines (more than 2 consecutive)
css = css.replace(/\n{4,}/g, '\n\n\n');

const optimizedLines = css.split('\n').length;
const optimizedSize = Buffer.byteLength(css, 'utf8');
const reduction = ((originalLines - optimizedLines) / originalLines * 100).toFixed(1);
const sizeReduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

console.log(`\nOptimized file: ${optimizedLines} lines, ${(optimizedSize / 1024).toFixed(2)} KB`);
console.log(`Line reduction: ${originalLines - optimizedLines} lines (${reduction}%)`);
console.log(`Size reduction: ${((originalSize - optimizedSize) / 1024).toFixed(2)} KB (${sizeReduction}%)`);
console.log(`\nWith PostCSS minification in production, expect additional 30-40% reduction`);

fs.writeFileSync(OUTPUT_FILE, css, 'utf8');
console.log(`\nOptimized CSS written to: ${OUTPUT_FILE}`);
