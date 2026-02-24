#!/usr/bin/env node

/**
 * Performance Metrics Validation Script
 * 
 * Validates that production build meets target performance metrics:
 * - Page load: 2-3 seconds (60% improvement)
 * - API response: 200-400ms (70% improvement)
 * - Payload size: 20-30KB (50% reduction)
 * - Bundle size: 400-500KB (30% reduction)
 * 
 * Requirements: 8.5
 */

const fs = require('fs');
const path = require('path');

// Target metrics
const TARGETS = {
  pageLoad: { min: 2000, max: 3000, unit: 'ms', name: 'Page Load Time' },
  apiResponse: { min: 200, max: 400, unit: 'ms', name: 'API Response Time' },
  payloadSize: { min: 20 * 1024, max: 30 * 1024, unit: 'bytes', name: 'Payload Size' },
  bundleSize: { min: 400 * 1024, max: 500 * 1024, unit: 'bytes', name: 'Bundle Size' },
};

// Baseline metrics (before optimization)
const BASELINE = {
  pageLoad: { min: 4000, max: 6000 },
  apiResponse: { min: 800, max: 1200 },
  payloadSize: { min: 50 * 1024, max: 80 * 1024 },
  bundleSize: { min: 600 * 1024, max: 800 * 1024 },
};

/**
 * Calculate improvement percentage
 */
