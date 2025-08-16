#!/usr/bin/env node --import tsx/esm
/* eslint-disable no-console */
/**
 * 📊 GENERATE PERFORMANCE STATS FOR JSON EXAMPLES
 * 
 * This script analyzes all JSON example files and generates comprehensive
 * performance statistics for the jsonToLLMString function.
 * 
 * Features:
 * - Token count analysis using Microsoft TikTokenizer
 * - Processing time measurements
 * - Character and token reduction percentages
 * - Cost savings calculations
 * - Performance comparisons across different file types
 * 
 * @author Octocode Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { jsonToLLMString } from '../src/jsonToLLMString';

// Import Microsoft's TikTokenizer for accurate GPT token counting
import { createByModelName } from '@microsoft/tiktokenizer';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

/**
 * Accurate token counting using Microsoft's TikTokenizer
 */
async function countTokens(text: string): Promise<number> {
  try {
    const tokenizer = await createByModelName('gpt-4');
    const tokens = tokenizer.encode(text);
    return tokens.length;
  } catch (error) {
    console.warn('⚠️  TikTokenizer failed, using fallback estimation:', error);
    return Math.ceil(text.length / 4);
  }
}

/**
 * Analyze a single JSON file and return performance metrics
 */
async function analyzeJsonFile(filename: string): Promise<{
  filename: string;
  originalTokens: number;
  llmTokens: number;
  reductionPercent: number;
  originalChars: number;
  llmChars: number;
  processingTimeMs: number;
  costSavingsUsd: number;
  tokenEfficiency: number;
}> {
  const filePath = path.join(__dirname, filename);
  const jsonContent = fs.readFileSync(filePath, 'utf-8');
  const jsonObject = JSON.parse(jsonContent);

  // Format original JSON for comparison
  const originalFormatted = JSON.stringify(jsonObject, null, 2);

  // Measure processing time
  const startTime = performance.now();
  const llmFormatted = jsonToLLMString(jsonObject);
  const endTime = performance.now();
  
  const processingTimeMs = endTime - startTime;

  // Calculate metrics
  const originalChars = originalFormatted.length;
  const llmChars = llmFormatted.length;

  // Token counting
  const originalTokens = await countTokens(originalFormatted);
  const llmTokens = await countTokens(llmFormatted);

  const reductionPercent = ((originalTokens - llmTokens) / originalTokens) * 100;
  const costSavingsUsd = (originalTokens - llmTokens) * 0.00003; // GPT-4 pricing
  const tokenEfficiency = originalChars / originalTokens;

  return {
    filename,
    originalTokens,
    llmTokens,
    reductionPercent,
    originalChars,
    llmChars,
    processingTimeMs,
    costSavingsUsd,
    tokenEfficiency,
  };
}

/**
 * Main function to generate comprehensive statistics
 */
