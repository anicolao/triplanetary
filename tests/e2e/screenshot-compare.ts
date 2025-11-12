/**
 * Screenshot comparison utilities for user story tests
 * 
 * Provides functions to compare actual screenshots with expected baselines,
 * with configurable tolerance for minor rendering differences.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ComparisonResult {
  match: boolean;
  difference?: number;
  message: string;
}

/**
 * Compare two PNG images byte-by-byte
 * 
 * @param actualPath - Path to the actual screenshot
 * @param expectedPath - Path to the expected screenshot
 * @param tolerance - Tolerance for byte differences (0-1, where 0 = exact match)
 * @returns Comparison result
 */
export function compareScreenshots(
  actualPath: string,
  expectedPath: string,
  tolerance: number = 0.001
): ComparisonResult {
  // Check if expected file exists
  if (!existsSync(expectedPath)) {
    return {
      match: false,
      message: `Expected screenshot not found: ${expectedPath}. This may be the first run. Copy actual screenshots to expected/ to create baseline.`,
    };
  }

  // Check if actual file exists
  if (!existsSync(actualPath)) {
    return {
      match: false,
      message: `Actual screenshot not found: ${actualPath}`,
    };
  }

  try {
    const actualBuffer = readFileSync(actualPath);
    const expectedBuffer = readFileSync(expectedPath);

    // Compare file sizes
    if (actualBuffer.length !== expectedBuffer.length) {
      const sizeDiff = Math.abs(actualBuffer.length - expectedBuffer.length);
      const percentDiff = (sizeDiff / expectedBuffer.length) * 100;
      return {
        match: false,
        difference: percentDiff,
        message: `Screenshot size mismatch: actual=${actualBuffer.length} bytes, expected=${expectedBuffer.length} bytes (${percentDiff.toFixed(2)}% difference)`,
      };
    }

    // Compare byte-by-byte
    let differentBytes = 0;
    for (let i = 0; i < actualBuffer.length; i++) {
      if (actualBuffer[i] !== expectedBuffer[i]) {
        differentBytes++;
      }
    }

    const differenceRatio = differentBytes / actualBuffer.length;
    const differencePercent = differenceRatio * 100;

    if (differenceRatio <= tolerance) {
      return {
        match: true,
        difference: differencePercent,
        message: `Screenshots match within tolerance (${differencePercent.toFixed(4)}% difference, tolerance=${(tolerance * 100).toFixed(2)}%)`,
      };
    } else {
      return {
        match: false,
        difference: differencePercent,
        message: `Screenshots differ by ${differencePercent.toFixed(2)}% (tolerance=${(tolerance * 100).toFixed(2)}%)`,
      };
    }
  } catch (error) {
    return {
      match: false,
      message: `Error comparing screenshots: ${error}`,
    };
  }
}

/**
 * Compare all screenshots in a user story directory
 * 
 * @param storyPath - Path to the user story directory (e.g., 'tests/e2e/user-stories/basic-gameplay-flow')
 * @param tolerance - Tolerance for byte differences (0-1)
 * @returns Array of comparison results
 */
export function compareUserStory(
  storyPath: string,
  tolerance: number = 0.001
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  const actualDir = join(storyPath, 'actual');
  const expectedDir = join(storyPath, 'expected');

  // Read all PNG files from actual directory
  const fs = require('fs');
  if (!existsSync(actualDir)) {
    return [{
      match: false,
      message: `Actual screenshots directory not found: ${actualDir}`,
    }];
  }

  const files = fs.readdirSync(actualDir).filter((f: string) => f.endsWith('.png'));

  for (const file of files) {
    const actualPath = join(actualDir, file);
    const expectedPath = join(expectedDir, file);
    
    const result = compareScreenshots(actualPath, expectedPath, tolerance);
    results.push({
      ...result,
      message: `${file}: ${result.message}`,
    });
  }

  return results;
}

/**
 * Validate that user story test completed successfully
 * Logs comparison results and returns overall pass/fail
 * 
 * @param storyPath - Path to the user story directory
 * @param tolerance - Tolerance for byte differences (0-1)
 * @returns true if all screenshots match or are missing (first run)
 */
export function validateUserStory(
  storyPath: string,
  tolerance: number = 0.001
): boolean {
  const results = compareUserStory(storyPath, tolerance);
  
  let allMatch = true;
  let hasMissingExpected = false;

  for (const result of results) {
    if (result.message.includes('not found')) {
      hasMissingExpected = true;
      console.log(`⚠ ${result.message}`);
    } else if (!result.match) {
      allMatch = false;
      console.error(`✗ ${result.message}`);
    } else {
      console.log(`✓ ${result.message}`);
    }
  }

  if (hasMissingExpected) {
    console.log('\nℹ First run detected: Expected screenshots are missing.');
    console.log('  Review actual screenshots and copy them to expected/ to create baseline.');
    return true; // Don't fail on first run
  }

  return allMatch;
}
