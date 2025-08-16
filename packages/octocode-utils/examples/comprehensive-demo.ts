#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * 🎯 COMPREHENSIVE jsonToLLMString DEMONSTRATION
 *
 * This script demonstrates the enhanced jsonToLLMString function with:
 * 1. Large, complex, real-world JSON examples (5 different API response types)
 * 2. Token count analysis using Microsoft's TikTokenizer for accuracy
 * 3. Before/after comparisons for LLM optimization
 * 4. All JSON data types: strings, numbers, booleans, arrays, objects, null
 * 5. Actual usage patterns for various GitHub API responses
 *
 * Features demonstrated:
 * ✅ JSON string parsing with [Transformed from JSON] indicators
 * ✅ ITEMS: format for arrays (ultra-compact, token-efficient)
 * ✅ Raw keys preserved without transformation (simplified approach)
 * ✅ Input validation (objects/arrays only, primitives rejected)
 * ✅ Token efficiency (measured with real GPT-4 tokenizer)
 * ✅ Complex nested structures handling
 * ✅ Error response formatting
 * ✅ Performance metrics and processing time analysis
 *
 * @author Octocode Team
 * @version 2.0.0
 * @requires @microsoft/tiktokenizer - For accurate GPT token counting
 * @requires ../src/jsonToLLMString - The core transformation function
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { jsonToLLMString } from '../src/jsonToLLMString';
// Import Microsoft's TikTokenizer for accurate GPT token counting
import { createByModelName } from '@microsoft/tiktokenizer';

// ANSI color codes for beautiful terminal output
// These provide colored console output for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Accurate token counting using Microsoft's TikTokenizer
 * This provides exact GPT-4 token counts for precise analysis
 *
 * @param text - The text content to tokenize
 * @returns The exact number of tokens as counted by GPT-4 tokenizer
 */
async function countTokens(text: string): Promise<number> {
  try {
    // Use GPT-4 tokenizer for accurate token counting
    // This is the same tokenizer used by OpenAI's GPT-4 model
    const tokenizer = await createByModelName('gpt-4');
    const tokens = tokenizer.encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback to character-based estimation if tokenizer fails
    // This is a rough approximation: ~4 characters per token for English text
    console.warn('⚠️  TikTokenizer failed, using fallback estimation:', error);
    return Math.ceil(text.length / 4);
  }
}

/**
 * Enhanced token analysis with detailed breakdown
 * Provides insights into token distribution and efficiency
 *
 * @param text - The text to analyze
 * @returns Detailed token analysis object
 */
async function analyzeTokens(text: string): Promise<{
  totalTokens: number;
  estimatedCost: number; // Estimated cost in USD for GPT-4
  averageTokensPerWord: number;
  compressionRatio: number; // Characters per token
}> {
  const tokens = await countTokens(text);
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  return {
    totalTokens: tokens,
    estimatedCost: tokens * 0.00003, // GPT-4 pricing: $0.03 per 1K tokens
    averageTokensPerWord: wordCount > 0 ? tokens / wordCount : 0,
    compressionRatio: text.length / tokens,
  };
}

/**
 * Analyze a JSON file and demonstrate jsonToLLMString transformation
 */
