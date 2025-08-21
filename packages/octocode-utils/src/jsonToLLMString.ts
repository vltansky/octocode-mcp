const PREFIX = `#converted from json # Format: 2-space indents per level. Objects: key value. Simple arrays: [item, item]. Complex arrays: indented items.`;

export type SortKeysOption = 'none' | 'asc' | 'desc';
export type ArrayFormatOption = 'auto' | 'brackets' | 'indented';

/**
 * StringBuilder utility for efficient string building
 */
class StringBuilder {
  private parts: string[] = [];

  append(str: string): this {
    this.parts.push(str);
    return this;
  }

  toString(): string {
    return this.parts.join('');
  }
}

/**
 * Options for JsonToLLMStringV.
 *
 * Note: Input is normalized via JSON.parse(JSON.stringify()) before processing.
 */
export interface JsonToLLMStringVOptions {
  /** When true, null/undefined object properties are omitted. Default: true */
  ignoreFalsy?: boolean;
  /** Maximum structural depth to traverse. Default: 10 */
  maxDepth?: number;
  /** Sort object keys: 'none' (preserve original order), 'asc' (ascending), 'desc' (descending). Default: 'asc' */
  sortKeys?: SortKeysOption;
  /** Global hard budget for final output characters. Default: Infinity */
  maxChars?: number;
  /** Array formatting: 'auto' (smart choice), 'brackets' ([1, 2, 3]), 'indented' (line by line). Default: 'auto' */
  arrayFormat?: ArrayFormatOption;
}

/**
 * Default options used by jsonToLLMString.
 */
export const JSON_TO_LLM_DEFAULT_OPTIONS: Readonly<
  Required<JsonToLLMStringVOptions>
> = Object.freeze({
  ignoreFalsy: true,
  maxDepth: 10,
  sortKeys: 'asc',
  maxChars: Number.POSITIVE_INFINITY,
  arrayFormat: 'auto',
});

