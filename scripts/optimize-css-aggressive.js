#!/usr/bin/env node

/**
 * Aggressive CSS Optimization Script
 * Consolidates animations using CSS variables and removes redundant rules
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../src/app/globals.optimized.css');
const OUTPUT_FILE = path.join(__dirname, '../src/app/globals.final.css');

console.log('Reading optimized CSS file...');
let css = fs.readFileSync(INPUT_FILE, 'utf8');

const originalLines = css.split('\n').length;
console.log(`Input file: ${originalLines} lines`);

// Consolidate pulse animations into one with CSS variables
console.log('\nConsolidating pulse animations...');
const pulseConsolidated = `
/* Consolidated Pulse Animation */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--pulse-color-start, rgba(37, 99, 235, 0.4)),
                0 0 40px var(--pulse-color-end, rgba(37, 99, 235, 0.2));
  }
  50% {
    box-shadow: 0 0 30px var(--pulse-color-mid, rgba(37, 99, 235, 0.6)),
                0 0 60px var(--pulse-color-end, rgba(37, 99, 235, 0.3));
  }
}

.pulse-glow-blue, .pulse-glow-cyan {
  --pulse-color-start: rgba(37, 99, 235, 0.4);
  --pulse-color-mid: rgba(37, 99, 235, 0.6);
  --pulse-color-end: rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.pulse-glow-blue:hover, .pulse-glow-cyan:hover {
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-glow-violet {
  --pulse-color-start: rgba(168, 85, 247, 0.4);
  --pulse-color-mid: rgba(168, 85, 247, 0.6);
  --pulse-color-end: rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
}

.pulse-glow-violet:hover {
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-glow-orange, .pulse-glow-yellow {
  --pulse-color-start: rgba(251, 146, 60, 0.4);
  --pulse-color-mid: rgba(251, 146, 60, 0.6);
  --pulse-color-end: rgba(251, 146, 60, 0.3);
  transition: all 0.3s ease;
}

.pulse-glow-orange:hover, .pulse-glow-yellow:hover {
  animation: pulse 1.5s ease-in-out infinite;
}
`;

// Remove individual pulse animations
css = css.replace(/@keyframes pulseBlue\s*\{[^}]*\}/gs, '');
css = css.replace(/@keyframes pulseViolet\s*\{[^}]*\}/gs, '');
css = css.replace(/@keyframes pulseOrange\s*\{[^}]*\}/gs, '');
css = css.replace(/\.pulse-glow-blue[^}]*\}[\s\S]*?\.pulse-glow-cyan:hover[^}]*\}/gs, '');
css = css.replace(/\.pulse-glow-violet[^}]*\}[\s\S]*?\.pulse-glow-violet:hover[^}]*\}/gs, '');
css = css.replace(/\.pulse-glow-orange[^}]*\}[\s\S]*?\.pulse-glow-yellow:hover[^}]*\}/gs, '');

// Add consolidated version
css = css.replace('/* Pulse Glow Effect - Blue & Cyan */', pulseConsolidated);

// Consolidate gradient text classes
console.log('Consolidating gradient text classes...');
const gradientTextConsolidated = `
/* Consolidated Gradient Text */
.gradient-text-blue, .gradient-text-cyan {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-orange, .gradient-text-yellow {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-violet {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`;

// Remove individual gradient text definitions
css = css.replace(/\.gradient-text-blue\s*\{[^}]*\}/gs, '');
css = css.replace(/\.gradient-text-cyan\s*\{[^}]*\}/gs, '');
css = css.replace(/\.gradient-text-orange\s*\{[^}]*\}/gs, '');
css = css.replace(/\.gradient-text-yellow\s*\{[^}]*\}/gs, '');
css = css.replace(/\.gradient-text-violet\s*\{[^}]*\}/gs, '');

// Add consolidated version
css = css.replace('/* Gradient Text - Defined as standard utilities */', gradientTextConsolidated);

// Consolidate orb classes
console.log('Consolidating orb classes...');
const orbConsolidated = `
/* Consolidated Orb Styles */
.orb {
  border-radius: 50%;
  filter: blur(60px);
  animation: float 6s ease-in-out infinite;
}

.orb-blue, .orb-cyan {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(37, 99, 235, 0) 70%);
}

.orb-violet {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 70%);
}

.orb-orange, .orb-yellow {
  background: radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(251, 146, 60, 0) 70%);
}
`;

css = css.replace(/\/\* Floating Orbs \*\/[\s\S]*?\.orb-orange, \.orb-yellow \{[^}]*\}/s, orbConsolidated);

// Remove excessive comments
console.log('Removing verbose comments...');
css = css.replace(/\/\* ={40,} \*\//g, '');
css = css.replace(/\/\*\s*={10,}\s*\n[\s\S]*?\n\s*={10,}\s*\*\//g, '');

// Consolidate multiple empty lines
css = css.replace(/\n{4,}/g, '\n\n');

const optimizedLines = css.split('\n').length;
const reduction = ((originalLines - optimizedLines) / originalLines * 100).toFixed(1);

console.log(`\nFinal optimized file: ${optimizedLines} lines`);
console.log(`Reduction from input: ${originalLines - optimizedLines} lines (${reduction}%)`);
console.log(`Target: Under 2,000 lines`);
console.log(`Status: ${optimizedLines < 2000 ? '✓ Target met!' : '✗ Further optimization needed'}`);

fs.writeFileSync(OUTPUT_FILE, css, 'utf8');
console.log(`\nFinal CSS written to: ${OUTPUT_FILE}`);
