// Jest setup file for comprehensive testing
// jest is already available as a global in Jest environment

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting comprehensive test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Create mock repository data
  createMockRepository: (overrides = {}) => ({
    owner: 'test-owner',
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    description: 'Test repository for testing',
    private: false,
    fork: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    pushed_at: '2023-01-03T00:00:00Z',
    language: 'TypeScript',
    languages: { TypeScript: 100 },
    ...overrides
  }),

  // Create mock commit data
  createMockCommits: (count = 10) => {
    const commits = [];
    for (let i = 0; i < count; i++) {
      commits.push({
        sha: `commit-${i}`,
        message: `Test commit ${i}`,
        author: {
          name: `Author ${i}`,
          email: `author${i}@example.com`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        },
        committer: {
          name: `Committer ${i}`,
          email: `committer${i}@example.com`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        },
        stats: {
          additions: Math.floor(Math.random() * 100),
          deletions: Math.floor(Math.random() * 50),
          total: Math.floor(Math.random() * 150)
        }
      });
    }
    return commits;
  },

  // Create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    permissions: ['read:all', 'write:all', 'admin:all'],
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    ...overrides
  }),

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200
  })
);

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock crypto for JWT and encryption
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => [])
  }
});

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
  href: url,
  origin: url.split('/').slice(0, 3).join('/'),
  pathname: '/' + url.split('/').slice(3).join('/'),
  searchParams: new Map()
}));

// Mock process.env for environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret',
  API_KEY: 'test-api-key',
  GITHUB_TOKEN: 'test-github-token'
};

// Mock bcryptjs for testing
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((password, saltRounds) => `hashed_${password}`),
  compareSync: jest.fn((password, hash) => password === hash.replace('hashed_', '')),
  genSaltSync: jest.fn(() => 'salt'),
  hash: jest.fn((password, saltRounds) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(password === hash.replace('hashed_', ''))),
  genSalt: jest.fn(() => Promise.resolve('salt'))
}));

// Set test timeout
jest.setTimeout(10000);