function calculateImprovement(baseline, target) {
  const baselineAvg = (baseline.min + baseline.max) / 2;
  const targetAvg = (target.min + target.max) / 2;
  return ((baselineAvg - targetAvg) / baselineAvg) * 100;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get bundle size from build output
 */
function getBundleSize() {
  try {
    const nextDir = path.join(process.cwd(), '.next');
    
    // Check if build exists
    if (!fs.existsSync(nextDir)) {
      console.log('⚠️  No production build found. Run "npm run build" first.');
      return null;
    }

    // Read build manifest
    const manifestPath = path.join(nextDir, 'build-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.log('⚠️  Build manifest not found.');
      return null;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // Calculate total JS bundle size
    let totalJsSize = 0;
    let fileCount = 0;
    const pages = manifest.pages || {};
    
    for (const page of Object.keys(pages)) {
      const files = pages[page] || [];
      for (const file of files) {
        if (file.endsWith('.js')) {
          try {
            const filePath = path.join(nextDir, file);
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              totalJsSize += stats.size;
              fileCount++;
            }
          } catch (error) {
            // Skip files that don't exist
          }
        }
      }
    }

    // Calculate CSS bundle size
    let totalCssSize = 0;
    const cssDir = path.join(nextDir, 'static', 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      for (const file of cssFiles) {
        if (file.endsWith('.css')) {
          const filePath = path.join(cssDir, file);
          const stats = fs.statSync(filePath);
          totalCssSize += stats.size;
        }
      }
    }

    return {
      js: totalJsSize,
      css: totalCssSize,
      total: totalJsSize + totalCssSize,
      fileCount,
    };
  } catch (error) {
    console.error('Error reading bundle size:', error.message);
    return null;
  }
}

/**
 * Validate metric against target
 */
function validateMetric(name, actual, target) {
  const inRange = actual >= target.min && actual <= target.max;
  const status = inRange ? '✓' : '✗';
  const color = inRange ? '\x1b[32m' : '\x1b[31m'; // Green or Red
  const reset = '\x1b[0m';
  
  return {
    name,
    actual,
    target: `${target.min}-${target.max} ${target.unit}`,
    inRange,
    status: `${color}${status}${reset}`,
  };
}

/**
 * Main validation function
 */
function validatePerformanceMetrics() {
  console.log('\n=== Performance Metrics Validation ===\n');

  const results = [];
  let allTargetsMet = true;

  // 1. Validate Bundle Size
  console.log('📦 Checking bundle sizes...');
  const bundleSize = getBundleSize();
  
  if (bundleSize) {
    console.log(`   JS Bundle: ${formatBytes(bundleSize.js)} (${bundleSize.fileCount} files)`);
    console.log(`   CSS Bundle: ${formatBytes(bundleSize.css)}`);
    console.log(`   Total Bundle: ${formatBytes(bundleSize.total)}\n`);
    
    const bundleResult = validateMetric(
      TARGETS.bundleSize.name,
      bundleSize.total,
      TARGETS.bundleSize
    );
    results.push(bundleResult);
    
    if (!bundleResult.inRange) {
      allTargetsMet = false;
      if (bundleSize.total > TARGETS.bundleSize.max) {
        console.log(`   ⚠️  Bundle size exceeds target by ${formatBytes(bundleSize.total - TARGETS.bundleSize.max)}`);
      } else {
        console.log(`   ℹ️  Bundle size is below minimum target (very good!)`);
      }
    }
    
    // Calculate improvement
    const improvement = calculateImprovement(BASELINE.bundleSize, TARGETS.bundleSize);
    console.log(`   Target Improvement: ${improvement.toFixed(1)}%\n`);
  } else {
    console.log('   ⚠️  Could not measure bundle size\n');
  }

  // 2. Validate Payload Size (estimated from bundle size)
  if (bundleSize) {
    console.log('📊 Checking payload sizes...');
    // Estimate payload size (compressed) as ~15% of bundle size
    const estimatedPayloadSize = bundleSize.total * 0.15;
    console.log(`   Estimated Payload: ${formatBytes(estimatedPayloadSize)} (compressed)\n`);
    
    const payloadResult = validateMetric(
      TARGETS.payloadSize.name,
      estimatedPayloadSize,
      TARGETS.payloadSize
    );
    results.push(payloadResult);
    
    if (!payloadResult.inRange) {
      allTargetsMet = false;
    }
    
    const improvement = calculateImprovement(BASELINE.payloadSize, TARGETS.payloadSize);
    console.log(`   Target Improvement: ${improvement.toFixed(1)}%\n`);
  }

  // 3. Page Load and API Response (informational - requires runtime measurement)
  console.log('⏱️  Runtime Metrics (require production measurement):');
  console.log(`   ${TARGETS.pageLoad.name}: Target ${TARGETS.pageLoad.min}-${TARGETS.pageLoad.max}${TARGETS.pageLoad.unit}`);
  console.log(`   ${TARGETS.apiResponse.name}: Target ${TARGETS.apiResponse.min}-${TARGETS.apiResponse.max}${TARGETS.apiResponse.unit}`);
  console.log('   ℹ️  Measure these in production using browser DevTools or Lighthouse\n');

  // Display results table
  console.log('=== Validation Results ===\n');
  console.log('Metric                    | Actual              | Target                  | Status');
  console.log('--------------------------|---------------------|-------------------------|-------');
  
  for (const result of results) {
    const actualStr = typeof result.actual === 'number' 
      ? formatBytes(result.actual).padEnd(19)
      : String(result.actual).padEnd(19);
    const targetStr = result.target.padEnd(23);
    const nameStr = result.name.padEnd(25);
    
    console.log(`${nameStr} | ${actualStr} | ${targetStr} | ${result.status}`);
  }
  
  console.log('\n=== Summary ===\n');
  
  if (allTargetsMet) {
    console.log('✅ All measurable targets met!');
  } else {
    console.log('❌ Some targets not met. Review the results above.');
  }
  
  console.log('\n=== Improvement Targets ===\n');
  console.log(`Page Load:    ${calculateImprovement(BASELINE.pageLoad, TARGETS.pageLoad).toFixed(1)}% improvement (target: 60%)`);
  console.log(`API Response: ${calculateImprovement(BASELINE.apiResponse, TARGETS.apiResponse).toFixed(1)}% improvement (target: 70%)`);
  console.log(`Payload Size: ${calculateImprovement(BASELINE.payloadSize, TARGETS.payloadSize).toFixed(1)}% reduction (target: 50%)`);
  console.log(`Bundle Size:  ${calculateImprovement(BASELINE.bundleSize, TARGETS.bundleSize).toFixed(1)}% reduction (target: 30%)`);
  
  console.log('\n=== Next Steps ===\n');
  console.log('1. Deploy to production or staging environment');
  console.log('2. Use Lighthouse to measure page load times');
  console.log('3. Use browser DevTools Network tab to measure API response times');
  console.log('4. Monitor performance metrics using the Performance Monitor service');
  console.log('5. Set up alerts for performance regressions\n');

  return allTargetsMet;
}

// Run validation
const success = validatePerformanceMetrics();
process.exit(success ? 0 : 1);
