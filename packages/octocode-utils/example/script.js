import { jsonToLLMString } from '../dist/index.mjs';

// Comprehensive test object with all types and complex nesting
const megaComplexObject = {
  // Primitive types
  string: "Hello, World!",
  number: 42,
  float: 3.14159,
  negative: -100,
  zero: 0,
  boolean: true,
  falseBool: false,
  nullValue: null,
  // bigNumber: BigInt(9007199254740993), // Removed - not JSON compatible
  
  // Date and URL objects
  timestamp: new Date('2024-01-01T12:00:00Z'),
  website: new URL('https://example.com/path?query=value&foo=bar'),
  
  // Empty structures
  emptyObj: {},
  emptyArr: [],
  
  // Simple arrays of same type
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  strings: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  booleans: [true, false, true, true, false],
  
  // Mixed array
  mixedArray: [1, 'two', true, null, 3.14, false, 'seven', 8],
  
  // Nested arrays
  matrix: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  
  // Deep nested arrays
  deepArrays: [
    [
      [1, 2],
      [3, 4]
    ],
    [
      [5, 6],
      [7, 8]
    ]
  ],
  
  // Array of objects
  users: [
    {
      id: 1,
      name: 'Alice',
      age: 30,
      active: true,
      roles: ['admin', 'user'],
      contact: {
        email: 'alice@example.com',
        phones: ['+1234567890', '+0987654321']
      }
    },
    {
      id: 2,
      name: 'Bob',
      age: 25,
      active: false,
      roles: ['user'],
      contact: {
        email: 'bob@example.com',
        phones: ['+1111111111']
      }
    }
  ],
  
  // Complex nested object
  company: {
    name: 'TechCorp',
    founded: 2020,
    employees: 150,
    locations: [
      {
        city: 'New York',
        country: 'USA',
        departments: ['Engineering', 'Sales', 'HR'],
        stats: {
          employees: 75,
          revenue: 1000000,
          metrics: [
            { month: 'Jan', value: 100 },
            { month: 'Feb', value: 120 },
            { month: 'Mar', value: 150 }
          ]
        }
      },
      {
        city: 'London',
        country: 'UK',
        departments: ['Engineering', 'Support'],
        stats: {
          employees: 50,
          revenue: 750000,
          metrics: [
            { month: 'Jan', value: 80 },
            { month: 'Feb', value: 90 },
            { month: 'Mar', value: 110 }
          ]
        }
      }
    ],
    products: {
      software: [
        {
          name: 'Product A',
          version: '2.1.0',
          features: ['Feature1', 'Feature2', 'Feature3'],
          pricing: {
            basic: 10,
            pro: 50,
            enterprise: 200
          },
          compatibility: [
            { os: 'Windows', versions: ['10', '11'] },
            { os: 'macOS', versions: ['12', '13', '14'] },
            { os: 'Linux', versions: ['Ubuntu', 'Debian'] }
          ]
        }
      ],
      services: {
        consulting: {
          hourlyRate: 150,
          available: true,
          specialties: ['Cloud', 'Security', 'DevOps']
        },
        support: {
          tiers: [
            { name: 'Basic', price: 100, responseTime: '48h' },
            { name: 'Premium', price: 500, responseTime: '4h' },
            { name: 'Enterprise', price: 2000, responseTime: '1h' }
          ]
        }
      }
    }
  },
  
  // Arrays within objects within arrays
  complexData: {
    datasets: [
      {
        name: 'Dataset1',
        points: [
          [0, 1],
          [1, 4],
          [2, 9],
          [3, 16]
        ],
        metadata: {
          created: '2024-01-01',
          tags: ['math', 'squares'],
          processing: {
            steps: [
              { step: 1, action: 'collect' },
              { step: 2, action: 'transform' },
              { step: 3, action: 'analyze' }
            ]
          }
        }
      }
    ]
  },
  
  // Edge cases
  specialStrings: {
    empty: '',
    spaces: '   ',
    newlines: 'Line1\nLine2\nLine3',
    tabs: 'Column1\tColumn2\tColumn3',
    unicode: '😀🎉🚀',
    escaped: 'He said "Hello" and left',
    path: '/usr/local/bin/node',
    regex: '^[a-zA-Z0-9]+$'
  },
  
  // Deeply nested with mixed types
  veryDeep: {
    level1: {
      value: 1,
      level2: {
        value: 2,
        array: [10, 20, 30],
        level3: {
          value: 3,
          items: [
            { id: 'a', data: [1, 2, 3] },
            { id: 'b', data: ['x', 'y', 'z'] }
          ],
          level4: {
            value: 4,
            config: {
              enabled: true,
              options: ['opt1', 'opt2', 'opt3'],
              level5: {
                value: 5,
                final: {
                  message: 'Deep nesting test',
                  numbers: [100, 200, 300],
                  flags: {
                    flag1: true,
                    flag2: false,
                    flag3: null
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  // Array with various nested structures
  mixedStructures: [
    'simple string',
    42,
    true,
    null,
    [1, 2, 3],
    { key: 'value' },
    [
      { nested: true },
      [10, 20, 30],
      {
        deep: {
          array: ['a', 'b', 'c'],
          value: 999
        }
      }
    ],
    {
      complex: {
        data: [
          [1, 2],
          { x: 10, y: 20 },
          ['text', 123, false]
        ]
      }
    }
  ],
  
  // Configuration-like structure
  settings: {
    app: {
      name: 'MyApp',
      version: '1.0.0',
      debug: false,
      features: {
        auth: {
          enabled: true,
          providers: ['google', 'github', 'email'],
          settings: {
            timeout: 3600,
            maxAttempts: 3,
            requireMFA: false
          }
        },
        api: {
          enabled: true,
          rateLimit: 1000,
          endpoints: [
            { path: '/users', methods: ['GET', 'POST'] },
            { path: '/posts', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
          ]
        }
      }
    },
    database: {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      credentials: {
        user: 'admin',
        password: null
      },
      options: {
        ssl: true,
        poolSize: 10,
        timeout: 30000
      }
    }
  }
};

const result = jsonToLLMString(megaComplexObject);
console.log(result);