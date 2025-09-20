/**
 * Enterprise API Platform Tests
 * Comprehensive testing for RESTful API, authentication, and middleware
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EnterpriseApiPlatform } from '../enterpriseApi';
import type { AuthUser, ApiKey, AuditLog } from '../../types';

describe('EnterpriseApiPlatform', () => {
  let apiPlatform: EnterpriseApiPlatform;
  let mockUsers: AuthUser[];
  let mockApiKeys: ApiKey[];
  let mockAuditLogs: AuditLog[];

  beforeEach(() => {
    // Initialize test data
    mockUsers = [
      {
        id: 'user1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'admin',
        permissions: ['read:all', 'write:all', 'admin:all'],
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      },
      {
        id: 'user2',
        username: 'user',
        email: 'user@example.com',
        password: 'hashed_password',
        role: 'user',
        permissions: ['read:own', 'write:own'],
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      }
    ];

    mockApiKeys = [
      {
        key: 'test-api-key-123',
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 5,
        permissions: ['read:public']
      }
    ];

    mockAuditLogs = [];

    // Mock the API platform
    apiPlatform = new EnterpriseApiPlatform({
      port: 3000,
      enableCors: true,
      enableRateLimiting: true,
      enableAuthentication: true,
      enableAuditLogging: true,
      jwtSecret: 'test-jwt-secret',
      apiKeys: ['test-api-key-123']
    });

    // Initialize the Express app for testing
    apiPlatform.initializeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      const result = await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user?.role).toBe('admin');
    });

    it('should reject authentication with invalid credentials', async () => {
      const result = await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'wrong-password'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate JWT tokens', async () => {
      const authResult = await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      expect(authResult.success).toBe(true);
      expect(authResult.token).toBeDefined();

      const validationResult = await apiPlatform.validateToken(authResult.token!);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.user).toBeDefined();
    });

    it('should reject invalid JWT tokens', async () => {
      const validationResult = await apiPlatform.validateToken('invalid-token');
      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toBeDefined();
    });

    it('should validate API keys', async () => {
      const validationResult = await apiPlatform.validateApiKey('test-api-key-123');
      expect(validationResult.valid).toBe(true);
      expect(validationResult.permissions).toContain('read:public');
    });

    it('should reject invalid API keys', async () => {
      const validationResult = await apiPlatform.validateApiKey('invalid-api-key');
      expect(validationResult.valid).toBe(false);
    });
  });

  describe('Authorization', () => {
    it('should authorize admin user for all actions', async () => {
      const user = mockUsers[0]; // admin user
      const result = await apiPlatform.authorizeAction(user, 'repositories', 'read');

      expect(result.authorized).toBe(true);
    });

    it('should authorize user for own resources', async () => {
      const user = mockUsers[1]; // regular user
      const result = await apiPlatform.authorizeAction(user, 'repositories', 'read');

      expect(result.authorized).toBe(true);
    });

    it('should reject unauthorized actions', async () => {
      const user = mockUsers[1]; // regular user
      const result = await apiPlatform.authorizeAction(user, 'admin', 'write');

      expect(result.authorized).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const userId = 'user1';
      const endpoint = '/api/repositories';

      for (let i = 0; i < 10; i++) {
        const result = await apiPlatform.checkRateLimit(userId, endpoint);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding rate limit', async () => {
      const userId = 'user1';
      const endpoint = '/api/repositories';

      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        await apiPlatform.checkRateLimit(userId, endpoint);
      }

      const result = await apiPlatform.checkRateLimit(userId, endpoint);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    it('should log authentication events', async () => {
      const authResult = await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      expect(authResult.success).toBe(true);

      const auditLogs = await apiPlatform.getAuditLogs({
        eventType: 'AUTH_SUCCESS',
        limit: 10
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].event).toBe('AUTH_SUCCESS');
      expect(auditLogs[0].userId).toBe('admin');
    });

    it('should log API access events', async () => {
      await apiPlatform.logApiAccess({
        method: 'GET',
        endpoint: '/api/repositories',
        userId: 'user1',
        ip: '192.168.1.100',
        userAgent: 'test-agent'
      });

      const auditLogs = await apiPlatform.getAuditLogs({
        eventType: 'API_ACCESS',
        limit: 10
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].event).toBe('API_ACCESS');
      expect(auditLogs[0].details.method).toBe('GET');
      expect(auditLogs[0].details.endpoint).toBe('/api/repositories');
    });

    it('should filter audit logs by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const endDate = new Date();

      const auditLogs = await apiPlatform.getAuditLogs({
        startDate,
        endDate,
        limit: 100
      });

      expect(auditLogs.length).toBeGreaterThanOrEqual(0);
      auditLogs.forEach(log => {
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('CORS', () => {
    it('should allow requests from allowed origins', async () => {
      const result = await apiPlatform.validateCorsOrigin('https://allowed-domain.com');
      expect(result.allowed).toBe(true);
    });

    it('should reject requests from disallowed origins', async () => {
      const result = await apiPlatform.validateCorsOrigin('https://malicious-site.com');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('should set appropriate security headers', async () => {
      const headers = await apiPlatform.getSecurityHeaders();

      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Content-Security-Policy');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      const result = await apiPlatform.authenticateUser({
        username: 'nonexistent',
        password: 'password'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain('password'); // Should not leak sensitive info
    });

    it('should handle rate limiting errors', async () => {
      const userId = 'user1';
      const endpoint = '/api/repositories';

      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        await apiPlatform.checkRateLimit(userId, endpoint);
      }

      const result = await apiPlatform.checkRateLimit(userId, endpoint);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed requests', async () => {
      const result = await apiPlatform.validateRequest({
        method: 'INVALID',
        endpoint: '/api/repositories',
        headers: {}
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const promises = Array.from({ length: 10 }, () =>
        apiPlatform.authenticateUser({
          username: 'admin',
          password: 'admin123'
        })
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should cache authentication results', async () => {
      const startTime = Date.now();

      await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      const firstAuthTime = Date.now() - startTime;

      const secondStartTime = Date.now();
      await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      const secondAuthTime = Date.now() - secondStartTime;

      // Second authentication should be faster due to caching
      expect(secondAuthTime).toBeLessThan(firstAuthTime);
    });
  });

  describe('Integration', () => {
    it('should integrate with real-time collaboration', async () => {
      const authResult = await apiPlatform.authenticateUser({
        username: 'admin',
        password: 'admin123'
      });

      expect(authResult.success).toBe(true);

      // Test WebSocket connection
      const wsResult = await apiPlatform.initializeWebSocket(authResult.token!);
      expect(wsResult.success).toBe(true);
      expect(wsResult.connectionId).toBeDefined();
    });

    it('should integrate with security manager', async () => {
      const securityResult = await apiPlatform.validateSecurityContext({
        userId: 'user1',
        resource: 'repositories',
        action: 'read'
      });

      expect(securityResult.authorized).toBe(true);
      expect(securityResult.securityLevel).toBeDefined();
    });

    it('should integrate with analytics engine', async () => {
      const analyticsResult = await apiPlatform.generateAnalytics({
        userId: 'user1',
        repository: 'test/repo',
        metrics: ['performance', 'security', 'quality']
      });

      expect(analyticsResult.success).toBe(true);
      expect(analyticsResult.data).toBeDefined();
    });
  });
});