async function generateStats(): Promise<void> {
  console.log(`${colors.bright}${colors.cyan}📊 Generating Performance Statistics${colors.reset}`);
  console.log(`${colors.cyan}   Analyzing JSON examples with Microsoft TikTokenizer${colors.reset}\n`);

  // Define all JSON example files
  const jsonFiles = [
    'github-repo-search.json',
    'npm-package-info.json',
    'github-code-search.json',
    'github-pull-request.json',
    'mixed-responses.json',
    'github-fetch-content.json'
  ];

  const results = [];
  
  // Analyze each file
  for (const filename of jsonFiles) {
    console.log(`${colors.blue}📄 Analyzing: ${filename}${colors.reset}`);
    
    try {
      const stats = await analyzeJsonFile(filename);
      results.push(stats);
      
      console.log(`   ${colors.green}✅ Tokens: ${stats.originalTokens} → ${stats.llmTokens} (${stats.reductionPercent.toFixed(1)}% reduction)${colors.reset}`);
      console.log(`   ⚡ Processing: ${stats.processingTimeMs.toFixed(2)}ms`);
      console.log(`   💰 Cost savings: $${stats.costSavingsUsd.toFixed(4)}\n`);
      
    } catch (error) {
      console.error(`   ❌ Error analyzing ${filename}:`, error);
    }
  }

  // Calculate aggregate statistics
  const totalOriginalTokens = results.reduce((sum, r) => sum + r.originalTokens, 0);
  const totalLlmTokens = results.reduce((sum, r) => sum + r.llmTokens, 0);
  const totalOriginalChars = results.reduce((sum, r) => sum + r.originalChars, 0);
  const totalLlmChars = results.reduce((sum, r) => sum + r.llmChars, 0);
  const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);
  const totalCostSavings = results.reduce((sum, r) => sum + r.costSavingsUsd, 0);
  
  const overallTokenReduction = ((totalOriginalTokens - totalLlmTokens) / totalOriginalTokens) * 100;
  const overallCharReduction = ((totalOriginalChars - totalLlmChars) / totalOriginalChars) * 100;
  const avgProcessingTime = totalProcessingTime / results.length;
  
  // Find best performers
  const bestReduction = results.reduce((best, current) =>
    current.reductionPercent > best.reductionPercent ? current : best
  );
  const fastestProcessing = results.reduce((fastest, current) =>
    current.processingTimeMs < fastest.processingTimeMs ? current : fastest
  );
  const largestSavings = results.reduce((largest, current) =>
    current.originalTokens - current.llmTokens > largest.originalTokens - largest.llmTokens
      ? current : largest
  );

  // Create comprehensive stats object
  const statsData = {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    summary: {
      totalFiles: results.length,
      totalOriginalTokens,
      totalLlmTokens,
      overallTokenReduction: parseFloat(overallTokenReduction.toFixed(1)),
      overallCharReduction: parseFloat(overallCharReduction.toFixed(1)),
      totalCostSavings: parseFloat(totalCostSavings.toFixed(4)),
      avgProcessingTimeMs: parseFloat(avgProcessingTime.toFixed(2)),
      processingSpeedTokensPerSecond: Math.round(totalOriginalTokens / (totalProcessingTime / 1000))
    },
    topPerformers: {
      bestTokenReduction: {
        filename: bestReduction.filename,
        percentage: parseFloat(bestReduction.reductionPercent.toFixed(1))
      },
      fastestProcessing: {
        filename: fastestProcessing.filename,
        timeMs: parseFloat(fastestProcessing.processingTimeMs.toFixed(2))
      },
      largestTokenSavings: {
        filename: largestSavings.filename,
        tokensSaved: largestSavings.originalTokens - largestSavings.llmTokens
      }
    },
    detailedResults: results.map(r => ({
      filename: r.filename,
      originalTokens: r.originalTokens,
      llmTokens: r.llmTokens,
      tokenReduction: parseFloat(r.reductionPercent.toFixed(1)),
      originalChars: r.originalChars,
      llmChars: r.llmChars,
      charReduction: parseFloat((((r.originalChars - r.llmChars) / r.originalChars) * 100).toFixed(1)),
      processingTimeMs: parseFloat(r.processingTimeMs.toFixed(2)),
      costSavingsUsd: parseFloat(r.costSavingsUsd.toFixed(4)),
      tokenEfficiency: parseFloat(r.tokenEfficiency.toFixed(1))
    })),
    methodology: {
      tokenizer: "Microsoft TikTokenizer (GPT-4)",
      pricingModel: "GPT-4: $0.03 per 1K tokens",
      measurements: "Real-time performance with perf_hooks",
      dateGenerated: new Date().toISOString()
    }
  };

  // Write stats to JSON file
  const statsPath = path.join(__dirname, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(statsData, null, 2), 'utf-8');

  // Display summary
  console.log(`${colors.bright}${colors.magenta}📊 PERFORMANCE SUMMARY${colors.reset}`);
  console.log(`${colors.green}✅ Files analyzed: ${results.length}${colors.reset}`);
  console.log(`${colors.green}🏆 Overall token reduction: ${overallTokenReduction.toFixed(1)}%${colors.reset}`);
  console.log(`${colors.green}💰 Total cost savings: $${totalCostSavings.toFixed(4)}${colors.reset}`);
  console.log(`${colors.green}⚡ Average processing: ${avgProcessingTime.toFixed(2)}ms${colors.reset}`);
  console.log(`${colors.green}🚀 Processing speed: ${Math.round(totalOriginalTokens / (totalProcessingTime / 1000)).toLocaleString()} tokens/sec${colors.reset}`);

  console.log(`\n${colors.bright}${colors.yellow}🏅 TOP PERFORMERS${colors.reset}`);
  console.log(`${colors.yellow}🥇 Best reduction: ${bestReduction.filename} (${bestReduction.reductionPercent.toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.yellow}⚡ Fastest: ${fastestProcessing.filename} (${fastestProcessing.processingTimeMs.toFixed(2)}ms)${colors.reset}`);
  console.log(`${colors.yellow}💎 Largest savings: ${largestSavings.filename} (${(largestSavings.originalTokens - largestSavings.llmTokens).toLocaleString()} tokens)${colors.reset}`);

  console.log(`\n${colors.cyan}📁 Stats saved to: ${statsPath}${colors.reset}`);
  console.log(`${colors.cyan}🔧 Use 'npm run examples:stats' to regenerate${colors.reset}`);
}

// Run the script
generateStats().catch(error => {
  console.error(`${colors.bright}❌ Failed to generate stats:${colors.reset}`, error);
  console.error('💡 Make sure @microsoft/tiktokenizer is installed');
  process.exit(1);
});
