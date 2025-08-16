import { describe, it, expect } from 'vitest';
import { jsonToLLMString } from '../src/jsonToLLMString';

describe('jsonToLLMString', () => {
  describe('Primitive Values', () => {
    it('should reject primitive strings with error', () => {
      expect(() => jsonToLLMString('hello world')).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
      expect(() => jsonToLLMString('')).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });

    it('should reject primitive numbers with error', () => {
      expect(() => jsonToLLMString(42)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
      expect(() => jsonToLLMString(0)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
      expect(() => jsonToLLMString(-1.5)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
    });

    it('should reject primitive booleans with error', () => {
      expect(() => jsonToLLMString(true)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
      expect(() => jsonToLLMString(false)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
    });

    it('should reject null with error', () => {
      expect(() => jsonToLLMString(null)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
    });

    it('should reject undefined with error', () => {
      expect(() => jsonToLLMString(undefined)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive values'
      );
    });
  });

  describe('Arrays', () => {
    it('should handle empty arrays', () => {
      expect(jsonToLLMString([])).toBe('empty');
    });

    it('should handle simple arrays', () => {
      expect(jsonToLLMString([1, 2, 3])).toBe('LIST: 1, 2, 3');
      expect(jsonToLLMString(['a', 'b', 'c'])).toBe('LIST: "a", "b", "c"');
      expect(jsonToLLMString([true, false, null])).toBe('LIST: yes, no, null');
    });

    it('should handle mixed primitive arrays', () => {
      expect(jsonToLLMString([1, 'hello', true, null])).toBe(
        'LIST: 1, "hello", yes, null'
      );
    });

    it('should handle arrays of objects', () => {
      const input = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const expected = `ITEMS:   name: "John"
  age: 30,   name: "Jane"
  age: 25`;
      expect(jsonToLLMString(input)).toBe(expected);
    });

    it('should handle nested arrays', () => {
      const input = [
        [1, 2],
        [3, 4],
      ];
      const expected = `ITEMS: LIST: 1, 2, LIST: 3, 4`;
      expect(jsonToLLMString(input)).toBe(expected);
    });

    it('should handle mixed array with multiple object types', () => {
      const input = [1, 100, {}, 'ddd', { a: 'kkk' }];
      const result = jsonToLLMString(input);

      expect(result).toContain('ITEMS:');
      expect(result).toContain('1,');
      expect(result).toContain('100,');
      expect(result).toContain('empty,');
      expect(result).toContain('"ddd",');
      expect(result).toContain('a: "kkk"');
    });
  });

  describe('Objects', () => {
    it('should handle empty objects', () => {
      expect(jsonToLLMString({})).toBe('empty');
    });

    it('should handle simple objects', () => {
      const input = { name: 'John', age: 30, active: true };
      const expected = `name: "John"
age: 30
active: yes`;
      expect(jsonToLLMString(input)).toBe(expected);
    });

    it('should handle semantic labels', () => {
      const input = { path: '/file.txt', size: 1024, data: 'content' };
      const expected = `path: "/file.txt"
size: 1,024
data: "content"`;
      expect(jsonToLLMString(input)).toBe(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      };
      const expected = `user:
  name: "John"
  address:
    city: "New York"
    country: "USA"`;
      expect(jsonToLLMString(input)).toBe(expected);
    });

    it('should handle objects with null values', () => {
      const input = { name: 'John', email: null, phone: undefined };
      const expected = `name: "John"
email: null
phone: undefined`;
      expect(jsonToLLMString(input)).toBe(expected);
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { name: 'test' };
      obj.self = obj;
      expect(jsonToLLMString(obj)).toContain('[Circular reference]');
    });

    it('should handle max depth limit', () => {
      const deepObj = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    level7: {
                      level8: { level9: { level10: { level11: 'too deep' } } },
                    },
                  },
                },
              },
            },
          },
        },
      };
      expect(jsonToLLMString(deepObj, { maxDepth: 5 })).toContain(
        '[Max depth reached]'
      );
    });

    it('should handle functions', () => {
      const input = { func: () => 'test' };
      expect(jsonToLLMString(input)).toContain('() =>');
    });

    it('should handle symbols', () => {
      const input = { sym: Symbol('test') };
      expect(jsonToLLMString(input)).toContain('Symbol');
    });

    it('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      const input = { created: date };
      expect(jsonToLLMString(input)).toContain('2023');
    });

    it('should handle RegExp objects', () => {
      const input = { pattern: /test/g };
      expect(jsonToLLMString(input)).toContain('/test/g');
    });
  });

  describe('Complex Structures', () => {
    it('should handle mixed complex data', () => {
      const input = {
        users: [
          { name: 'John', roles: ['admin', 'user'] },
          { name: 'Jane', roles: ['user'] },
        ],
        settings: {
          theme: 'dark',
          notifications: true,
          limits: { maxUsers: 100, maxStorage: 1024 },
        },
      };

      const result = jsonToLLMString(input);
      expect(result).toContain('users:');
      expect(result).toContain('settings:');
      expect(result).toContain('roles: LIST: "admin", "user"');
      expect(result).toContain('theme: "dark"');
      expect(result).toContain('notifications: yes');
    });

    it('should handle arrays with mixed types', () => {
      const input = ['string', 42, { name: 'object' }, [1, 2, 3], null, true];

      const result = jsonToLLMString(input);
      expect(result).toContain('ITEMS:');
      expect(result).toContain('"string",');
      expect(result).toContain('42,');
      expect(result).toContain('name: "object"');
      expect(result).toContain('LIST: 1, 2, 3');
      expect(result).toContain('null');
      expect(result).toContain('yes');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const start = performance.now();
      const result = jsonToLLMString(largeArray, { maxArrayItems: 50 });
      const end = performance.now();

      expect(result).toContain('ITEMS:');
      expect(result).toContain('... [950 more items]');
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle deeply nested objects without stack overflow', () => {
      let deepObj: Record<string, unknown> = { value: 'deep' };
      for (let i = 0; i < 50; i++) {
        deepObj = { nested: deepObj };
      }

      expect(() => jsonToLLMString(deepObj)).not.toThrow();
    });
  });

  describe('Semantic Labeling', () => {
    it('should use semantic labels for common keys', () => {
      const input = {
        path: '/file.txt',
        size: 1024,
        data: 'content',
        items: ['a', 'b'],
        type: 'file',
        name: 'test',
        value: 42,
        content: 'text',
        description: 'A test file',
        children: ['child1', 'child2'],
      };

      const result = jsonToLLMString(input);
      expect(result).toContain('path: "/file.txt"');
      expect(result).toContain('size: 1,024');
      expect(result).toContain('data: "content"');
      expect(result).toContain('items: LIST: "a", "b"');
      expect(result).toContain('type: "file"');
      expect(result).toContain('name: "test"');
      expect(result).toContain('value: 42');
      expect(result).toContain('content: "text"');
      expect(result).toContain('description: "A test file"');
      expect(result).toContain('children: LIST: "child1", "child2"');
    });

    it('should use GitHub-specific semantic labels', () => {
      const input = {
        owner: 'octocat',
        repo: 'test-repo',
        branch: 'main',
        commit: 'abc123',
        sha: 'def456',
        author: 'John Doe',
        created: '2023-01-01',
        updated: '2023-01-02',
        pushed: '2023-01-03',
        stars: 100,
        forks: 50,
        language: 'TypeScript',
        topics: ['web', 'api'],
        license: 'MIT',
      };

      const result = jsonToLLMString(input);
      expect(result).toContain('owner: "octocat"');
      expect(result).toContain('repo: "test-repo"');
      expect(result).toContain('branch: "main"');
      expect(result).toContain('commit: "abc123"');
      expect(result).toContain('sha: "def456"');
      expect(result).toContain('author: "John Doe"');
      expect(result).toContain('created: 1/1/2023');
      expect(result).toContain('updated: 1/2/2023');
      expect(result).toContain('pushed: 1/3/2023');
      expect(result).toContain('stars: 100');
      expect(result).toContain('forks: 50');
      expect(result).toContain('language: "TypeScript"');
      expect(result).toContain('topics: LIST: "web", "api"');
      expect(result).toContain('license: "MIT"');
    });

    it('should use NPM-specific semantic labels', () => {
      const input = {
        version: '1.0.0',
        package: 'test-package',
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { jest: '^27.0.0' },
        scripts: { test: 'jest' },
        engines: { node: '>=14' },
        keywords: ['test', 'utility'],
        homepage: 'https://example.com',
        repository: 'github:user/repo',
        bugs: 'https://github.com/user/repo/issues',
        maintainers: ['John Doe'],
      };

      const result = jsonToLLMString(input);
      expect(result).toContain('version: "1.0.0"');
      expect(result).toContain('package: "test-package"');
      expect(result).toContain('dependencies:');
      expect(result).toContain('devDependencies:');
      expect(result).toContain('scripts:');
      expect(result).toContain('engines:');
      expect(result).toContain('keywords: LIST: "test", "utility"');
      expect(result).toContain('homepage: "https://example.com"');
      expect(result).toContain('repository: "github:user/repo"');
      expect(result).toContain('bugs: "https://github.com/user/repo/issues"');
      expect(result).toContain('maintainers: LIST: "John Doe"');
    });

    it('should preserve unknown keys exactly as they are', () => {
      const input = {
        customKey: 'value',
        anotherKey: 123,
        snake_case_key: 'test',
        'kebab-case-key': 'test2',
        PascalCaseKey: 'test3',
        open_issues: 42,
      };
      const result = jsonToLLMString(input);
      expect(result).toContain('customKey: "value"');
      expect(result).toContain('anotherKey: 123');
      expect(result).toContain('snake_case_key: "test"');
      expect(result).toContain('kebab-case-key: "test2"');
      expect(result).toContain('PascalCaseKey: "test3"');
      expect(result).toContain('open_issues: 42');
    });
  });

  describe('JSON String Parsing', () => {
    it('should parse JSON strings and add transformation indicator', () => {
      const jsonString = '{"name": "test", "values": [1, 2, 3]}';
      const result = jsonToLLMString(jsonString);

      expect(result).toContain('[Transformed from JSON]');
      expect(result).toContain('name: "test"');
      expect(result).toContain('values: LIST: 1, 2, 3');
    });

    it('should handle array JSON strings', () => {
      const jsonString = '["apple", "banana", "cherry"]';
      const result = jsonToLLMString(jsonString);

      expect(result).toBe(
        '[Transformed from JSON]\nLIST: "apple", "banana", "cherry"'
      );
    });

    it('should handle nested JSON objects', () => {
      const jsonString =
        '{"user": {"name": "John", "tags": ["admin", "user"]}}';
      const result = jsonToLLMString(jsonString);

      expect(result).toContain('[Transformed from JSON]');
      expect(result).toContain('user:');
      expect(result).toContain('name: "John"');
      expect(result).toContain('tags: LIST: "admin", "user"');
    });

    it('should reject invalid JSON strings with error', () => {
      const invalidJson = '{"invalid": json}';
      expect(() => jsonToLLMString(invalidJson)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });

    it('should reject regular strings with error', () => {
      const regularString = 'This is just a regular string';
      expect(() => jsonToLLMString(regularString)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });

    it('should reject strings with quotes', () => {
      const stringWithQuotes = 'Hello "world" with quotes';
      expect(() => jsonToLLMString(stringWithQuotes)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });
  });

  describe('Token Efficiency Features', () => {
    it('should reject primitive strings for truncation test', () => {
      const longString = 'a'.repeat(1500);
      expect(() => jsonToLLMString(longString, { maxLength: 1000 })).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });

    it('should limit array items', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const result = jsonToLLMString(largeArray, { maxArrayItems: 10 });
      expect(result).toContain('... [90 more items]');
      expect(result.split(',').length).toBeLessThan(15); // 10 items + truncation
    });

    it('should limit array of objects', () => {
      const largeObjectArray = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const result = jsonToLLMString(largeObjectArray, { maxArrayItems: 5 });
      expect(result).toContain('... [95 more items]');
      // Should have 5 items + truncation message, so expect around 6-7 "Item" occurrences
      expect(result.split('Item ').length).toBeLessThan(12);
    });

    it('should reject short primitive strings', () => {
      const shortString = 'short';
      expect(() => jsonToLLMString(shortString)).toThrow(
        'jsonToLLMString should only handle JSON objects or arrays, not primitive strings'
      );
    });
  });
});
