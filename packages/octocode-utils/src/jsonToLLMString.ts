/**
 * Clean Semantic Algorithm - Converts JSON objects and arrays to natural language format
 *
 * ONLY accepts JSON objects, arrays, or valid JSON strings that parse to objects/arrays.
 * Does NOT accept primitive values (strings, numbers, booleans) directly.
 *
 * Step 1: Validate input is JSON object/array (parse JSON strings if needed)
 * Step 2: Remove all JSON syntax (quotes, brackets, braces, commas)
 * Step 3: Create natural hierarchy with simple indentation
 * Step 4: Transform arrays into natural language patterns with bullets
 * Step 5: Keep original key names without transformation
 * Step 6: Enhanced scalar formatting using built-in functions
 *
 * @param data - JSON object, array, or valid JSON string that parses to object/array
 * @param options - Optional configuration object
 * @param options.maxDepth - Maximum recursion depth (default: Infinity - no limit)
 * @param options.maxLength - Maximum string length before truncation (default: Infinity - no limit)
 * @param options.maxArrayItems - Maximum array items to display (default: Infinity - no limit)
 * @returns The formatted string in natural language
 * @throws Error if data is not a JSON object, array, or valid JSON string
 */
export function jsonToLLMString(
  data: unknown,
  options: {
    maxDepth?: number;
    maxLength?: number;
    maxArrayItems?: number;
  } = {}
): string {
  const {
    maxDepth = Infinity,
    maxLength = Infinity,
    maxArrayItems = Infinity,
  } = options;

  // Validate that we only accept JSON objects, arrays, or valid JSON strings
  if (!Array.isArray(data) && (typeof data !== 'object' || data === null)) {
    // Check if it's a JSON string that can be parsed
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return `[Transformed from JSON]\n${convertInternal(parsed, 0, new Set())}`;
      } catch {
        throw new Error(
          'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
        );
      }
    }
    throw new Error(
      'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
    );
  }

  // Internal recursive function with all the complexity hidden from user
  function convertInternal(
    data: unknown,
    depth: number = 0,
    visited: Set<unknown> = new Set()
  ): string {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      return '[Max depth reached]';
    }

    // Handle circular references
    if (typeof data === 'object' && data !== null) {
      if (visited.has(data)) {
        return '[Circular reference]';
      }
      visited.add(data);
    }

    const indent = '  '.repeat(depth);

    // Handle primitives
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (typeof data === 'boolean') return data ? 'yes' : 'no';
    if (typeof data === 'number') return data.toLocaleString();
    if (typeof data === 'bigint') return data.toString() + 'n';

    if (typeof data === 'string') {
      // Use built-in Date constructor for date detection
      if (data.length > 8 && !isNaN(Date.parse(data))) {
        try {
          const date = new Date(data);
          // Only format if it's a valid date that looks like ISO format
          if (data.includes('T') || data.includes('-')) {
            return date.toLocaleString(); // Dates are formatted, no quotes needed
          }
        } catch {
          // Not a valid date, continue
        }
      }

      // Truncate long strings only if maxLength is finite, but keep quotes for LLM clarity
      if (isFinite(maxLength) && data.length > maxLength) {
        return `"${data.substring(0, maxLength)}... [truncated]"`;
      }
      // Keep quotes around strings for better LLM understanding
      return `"${data}"`;
    }

    // Handle special objects using built-in instanceof checks
    if (data instanceof Date) {
      return data.toLocaleString();
    }
    if (data instanceof RegExp) {
      return data.toString();
    }
    if (data instanceof Error) {
      return `Error: ${data.name}: ${data.message}`;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      if (data.length === 0) return 'empty';

      // Limit array items only if maxArrayItems is finite
      const displayItems = isFinite(maxArrayItems)
        ? data.slice(0, maxArrayItems)
        : data;
      const hasMore = isFinite(maxArrayItems) && data.length > maxArrayItems;

      // Simple arrays (primitives only)
      const isSimple = displayItems.every(
        item => typeof item !== 'object' || item === null
      );

      if (isSimple) {
        const items = displayItems
          .map(item => convertInternal(item, 0, new Set()))
          .join(', ');
        const result = hasMore
          ? `${items}... [${data.length - maxArrayItems} more items]`
          : items;
        return `LIST: ${result}`;
      } else {
        // Complex arrays (objects) - use ITEMS: format to reduce tokens
        const items = displayItems
          .map(item => convertInternal(item, depth + 1, visited))
          .join(', ');
        const result = hasMore
          ? `${items}, ... [${data.length - maxArrayItems} more items]`
          : items;
        return `ITEMS: ${result}`;
      }
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) return 'empty';

      const lines = keys.map(key => {
        const value = (data as Record<string, unknown>)[key];
        const valueStr = convertInternal(value, depth + 1, visited);

        if (valueStr.includes('\n')) {
          return `${indent}${key}:\n${valueStr}`;
        } else {
          return `${indent}${key}: ${valueStr}`;
        }
      });

      return lines.join('\n');
    }

    return String(data);
  }

  // Call the internal function with the data
  return convertInternal(data);
}