export function jsonToLLMString(
  data: unknown,
  options?: JsonToLLMStringVOptions
): string {
  try {
    // Normalize data to only enumerable, JSON-serializable properties
    let normalizedData: unknown;
    try {
      normalizedData = JSON.parse(JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error) {
        // Handle circular references
        if (error.message.includes('circular')) {
          throw new Error(
            'Circular structure detected - cannot serialize to JSON'
          );
        }
      }
      // For any other JSON serialization error
      throw new Error(
        `JSON serialization failed - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Build configuration from options with defaults
    const cfg = {
      ignoreFalsy:
        options?.ignoreFalsy ?? JSON_TO_LLM_DEFAULT_OPTIONS.ignoreFalsy,
      maxDepth: options?.maxDepth ?? JSON_TO_LLM_DEFAULT_OPTIONS.maxDepth,
      sortKeys: (options?.sortKeys ??
        JSON_TO_LLM_DEFAULT_OPTIONS.sortKeys) as SortKeysOption,
      maxChars: options?.maxChars ?? JSON_TO_LLM_DEFAULT_OPTIONS.maxChars,
      arrayFormat: (options?.arrayFormat ??
        JSON_TO_LLM_DEFAULT_OPTIONS.arrayFormat) as ArrayFormatOption,
    } as const;

    const indentUnit = ' '.repeat(2);

    const escapeString = (value: string): string => {
      const builder = new StringBuilder();
      for (let i = 0; i < value.length; i++) {
        const ch = value[i] as string;
        switch (ch) {
          case '\\':
            builder.append('\\\\');
            continue;
          case '"':
            builder.append('\\"');
            continue;
          case '\n':
            builder.append('\\n');
            continue;
          case '\r':
            builder.append('\\r');
            continue;
          case '\t':
            builder.append('\\t');
            continue;
          case '\b':
            builder.append('\\b');
            continue;
          case '\f':
            builder.append('\\f');
            continue;
          case '\v':
            builder.append('\\v');
            continue;
          case '\0':
            builder.append('\\0');
            continue;
          default: {
            const code = ch.charCodeAt(0);
            if (code < 0x20 || code === 0x7f) {
              builder.append(`\\x${code.toString(16).padStart(2, '0')}`);
            } else {
              builder.append(ch);
            }
          }
        }
      }
      return builder.toString();
    };

    const formatString = (value: string): string => {
      return '"' + escapeString(value) + '"';
    };

    const formatPrimitive = (value: unknown): string => {
      if (value === null) return 'null';
      if (typeof value === 'string') return formatString(value);
      if (typeof value === 'number') {
        if (Number.isNaN(value)) return 'NaN';
        if (!Number.isFinite(value))
          return value > 0 ? 'Infinity' : '-Infinity';
        if (Object.is(value, -0)) return '-0';
        return String(value);
      }
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      return String(value);
    };

    const formatValue = (
      value: unknown,
      depth: number,
      _context: 'root' | 'objectProperty' | 'arrayItem'
    ): string => {
      if (depth > cfg.maxDepth) return '[Max depth reached]';

      if (typeof value === 'object' && value !== null) {
        // Arrays
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return 'EmptyArray';
          }

          // Filter out falsy values if configured
          const effectiveItems = value.filter(item => {
            if (cfg.ignoreFalsy && item === null) return false;
            return true;
          });

          if (effectiveItems.length === 0) {
            return 'EmptyArray';
          }

          // Determine format based on arrayFormat option first
          const shouldUseBrackets = (() => {
            if (cfg.arrayFormat === 'brackets') return true;
            if (cfg.arrayFormat === 'indented') return false;

            // Auto mode: use brackets for simple primitives only
            const allPrimitivesOrNull = effectiveItems.every(
              item => item === null || typeof item !== 'object'
            );
            return allPrimitivesOrNull;
          })();

          if (shouldUseBrackets) {
            // Bracket format: render items without extra indentation, then join
            const renderedItems = effectiveItems.map(item =>
              formatValue(item, depth, 'arrayItem')
            );
            return `[${renderedItems.join(', ')}]`;
          } else {
            // Indented format: show array structure with brackets
            const itemIndent = indentUnit.repeat(depth + 1);
            const renderedItems = effectiveItems.map(item => {
              const rendered = formatValue(item, depth + 1, 'arrayItem');
              if (rendered.includes('\n')) {
                // Multi-line item: content is already properly indented for depth+1
                // We just need to add the difference to get to the correct array item indentation
                const lines = rendered.split('\n');
                return lines
                  .map(line => {
                    if (line.trim() === '') return line; // preserve empty lines
                    // The content is indented for depth+1, but we want it indented for array items at depth+1
                    // Since formatValue already gave us the right indentation, just use it as-is
                    return line;
                  })
                  .join('\n');
              } else {
                // Single-line item: check if it needs indentation
                if (
                  typeof item === 'object' &&
                  item !== null &&
                  !rendered.startsWith('[') &&
                  rendered !== 'EmptyObject' &&
                  rendered !== 'EmptyArray'
                ) {
                  // Complex objects already have their own indentation from formatValue
                  return rendered;
                } else {
                  // Primitives, simple arrays, and empty markers need indentation added
                  return `${itemIndent}${rendered}`;
                }
              }
            });

            const arrayIndent = indentUnit.repeat(depth);
            return `${arrayIndent}[\n${renderedItems.join('\n')}\n${arrayIndent}]`;
          }
        }

        // Plain objects (after JSON normalization, all objects are plain)
        if (value && typeof value === 'object') {
          const obj = value as Record<string, unknown>;
          const keys = Object.keys(obj);
          // Filter out falsy fields if configured
          const effectiveKeys = keys.filter(k => {
            const val = obj[k];
            if (cfg.ignoreFalsy && val === null) return false;
            return true;
          });

          if (effectiveKeys.length === 0) {
            return 'EmptyObject';
          }

          if (cfg.sortKeys === 'asc') {
            effectiveKeys.sort((a, b) => a.localeCompare(b));
          } else if (cfg.sortKeys === 'desc') {
            effectiveKeys.sort((a, b) => b.localeCompare(a));
          }

          const indent = indentUnit.repeat(depth);
          const lines: string[] = [];
          for (const key of effectiveKeys) {
            const val = obj[key];
            const rendered = formatValue(val, depth + 1, 'objectProperty');
            if (rendered === '') continue;

            // Determine if this should be rendered inline vs on separate lines
            const shouldBeInline = (() => {
              // Primitives are always inline
              if (val === null || typeof val !== 'object') return true;

              // Empty arrays and objects use special markers and should be inline
              if (rendered === 'EmptyArray' || rendered === 'EmptyObject')
                return true;

              // Arrays that use bracket format (simple arrays) should be inline
              if (
                Array.isArray(val) &&
                rendered.startsWith('[') &&
                rendered.endsWith(']') &&
                !rendered.includes('\n')
              ) {
                return true;
              }

              // Everything else (complex objects, complex arrays) should be on separate lines
              return false;
            })();

            if (shouldBeInline) {
              lines.push(`${indent}${key} ${rendered}`);
            } else {
              // Complex values: put key on its own line, then add the value with proper indentation
              lines.push(`${indent}${key}`);
              lines.push(rendered);
            }
          }
          return lines.join('\n');
        }
      }

      // Primitives (null, string, number, boolean) - after JSON.stringify/parse, only these remain
      return formatPrimitive(value);
    };

    const body = formatValue(normalizedData, 0, 'root');
    const full = `${PREFIX}\n${body}`;
    if (Number.isFinite(cfg.maxChars) && full.length > cfg.maxChars) {
      const footer = `\n[Output truncated at ${cfg.maxChars} chars]`;
      const sliceLen = Math.max(0, cfg.maxChars - footer.length);
      return full.substring(0, sliceLen) + footer;
    }
    return full;
  } catch (fatalError) {
    // Re-throw any fatal errors
    if (fatalError instanceof Error) {
      throw fatalError;
    }
    throw new Error('Unknown fatal error');
  }
}
