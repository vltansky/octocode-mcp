# octocode-utils

**Shared utilities for Octocode MCP packages**

<div align="center">
  <img src="./assets/logo_builder.png" width="200px">
</div>

<div align="center">
  
  [![Version](https://img.shields.io/npm/v/octocode-utils.svg)](https://www.npmjs.com/package/octocode-utils)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](./package.json)
  [![X/Twitter](https://img.shields.io/badge/X-Follow%20@guy__bary-1DA1F2.svg?logo=x&logoColor=white)](https://x.com/guy_bary)
  [![Website](https://img.shields.io/badge/Website-octocode.ai-blue.svg?logo=web)](https://octocode.ai)
  
</div>

Essential utilities for building MCP (Model Context Protocol) applications with advanced content processing and AI optimization capabilities.

## Installation

```bash
npm install octocode-utils
# or
yarn add octocode-utils
```

## 🚀 Features

- **🧠 AI-Optimized Content Processing** - Transform any content for optimal AI consumption
- **⚡ Advanced Minification** - Multi-strategy content compression for 50+ file types
- **🔄 JSON-to-Natural Language** - Convert structured data to human-readable format
- **🛡️ Production Ready** - Comprehensive error handling and fallback mechanisms
- **📦 Zero Dependencies** - Lightweight with minimal external requirements

## 📚 Usage

### jsonToLLMString

Converts JSON data to natural language format optimized for LLM consumption.

```typescript
import { jsonToLLMString } from 'octocode-utils';

const data = {
  name: 'John',
  age: 30,
  active: true,
  roles: ['admin', 'user']
};

console.log(jsonToLLMString(data));
// Output:
// name: "John"
// age: 30
// active: yes
// roles: LIST: "admin", "user"
```

#### Features

- **Clean Semantic Algorithm**: Removes JSON syntax (quotes, brackets, braces, commas)
- **Natural Hierarchy**: Creates simple indentation-based structure  
- **Ultra-Compact Arrays**: `ITEMS:` format eliminates redundant "Item N:" prefixes
- **Raw Keys Preserved**: Keys kept as-is without transformation for simplicity
- **String Quotes**: Preserves quotes around strings for LLM clarity
- **Token Efficiency**: 12.9% average reduction in real-world tests
- **Circular Reference Detection**: Prevents infinite recursion
- **Input Validation**: Only accepts objects/arrays, rejects primitives for type safety

#### API

```typescript
function jsonToLLMString(
  data: unknown,
  options?: {
    maxDepth?: number;
    maxLength?: number;
    maxArrayItems?: number;
  }
): string
```

Parameters:
- `data`: JSON object, array, or valid JSON string that parses to object/array
- `options`: Optional configuration object
  - `maxDepth`: Maximum recursion depth (default: Infinity - no limit)
  - `maxLength`: Maximum string length before truncation (default: Infinity - no limit)
  - `maxArrayItems`: Maximum array items to display (default: Infinity - no limit)

**Throws:** Error if data is not a JSON object, array, or valid JSON string

### minifyContent

Advanced content minification with intelligent strategy selection based on file type.

```typescript
import { minifyContent } from 'octocode-utils';

const result = await minifyContent(
  'const x = 1; // comment\n\nconst y = 2;',
  'example.js'
);

console.log(result);
// Output:
// {
//   content: 'const x=1;const y=2',
//   failed: false,
//   type: 'terser'
// }
```

#### Supported File Types & Strategies

**JavaScript/TypeScript Family** (Terser optimization):
- `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, `.cjs`

**Indentation-Sensitive** (Conservative approach):
- `.py`, `.yaml`, `.yml`, `.coffee`, `.sass`, `.styl`, `.pug`

**Markup & Styles** (Aggressive optimization):
- `.html`, `.htm`, `.xml`, `.svg`, `.css`, `.less`, `.scss`

**Programming Languages** (Comment removal + whitespace):
- `.go`, `.java`, `.c`, `.cpp`, `.cs`, `.rust`, `.swift`, `.php`, `.rb`

**Data Formats** (Specialized handling):
- `.json` - JSON parsing and compression
- `.md` - Markdown-aware minification

**And 50+ more file types** with intelligent strategy selection.

#### API

```typescript
async function minifyContent(
  content: string,
  filePath: string
): Promise<{
  content: string;
  failed: boolean;
  type: 'terser' | 'conservative' | 'aggressive' | 'json' | 'general' | 'markdown' | 'failed';
  reason?: string;
}>
```

#### Features

- **🎯 Smart Strategy Selection** - Automatically chooses optimal minification approach
- **🛡️ Error Resilience** - Graceful fallbacks when minification fails
- **📏 Size Limits** - Protects against oversized content (1MB limit)
- **🔧 Multi-Engine** - Uses Terser, CleanCSS, and html-minifier-terser
- **💾 Token Efficiency** - Optimized for AI model token consumption
- **🔍 File Type Detection** - Supports 50+ file extensions

#### Minification Strategies

1. **Terser** - Advanced JavaScript/TypeScript optimization
2. **Conservative** - Preserves indentation for Python, YAML, etc.
3. **Aggressive** - Maximum compression for markup and styles
4. **JSON** - Proper JSON parsing and compression
5. **Markdown** - Structure-aware markdown optimization
6. **General** - Safe fallback for unknown file types

## 🔧 Development

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Lint code
yarn lint

# Format code
yarn format
```

## 📊 Research & Benchmarks: Evidence for Semantic Naturalization

### 🔬 **Measured Performance (Tested with Microsoft TikTokenizer)**

Our comprehensive benchmarks using GPT-4 tokenizer demonstrate significant efficiency gains:

| File Type | Original Tokens | LLM Format Tokens | Reduction | Cost Savings |
|-----------|-----------------|-------------------|-----------|--------------|
| GitHub Repository Search | 2,742 | 2,508 | **8.5%** | $0.0070 |
| NPM Package Info | 2,722 | 2,378 | **12.6%** | $0.0103 |
| GitHub Code Search | 3,915 | 3,377 | **13.7%** | $0.0161 |
| GitHub Pull Request | 3,933 | 3,438 | **12.6%** | $0.0148 |
| Mixed API Responses | 3,689 | 3,215 | **12.8%** | $0.0142 |
| GitHub Fetch Content | 3,004 | 2,504 | **16.6%** | $0.0150 |

**📈 Aggregate Results:**
- **12.9% average token reduction** across real-world JSON datasets
- **2,585 tokens saved** per batch (20K→17.4K tokens)
- **$0.0776 cost savings** per batch with GPT-4 pricing
- **⚡ 1.62M tokens/second** processing speed

*Run `examples/comprehensive-demo.ts` to reproduce these benchmarks*

### 🧠 **Academic Research Supporting This Approach**

**1. Structured Info ↔ Natural Language Are Both Viable**
> [Dagdelen et al. (Nature)](https://www.nature.com/articles/s41586-023-06735-9) demonstrate that the same extracted facts can be returned either as simple English sentences or as JSON, depending on what's most useful downstream. This supports our premise that semantically labeled, minimally syntactic text is a valid—and sometimes preferable—carrier of structured content for LLM consumption.

**2. Separate "Reading" from "Reasoning"; Linearize for the Model**
> [StructGPT (ACL Anthology)](https://aclanthology.org/2023.emnlp-main.574/) explicitly disentangles reading from reasoning over structured sources and introduces an invoking-linearization-generation procedure so LLMs reason over structured data more effectively. Our hierarchical indentation, semantic labels, truncation, and array handling are practical instances of such linearization to reduce cognitive load at inference time.

**3. Alternative Formats Improve Efficiency**
> [EMNLP 2024 findings](https://aclanthology.org/2024.emnlp-main.448/) show that allowing LLMs to choose non-NL formats (tables, key-value, code-like structures) before reasoning improves efficiency (3.3–5.7%) and cuts multi-agent token use by as much as **72.7%**, while maintaining communicative effectiveness. Our output is precisely such a compact, structured-yet-readable format.

### 🎯 **Why Our Design Choices Work**

**✅ Remove Heavy JSON Syntax; Keep Salient Structure**
- Reduces token overhead and focuses the model on semantics rather than punctuation
- Consistent with evidence that alternative formats and compact linearizations improve efficiency
- **Measured impact:** 12.9% average token reduction

**✅ Raw Keys Preserved (`repo:`, `name:`, `active:`)**
- Maintains original key names without transformation for clean, simple implementation
- Reduces complexity while preserving semantic meaning
- **Example transformation:** `"repo": "octocode"` → `repo: "octocode"`

**✅ Indentation/Hierarchy and Controlled Truncation**
- Matches the "reading-then-reasoning" principle (structured for reading; capped for context)
- Aligns with efficiency findings for non-NL/compact formats
- **Performance:** Processes 1.62M tokens/second with depth limiting

**✅ Ultra-Compact Array Handling (`LIST:` for primitives; `ITEMS:` for objects)**
- Eliminates redundant "Item N:" prefixes for maximum token efficiency
- Provides predictable, compressible patterns easy for models to scan
- **Examples:** `["react", "typescript"]` → `LIST: "react", "typescript"` and objects → `ITEMS: obj1, obj2`

### 🔄 **Practical Integration Patterns**

**Input Side (Our Function):** Convert large JSON payloads into concise, labeled outlines before asking the model to reason, compare, or summarize.

```typescript
// Before: Raw JSON with syntax noise
{"users":[{"name":"Alice","active":true}],"total":1}

// After: Ultra-compact naturalization  
users:
ITEMS:     name: "Alice"
    active: yes
total: 1
```

**Output Side:** When you need guaranteed structure back (API calls, tool arguments), use constrained decoding with FSM/grammar libraries—research shows this can be faster than unconstrained generation.

### 📈 **Validation Methodology**

Our benchmarks follow rigorous scientific methodology:

- **Real-world datasets:** Complex GitHub API responses, NPM package data, mixed success/error cases
- **Precise measurement:** Microsoft TikTokenizer for exact GPT-4 token counts
- **Comprehensive metrics:** Token reduction, character efficiency, processing speed, cost impact
- **Reproducible:** All test data and scripts included in `/examples/`

**A/B Testing Framework Available:**
- Compare task accuracy and token cost using raw JSON vs. naturalized text
- Measure parsing errors downstream with constrained vs. free-form outputs
- Human evaluation for faithfulness and readability

*Contact us for benchmark harnesses or FSM-guided decoder integration.*

## 🏗️ Architecture

This package provides core utilities used across the Octocode MCP ecosystem:

- **Content Processing Pipeline** - Unified approach to content transformation
- **AI Optimization** - Token-efficient formats for large language models  
- **Multi-Strategy Processing** - Intelligent selection based on content type
- **Production Reliability** - Comprehensive error handling and fallbacks

## 📦 Package Structure

```
src/
├── index.ts           # Main exports
├── jsonToLLMString.ts # JSON to natural language conversion
└── minifier.ts        # Advanced content minification
```

## 🤝 Contributing

This package is part of the [Octocode MCP](https://github.com/bgauryy/octocode-mcp) project. Contributions are welcome!

## 📄 License

MIT - See [LICENSE](../../LICENSE.md) for details.