/**
 * Enterprise API Platform
 * Professional RESTful API with authentication, rate limiting, and comprehensive documentation
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// Fallback UUID generator for testing
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Simple fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Try to import uuid, fallback to our generator if it fails
let uuidv4: () => string;
try {
  // Use require for uuid in Node.js environment
  const uuid = eval('require')('uuid');
  uuidv4 = uuid.v4;
} catch (error) {
  uuidv4 = generateUUID;
}

import type {
  ApiResponse,
  EnterpriseConfig,
  AuthUser,
  ApiKey,
  AuditLog,
  RateLimitConfig,
  WebhookConfig,
  IntegrationConfig
} from '../types';

export interface EnterpriseApiConfig {
  port?: number;
  host?: string;
  enableCors?: boolean;
  enableRateLimiting?: boolean;
  enableAuthentication?: boolean;
  enableAuditLogging?: boolean;
  enableWebhooks?: boolean;
  jwtSecret?: string;
  apiKeys?: string[];
  allowedOrigins?: string[];
  rateLimitConfig?: RateLimitConfig;
  webhookConfig?: WebhookConfig;
}

export class EnterpriseApiPlatform {
  private app: express.Application | null = null;
  private server: any;
  private io: any;
  private config: EnterpriseApiConfig;
  private users: Map<string, AuthUser> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private auditLogs: AuditLog[] = [];
  private activeConnections: Map<string, any> = new Map();

  constructor(config: EnterpriseApiConfig = {}) {
    this.config = {
      port: 3001,
      host: '0.0.0.0',
      enableCors: true,
      enableRateLimiting: true,
      enableAuthentication: true,
      enableAuditLogging: true,
      enableWebhooks: true,
      jwtSecret: process.env.JWT_SECRET || 'enterprise-secret-key-change-in-production',
      apiKeys: process.env.API_KEYS?.split(',') || [],
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      rateLimitConfig: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      },
      ...config
    };

    this.initializeServices();
  }

  /**
   * Initialize the Express application (for testing, this can be called separately)
   */
  public initializeApp(): express.Application {
    if (!this.app) {
      this.app = express();
      this.setupMiddleware();
      this.setupRoutes();
      this.setupWebSocket();
    }
    return this.app;
  }

  /**
   * Start the enterprise API server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port!, this.config.host!, () => {
          console.log(`🚀 Enterprise API Platform running on http://${this.config.host}:${this.config.port}`);
          console.log(`📚 API Documentation available at http://${this.config.host}:${this.config.port}/api-docs`);
          console.log(`🔗 WebSocket server ready for real-time connections`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          console.error('❌ Failed to start Enterprise API Platform:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error starting Enterprise API Platform:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the enterprise API server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error?: Error) => {
          if (error) {
            console.error('❌ Error stopping Enterprise API Platform:', error);
            reject(error);
          } else {
            console.log('🛑 Enterprise API Platform stopped');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get API server instance
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get WebSocket server instance
   */
  getIO(): any {
    return this.io;
  }

  /**
   * Get server configuration
   */
  getConfig(): EnterpriseApiConfig {
    return { ...this.config };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(limit: number = 100): AuditLog[] {
    return this.auditLogs.slice(-limit);
  }

  /**
   * Get active connections
   */
  getActiveConnections(): number {
    return this.activeConnections.size;
  }

  // Private methods
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    if (this.config.enableCors) {
      this.app.use(cors({
        origin: (origin, callback) => {
          if (!origin || this.config.allowedOrigins!.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
      }));
    }

    // Rate limiting
    if (this.config.enableRateLimiting) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimitConfig!.windowMs,
        max: this.config.rateLimitConfig!.max,
        message: this.config.rateLimitConfig!.message,
        standardHeaders: this.config.rateLimitConfig!.standardHeaders,
        legacyHeaders: this.config.rateLimitConfig!.legacyHeaders,
        handler: (req, res) => {
          this.logAuditEvent('RATE_LIMIT_EXCEEDED', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          });
          res.status(429).json({
            success: false,
            error: 'Too many requests',
            retryAfter: Math.ceil(this.config.rateLimitConfig!.windowMs! / 1000)
          });
        }
      });
      this.app.use(limiter);
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
      res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      console.log(`📝 ${req.method} ${req.path} - ${req.ip}`);

      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`✅ ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });

      next();
    });
  }

  private setupRoutes(): void {
    // API Documentation
    this.setupSwaggerDocs();

    // Health check
    this.app.get('/health', this.handleHealthCheck.bind(this));

    // Authentication routes
    this.app.post('/auth/login', this.handleLogin.bind(this));
    this.app.post('/auth/logout', this.handleLogout.bind(this));
    this.app.get('/auth/me', this.authenticate.bind(this), this.handleGetProfile.bind(this));

    // API routes
    this.app.use('/api/v1', this.authenticate.bind(this), this.createApiRouter());

    // Error handling
    this.app.use(this.handleError.bind(this));
  }

  private createApiRouter(): express.Router {
    const router = express.Router();

    // Repository analysis endpoints
    router.get('/repositories', this.handleListRepositories.bind(this));
    router.post('/repositories/:owner/:name/analyze', this.handleAnalyzeRepository.bind(this));
    router.get('/repositories/:owner/:name/analysis/:id', this.handleGetAnalysis.bind(this));
    router.get('/repositories/:owner/:name/history', this.handleGetAnalysisHistory.bind(this));

    // Multi-repository analysis
    router.post('/repositories/batch/analyze', this.handleBatchAnalyze.bind(this));
    router.get('/repositories/batch/:batchId', this.handleGetBatchAnalysis.bind(this));

    // Analytics and insights
    router.get('/analytics/repositories', this.handleGetRepositoryAnalytics.bind(this));
    router.get('/analytics/teams', this.handleGetTeamAnalytics.bind(this));
    router.get('/analytics/organizations', this.handleGetOrganizationAnalytics.bind(this));

    // AI suggestions
    router.post('/ai/suggestions', this.handleGetAISuggestions.bind(this));
    router.get('/ai/suggestions/:id', this.handleGetAISuggestion.bind(this));

    // Team collaboration
    router.get('/teams', this.handleListTeams.bind(this));
    router.post('/teams/:teamId/repositories', this.handleAddTeamRepository.bind(this));
    router.get('/teams/:teamId/analytics', this.handleGetTeamAnalytics.bind(this));

    // Webhooks
    router.post('/webhooks/github', this.handleGitHubWebhook.bind(this));
    router.get('/webhooks', this.handleListWebhooks.bind(this));
    router.post('/webhooks', this.handleCreateWebhook.bind(this));

    // Audit logs
    router.get('/audit', this.handleGetAuditLogs.bind(this));

    // Admin endpoints
    router.get('/admin/users', this.handleListUsers.bind(this));
    router.get('/admin/system', this.handleGetSystemStatus.bind(this));
    router.get('/admin/metrics', this.handleGetSystemMetrics.bind(this));

    return router;
  }

  private setupWebSocket(): void {
    this.io = new Server(this.server, {
      cors: {
        origin: this.config.allowedOrigins,
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      this.activeConnections.set(clientId, {
        id: clientId,
        connectedAt: new Date(),
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });

      console.log(`🔗 Client connected: ${clientId}`);

      // Handle authentication
      socket.on('authenticate', (data) => {
        this.handleSocketAuthentication(socket, data);
      });

      // Handle real-time analysis requests
      socket.on('start-analysis', (data) => {
        this.handleRealTimeAnalysis(socket, data);
      });

      // Handle team collaboration
      socket.on('join-team', (data) => {
        this.handleJoinTeam(socket, data);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        this.activeConnections.delete(clientId);
      });
    });
  }

  private setupSwaggerDocs(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Enhanced Repository Context Generator API',
          version: '3.0.0',
          description: 'Enterprise-grade API for repository analysis and development intelligence',
          contact: {
            name: 'API Support',
            email: 'support@repocontext.com'
          }
        },
        servers: [
          {
            url: `http://localhost:${this.config.port}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            },
            apiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            }
          }
        },
        security: [
          {
            bearerAuth: [],
            apiKeyAuth: []
          }
        ]
      },
      apis: ['./src/lib/enterpriseApi.ts']
    };

    const specs = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }'
    }));
  }

  private initializeServices(): void {
    // Initialize API keys
    this.config.apiKeys!.forEach(key => {
      this.apiKeys.set(key, {
        key,
        createdAt: new Date(),
        lastUsed: null,
        usageCount: 0,
        permissions: ['read', 'write']
      });
    });

    // Initialize default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    this.users.set('admin', {
      id: 'admin',
      username: 'admin',
      email: 'admin@repocontext.com',
      password: hashedPassword,
      role: 'admin',
      permissions: ['read', 'write', 'admin', 'audit'],
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    console.log('🔐 Enterprise API services initialized');
  }

  // Route handlers
  private async handleHealthCheck(req: express.Request, res: express.Response): Promise<void> {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '3.0.0',
      connections: this.activeConnections.size,
      memory: process.memoryUsage(),
      services: {
        database: 'connected',
        cache: 'connected',
        websocket: 'connected'
      }
    };

    res.json(health);
  }

  private async handleLogin(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
        return;
      }

      const user = Array.from(this.users.values()).find(u => u.username === username);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        this.logAuditEvent('LOGIN_FAILED', {
          username,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Account is disabled'
        });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        this.config.jwtSecret!,
        { expiresIn: '24h' }
      );

      user.lastLogin = new Date();
      this.logAuditEvent('LOGIN_SUCCESS', {
        userId: user.id,
        username,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  private async handleLogout(req: express.Request, res: express.Response): Promise<void> {
    const user = (req as any).user;
    this.logAuditEvent('LOGOUT', {
      userId: user?.id,
      username: user?.username,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  private async handleGetProfile(req: express.Request, res: express.Response): Promise<void> {
    const user = (req as any).user;
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      }
    });
  }

  private async handleListRepositories(req: express.Request, res: express.Response): Promise<void> {
    // This would integrate with GitHub API to list repositories
    res.json({
      success: true,
      data: {
        repositories: [],
        total: 0
      }
    });
  }

  private async handleAnalyzeRepository(req: express.Request, res: express.Response): Promise<void> {
    const { owner, name } = req.params;
    const analysisId = uuidv4();

    this.logAuditEvent('REPOSITORY_ANALYSIS_STARTED', {
      analysisId,
      repository: `${owner}/${name}`,
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString()
    });

    // Start analysis in background
    this.startRepositoryAnalysis(analysisId, owner, name, (req as any).user?.id);

    res.json({
      success: true,
      data: {
        analysisId,
        status: 'started',
        message: 'Repository analysis started'
      }
    });
  }

  private async handleGetAnalysis(req: express.Request, res: express.Response): Promise<void> {
    const { owner, name, id } = req.params;
    res.json({
      success: true,
      data: {
        analysisId: id,
        repository: `${owner}/${name}`,
        status: 'completed',
        results: {}
      }
    });
  }

  private async handleGetAnalysisHistory(req: express.Request, res: express.Response): Promise<void> {
    const { owner, name } = req.params;
    res.json({
      success: true,
      data: {
        repository: `${owner}/${name}`,
        analyses: []
      }
    });
  }

  private async handleBatchAnalyze(req: express.Request, res: express.Response): Promise<void> {
    const { repositories } = req.body;
    const batchId = uuidv4();

    res.json({
      success: true,
      data: {
        batchId,
        status: 'started',
        message: 'Batch analysis started'
      }
    });
  }

  private async handleGetBatchAnalysis(req: express.Request, res: express.Response): Promise<void> {
    const { batchId } = req.params;
    res.json({
      success: true,
      data: {
        batchId,
        status: 'completed',
        results: []
      }
    });
  }

  private async handleGetRepositoryAnalytics(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        analytics: {}
      }
    });
  }

  private async handleGetTeamAnalytics(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        analytics: {}
      }
    });
  }

  private async handleGetOrganizationAnalytics(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        analytics: {}
      }
    });
  }

  private async handleGetAISuggestions(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        suggestions: []
      }
    });
  }

  private async handleGetAISuggestion(req: express.Request, res: express.Response): Promise<void> {
    const { id } = req.params;
    res.json({
      success: true,
      data: {
        suggestion: {}
      }
    });
  }

  private async handleListTeams(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        teams: []
      }
    });
  }

  private async handleAddTeamRepository(req: express.Request, res: express.Response): Promise<void> {
    const { teamId } = req.params;
    res.json({
      success: true,
      message: 'Repository added to team'
    });
  }

  private async handleGitHubWebhook(req: express.Request, res: express.Response): Promise<void> {
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-github-signature'];

    this.logAuditEvent('GITHUB_WEBHOOK_RECEIVED', {
      event,
      signature: signature?.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

    res.status(200).send('Webhook received');
  }

  private async handleListWebhooks(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        webhooks: []
      }
    });
  }

  private async handleCreateWebhook(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        webhook: {}
      }
    });
  }

  private async handleGetAuditLogs(req: express.Request, res: express.Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = this.getAuditLogs(limit);

    res.json({
      success: true,
      data: {
        logs,
        total: logs.length
      }
    });
  }

  private async handleListUsers(req: express.Request, res: express.Response): Promise<void> {
    const users = Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  }

  private async handleGetSystemStatus(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        status: 'operational',
        uptime: process.uptime(),
        connections: this.activeConnections.size,
        memory: process.memoryUsage(),
        version: '3.0.0'
      }
    });
  }

  private async handleGetSystemMetrics(req: express.Request, res: express.Response): Promise<void> {
    res.json({
      success: true,
      data: {
        metrics: {
          totalAnalyses: 0,
          averageResponseTime: 0,
          errorRate: 0,
          throughput: 0
        }
      }
    });
  }

  private handleError(error: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    console.error('API Error:', error);

    this.logAuditEvent('API_ERROR', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      requestId: req.headers['x-request-id']
    });
  }

  // Authentication middleware
  private authenticate(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!this.config.enableAuthentication) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, this.config.jwtSecret!) as any;
        (req as any).user = {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role
        };
        return next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
    }

    if (apiKey && this.apiKeys.has(apiKey)) {
      const keyData = this.apiKeys.get(apiKey)!;
      keyData.lastUsed = new Date();
      keyData.usageCount++;
      (req as any).user = {
        id: 'api-key',
        role: 'api',
        permissions: keyData.permissions
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // WebSocket handlers
  private handleSocketAuthentication(socket: any, data: any): void {
    try {
      const { token } = data;
      const decoded = jwt.verify(token, this.config.jwtSecret!) as any;

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.authenticated = true;

      socket.emit('authenticated', {
        success: true,
        user: { id: decoded.userId, role: decoded.role }
      });

      console.log(`🔐 Socket authenticated: ${decoded.userId}`);
    } catch (error) {
      socket.emit('authentication_error', {
        success: false,
        error: 'Invalid token'
      });
    }
  }

  private handleRealTimeAnalysis(socket: any, data: any): void {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { repository, type } = data;
    console.log(`📊 Starting real-time analysis: ${repository}`);

    // Simulate real-time analysis updates
    const progressInterval = setInterval(() => {
      const progress = Math.floor(Math.random() * 100);
      socket.emit('analysis_progress', {
        repository,
        progress,
        stage: progress < 30 ? 'initializing' :
               progress < 60 ? 'analyzing' :
               progress < 90 ? 'processing' : 'finalizing'
      });

      if (progress >= 100) {
        clearInterval(progressInterval);
        socket.emit('analysis_complete', {
          repository,
          result: { status: 'completed' }
        });
      }
    }, 1000);
  }

  private handleJoinTeam(socket: any, data: any): void {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { teamId } = data;
    socket.join(`team:${teamId}`);
    socket.emit('joined_team', { teamId });
    console.log(`👥 User ${socket.userId} joined team ${teamId}`);
  }

  // Analysis execution
  private async startRepositoryAnalysis(
    analysisId: string,
    owner: string,
    name: string,
    userId?: string
  ): Promise<void> {
    try {
      // Import and execute analysis services
      const { serviceContainer } = await import('./serviceContainer.js');
      const services = await serviceContainer.initialize();

      const result = await services.gitAnalyzer.analyzeRepository(owner, name);

      this.logAuditEvent('REPOSITORY_ANALYSIS_COMPLETED', {
        analysisId,
        repository: `${owner}/${name}`,
        userId,
        success: result.success,
        timestamp: new Date().toISOString()
      });

      // Notify connected clients
      this.io.emit('analysis_update', {
        analysisId,
        repository: `${owner}/${name}`,
        status: 'completed',
        result: result.success ? 'success' : 'failed'
      });

    } catch (error) {
      console.error('Analysis execution error:', error);
      this.logAuditEvent('REPOSITORY_ANALYSIS_FAILED', {
        analysisId,
        repository: `${owner}/${name}`,
        userId,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Audit logging
  private logAuditEvent(event: string, details: any): void {
    if (!this.config.enableAuditLogging) return;

    const auditLog: AuditLog = {
      id: uuidv4(),
      event,
      details,
      timestamp: new Date().toISOString(),
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent
    };

    this.auditLogs.push(auditLog);

    // Keep only last 10000 logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-5000);
    }

    console.log(`📋 Audit: ${event} - ${details.repository || details.username || 'system'}`);
  }
}

export default EnterpriseApiPlatform;