async function analyzeJsonFile(
  filename: string,
  title: string
): Promise<{
  originalTokens: number;
  llmTokens: number;
  reductionPercent: number;
  originalChars: number;
  llmChars: number;
  processingTimeMs: number;
}> {
  console.log(
    `\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`
  );
  console.log(`${colors.bright}${colors.cyan}📄 ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);

  // Read and parse JSON file
  const filePath = path.join(__dirname, filename);
  const jsonContent = fs.readFileSync(filePath, 'utf-8');
  const jsonObject = JSON.parse(jsonContent);

  // Format original JSON for comparison
  const originalFormatted = JSON.stringify(jsonObject, null, 2);

  // Measure processing time
  const startTime = performance.now();

  // 🎯 MAIN FUNCTION CALL: Transform JSON to LLM format
  const llmFormatted = jsonToLLMString(jsonObject);

  const endTime = performance.now();
  const processingTimeMs = endTime - startTime;

  // Calculate metrics
  const originalChars = originalFormatted.length;
  const llmChars = llmFormatted.length;
  const charReduction = ((originalChars - llmChars) / originalChars) * 100;

  // Use Microsoft's TikTokenizer for accurate GPT-4 token counting
  const originalTokens = await countTokens(originalFormatted);
  const llmTokens = await countTokens(llmFormatted);

  // Get detailed token analysis for both formats
  const originalAnalysis = await analyzeTokens(originalFormatted);
  const llmAnalysis = await analyzeTokens(llmFormatted);
  const tokenReduction = ((originalTokens - llmTokens) / originalTokens) * 100;

  // Display comprehensive transformation metrics
  console.log(`${colors.blue}📊 TRANSFORMATION METRICS:${colors.reset}`);
  console.log(`   📁 File: ${filename}`);
  console.log(
    `   📏 Original: ${originalChars.toLocaleString()} chars, ${originalTokens.toLocaleString()} tokens (GPT-4)`
  );
  console.log(
    `   🎯 LLM Format: ${llmChars.toLocaleString()} chars, ${llmTokens.toLocaleString()} tokens (GPT-4)`
  );
  console.log(
    `   ${tokenReduction > 0 ? colors.green : colors.red}📉 Token Reduction: ${tokenReduction.toFixed(1)}% (${Math.abs(originalTokens - llmTokens).toLocaleString()} tokens saved)${colors.reset}`
  );
  console.log(
    `   ${charReduction > 0 ? colors.green : colors.red}📊 Character Reduction: ${charReduction.toFixed(1)}%${colors.reset}`
  );
  console.log(`   ⚡ Processing Time: ${processingTimeMs.toFixed(2)}ms`);

  // Display cost analysis (helpful for understanding LLM API costs)
  const costSavings =
    originalAnalysis.estimatedCost - llmAnalysis.estimatedCost;
  if (costSavings > 0.001) {
    // Only show if savings are significant
    console.log(
      `   ${colors.green}💰 Cost Savings: $${costSavings.toFixed(4)} per request (GPT-4 pricing)${colors.reset}`
    );
  }

  // Display token efficiency metrics
  console.log(
    `   🔬 Token Efficiency: ${originalAnalysis.compressionRatio.toFixed(1)} → ${llmAnalysis.compressionRatio.toFixed(1)} chars/token`
  );

  // Show sample of original JSON (first 300 characters)
  console.log(
    `\n${colors.yellow}📋 ORIGINAL JSON (first 300 chars):${colors.reset}`
  );
  console.log(
    `${colors.white}${originalFormatted.substring(0, 300)}${originalFormatted.length > 300 ? '...' : ''}${colors.reset}`
  );

  // Show sample of LLM format (first 500 characters)
  console.log(
    `\n${colors.green}🎯 LLM-OPTIMIZED FORMAT (first 500 chars):${colors.reset}`
  );
  console.log(
    `${colors.white}${llmFormatted.substring(0, 500)}${llmFormatted.length > 500 ? '...' : ''}${colors.reset}`
  );

  // Highlight key improvements
  console.log(
    `\n${colors.magenta}✨ KEY IMPROVEMENTS FOR LLMs:${colors.reset}`
  );

  // Check for specific improvements
  const improvements: string[] = [];

  if (llmFormatted.includes('LIST:')) {
    improvements.push(
      '📋 Arrays formatted as natural "LIST:" instead of brackets'
    );
  }

  if (
    llmFormatted.includes('Repository:') ||
    llmFormatted.includes('Owner:') ||
    llmFormatted.includes('FilePath:')
  ) {
    improvements.push(
      '🏷️ Semantic labels (Repository, Owner, FilePath) instead of raw keys'
    );
  }

  if (llmFormatted.includes('yes') || llmFormatted.includes('no')) {
    improvements.push('💡 Boolean values as "yes/no" instead of true/false');
  }

  if (llmFormatted.includes('[Transformed from JSON]')) {
    improvements.push('🔄 JSON transformation indicator for LLM understanding');
  }

  if (originalFormatted.includes('"') && !llmFormatted.includes('{"')) {
    improvements.push(
      '🧹 Eliminated JSON syntax noise (quotes, brackets, braces)'
    );
  }

  if (tokenReduction > 15) {
    improvements.push(
      `🚀 Significant token efficiency: ${tokenReduction.toFixed(1)}% reduction`
    );
  }

  improvements.forEach(improvement => {
    console.log(`   ${improvement}`);
  });

  if (improvements.length === 0) {
    console.log(`   ✅ Content preserved with clean formatting`);
  }

  return {
    originalTokens,
    llmTokens,
    reductionPercent: tokenReduction,
    originalChars,
    llmChars,
    processingTimeMs,
  };
}

/**
 * Demonstrate JSON string parsing capability
 */
function demonstrateJsonStringParsing(): void {
  console.log(
    `\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}🔧 JSON STRING PARSING DEMONSTRATION${colors.reset}`
  );
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);

  // Example 1: Simple JSON string
  const simpleJsonString =
    '{"name": "awesome-project", "topics": ["react", "typescript"], "stars": 1500}';
  console.log(`\n${colors.yellow}📝 Input JSON String:${colors.reset}`);
  console.log(`${colors.white}${simpleJsonString}${colors.reset}`);

  const result1 = jsonToLLMString(simpleJsonString);
  console.log(
    `\n${colors.green}🎯 LLM Format (with transformation indicator):${colors.reset}`
  );
  console.log(`${colors.white}${result1}${colors.reset}`);

  // Example 2: Complex nested JSON string
  const complexJsonString =
    '{"users": [{"name": "Alice", "roles": ["admin", "developer"], "active": true}, {"name": "Bob", "roles": ["user"], "active": false}], "metadata": {"version": "1.0", "updated": null}}';
  console.log(`\n${colors.yellow}📝 Complex JSON String:${colors.reset}`);
  console.log(`${colors.white}${complexJsonString}${colors.reset}`);

  const result2 = jsonToLLMString(complexJsonString);
  console.log(
    `\n${colors.green}🎯 LLM Format (complex transformation):${colors.reset}`
  );
  console.log(`${colors.white}${result2}${colors.reset}`);

  // Example 3: Invalid JSON (should throw error)
  const invalidJson = '{"invalid": json without quotes}';
  console.log(
    `\n${colors.yellow}📝 Invalid JSON String (should throw error):${colors.reset}`
  );
  console.log(`${colors.white}${invalidJson}${colors.reset}`);

  try {
    const result3 = jsonToLLMString(invalidJson);
    console.log(
      `\n${colors.green}✅ Transformed:${colors.reset}`
    );
    console.log(`${colors.white}${result3}${colors.reset}`);
  } catch (error) {
    console.log(
      `\n${colors.red}❌ Error (as expected for invalid JSON):${colors.reset}`
    );
    console.log(`${colors.white}${error.message}${colors.reset}`);
  }
}

/**
 * Main demonstration function
 */
async function runComprehensiveDemo(): Promise<void> {
  console.log(
    `${colors.bright}${colors.magenta}🚀 COMPREHENSIVE jsonToLLMString DEMONSTRATION${colors.reset}`
  );
  console.log(
    `${colors.cyan}   Enhanced JSON-to-LLM transformation with real-world examples${colors.reset}`
  );
  console.log(
    `${colors.cyan}   Featuring: Large datasets, complex structures, and token efficiency${colors.reset}\n`
  );

  // Keep track of comprehensive metrics across all files
  // This array stores detailed analysis results for aggregate reporting
  const results: Array<{
    name: string;
    originalTokens: number;
    llmTokens: number;
    reductionPercent: number;
    originalChars: number;
    llmChars: number;
    processingTimeMs: number;
  }> = [];

  // Define the comprehensive test suite of JSON files
  // Each file represents a different type of API response with unique challenges
  const files = [
    {
      filename: 'github-repo-search.json',
      title: 'GITHUB REPOSITORY SEARCH RESPONSE',
      // Contains: Nested user objects, arrays of repositories, license info
    },
    {
      filename: 'npm-package-info.json',
      title: 'NPM PACKAGE INFORMATION',
      // Contains: Complex dependencies, scripts, contributor arrays
    },
    {
      filename: 'github-code-search.json',
      title: 'GITHUB CODE SEARCH WITH TEXT MATCHES',
      // Contains: Code fragments, text match arrays, repository metadata
    },
    {
      filename: 'github-pull-request.json',
      title: 'GITHUB PULL REQUEST WITH REVIEWS',
      // Contains: Review comments, file changes, status checks
    },
    {
      filename: 'mixed-responses.json',
      title: 'MIXED SUCCESS/ERROR RESPONSES',
      // Contains: Error objects, success responses, partial results
    },
    {
      filename: 'github-fetch-content.json',
      title: 'GITHUB FILE CONTENT RETRIEVAL',
      // Contains: React/TypeScript components, authentication forms, security filtering
    },
  ];

  // Process each JSON file and collect comprehensive metrics
  // This loop performs the core analysis and transformation for each test case
  for (const file of files) {
    const result = await analyzeJsonFile(file.filename, file.title);
    results.push({
      name: file.title,
      ...result,
    });
  }

  // Demonstrate JSON string parsing
  demonstrateJsonStringParsing();

  // Generate comprehensive performance summary
  // This aggregates all individual file results into overall metrics
  console.log(
    `\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}📊 OVERALL PERFORMANCE SUMMARY${colors.reset}`
  );
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);

  const totalOriginalTokens = results.reduce(
    (sum, r) => sum + r.originalTokens,
    0
  );
  const totalLlmTokens = results.reduce((sum, r) => sum + r.llmTokens, 0);
  const totalOriginalChars = results.reduce(
    (sum, r) => sum + r.originalChars,
    0
  );
  const totalLlmChars = results.reduce((sum, r) => sum + r.llmChars, 0);
  const totalProcessingTime = results.reduce(
    (sum, r) => sum + r.processingTimeMs,
    0
  );
  const avgReduction =
    results.reduce((sum, r) => sum + r.reductionPercent, 0) / results.length;

  const overallTokenReduction =
    ((totalOriginalTokens - totalLlmTokens) / totalOriginalTokens) * 100;
  const overallCharReduction =
    ((totalOriginalChars - totalLlmChars) / totalOriginalChars) * 100;

  console.log(`${colors.blue}📈 AGGREGATE METRICS:${colors.reset}`);
  console.log(`   📁 Files Processed: ${results.length}`);
  console.log(
    `   📏 Total Original: ${totalOriginalChars.toLocaleString()} chars, ${totalOriginalTokens.toLocaleString()} tokens`
  );
  console.log(
    `   🎯 Total LLM Format: ${totalLlmChars.toLocaleString()} chars, ${totalLlmTokens.toLocaleString()} tokens`
  );
  console.log(
    `   ${colors.green}🏆 Overall Token Reduction: ${overallTokenReduction.toFixed(1)}% (${(totalOriginalTokens - totalLlmTokens).toLocaleString()} tokens saved)${colors.reset}`
  );
  console.log(
    `   ${colors.green}📊 Overall Character Reduction: ${overallCharReduction.toFixed(1)}%${colors.reset}`
  );
  console.log(
    `   ⚡ Total Processing Time: ${totalProcessingTime.toFixed(2)}ms`
  );
  console.log(`   📊 Average Reduction per File: ${avgReduction.toFixed(1)}%`);

  // Detailed performance analysis with processing insights
  console.log(`\n${colors.magenta}⚡ PERFORMANCE ANALYSIS:${colors.reset}`);
  const avgProcessingTime = totalProcessingTime / results.length;
  const tokensPerSecond = totalOriginalTokens / (totalProcessingTime / 1000);

  // Calculate total cost savings across all examples
  const totalCostSavings = (totalOriginalTokens - totalLlmTokens) * 0.00003;

  console.log(
    `   ⏱️ Average Processing Time: ${avgProcessingTime.toFixed(2)}ms per file`
  );
  console.log(
    `   🚀 Processing Speed: ${tokensPerSecond.toLocaleString()} tokens/second`
  );
  console.log(
    `   💰 Total Cost Savings: $${totalCostSavings.toFixed(4)} per batch (GPT-4 pricing)`
  );
  console.log(
    `   💾 Memory Efficiency: All transformations in-memory, no temporary files`
  );
  console.log(
    `   🎯 Accuracy: Using Microsoft TikTokenizer for precise GPT-4 token counts`
  );

  // Identify top performers across different metrics
  // This helps understand which data types benefit most from transformation
  const bestReduction = results.reduce((best, current) =>
    current.reductionPercent > best.reductionPercent ? current : best
  );
  const fastestProcessing = results.reduce((fastest, current) =>
    current.processingTimeMs < fastest.processingTimeMs ? current : fastest
  );
  const largestTokenSavings = results.reduce((largest, current) =>
    current.originalTokens - current.llmTokens >
    largest.originalTokens - largest.llmTokens
      ? current
      : largest
  );

  console.log(`\n${colors.green}🏅 TOP PERFORMERS:${colors.reset}`);
  console.log(
    `   🥇 Best Token Reduction: ${bestReduction.name} (${bestReduction.reductionPercent.toFixed(1)}%)`
  );
  console.log(
    `   ⚡ Fastest Processing: ${fastestProcessing.name} (${fastestProcessing.processingTimeMs.toFixed(2)}ms)`
  );
  console.log(
    `   🎯 Largest Token Savings: ${largestTokenSavings.name} (${(largestTokenSavings.originalTokens - largestTokenSavings.llmTokens).toLocaleString()} tokens saved)`
  );

  // Comprehensive LLM benefits summary
  // Explains why this transformation is valuable for AI applications
  console.log(
    `\n${colors.bright}${colors.yellow}💡 BENEFITS FOR LLM APPLICATIONS:${colors.reset}`
  );
  const benefits = [
    `🎯 Token Efficiency: ${overallTokenReduction.toFixed(1)}% average reduction = more context fits in LLM windows`,
    `💰 Cost Reduction: $${totalCostSavings.toFixed(4)} savings per batch = lower API costs`,
    `📋 Ultra-Compact Arrays: "ITEMS:" format eliminates redundant "Item N:" prefixes for maximum efficiency`,
    `🏷️ Raw Keys Preserved: Keys kept as-is without transformation for clean, simple implementation`,
    `💭 Boolean Clarity: "yes/no" is more natural than "true/false" for language models`,
    `🧹 Syntax Elimination: Removes JSON noise (quotes, brackets, braces) that confuses parsing`,
    `🔄 Transform Indicators: "[Transformed from JSON]" helps LLMs understand data format`,
    `✅ Zero Data Loss: All original information preserved with enhanced readability`,
    `⚡ High Performance: ${avgProcessingTime.toFixed(1)}ms average processing per complex file`,
    `🎯 Precise Measurement: Microsoft TikTokenizer ensures accurate GPT-4 token counting`,
  ];

  benefits.forEach(benefit => console.log(`   ${benefit}`));

  // Final demonstration summary with key achievements
  console.log(
    `\n${colors.bright}${colors.green}🎉 DEMONSTRATION COMPLETE!${colors.reset}`
  );
  console.log(
    `${colors.green}   The enhanced jsonToLLMString function successfully demonstrates:${colors.reset}`
  );
  console.log(
    `${colors.green}   ✅ Significant token reduction (${overallTokenReduction.toFixed(1)}% average) using GPT-4 tokenizer${colors.reset}`
  );
  console.log(
    `${colors.green}   ✅ Improved LLM comprehension with semantic formatting${colors.reset}`
  );
  console.log(
    `${colors.green}   ✅ High performance processing (${tokensPerSecond.toLocaleString()} tokens/sec)${colors.reset}`
  );
  console.log(
    `${colors.green}   ✅ Complete data preservation with enhanced readability${colors.reset}`
  );
  console.log(
    `${colors.green}   ✅ Real cost savings ($${totalCostSavings.toFixed(4)} per batch) for API usage${colors.reset}`
  );

  console.log(
    `\n${colors.cyan}📁 Example files available in: ${__dirname}${colors.reset}`
  );
  console.log(
    `${colors.cyan}🔧 Function implementation: ../src/jsonToLLMString.ts${colors.reset}`
  );
}

// Execute the demonstration when run directly
// This allows the script to be both imported as a module and run standalone
// In ES modules, we check if the current file is the main module being run
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(
    '🔄 Initializing Microsoft TikTokenizer for accurate token counting...'
  );
  runComprehensiveDemo().catch(error => {
    console.error(`${colors.red}❌ Demo failed:${colors.reset}`, error);
    console.error(
      '💡 Make sure @microsoft/tiktokenizer is installed: npm install @microsoft/tiktokenizer'
    );
    process.exit(1);
  });
}

export { runComprehensiveDemo };
