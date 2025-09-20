/**
 * Service Container with Dependency Injection
 * Manages all services and their dependencies for the Repository Context Generator
 */

import type { EnvironmentConfig, ServiceConfig } from '../types';
import GitHubService from './github';
import ContextGenerator from './contextGenerator';
import MCPServer from './mcpServer';
import AdvancedGitAnalyzer from './advancedGitAnalyzer';
import DependencyGraphAnalyzer from './dependencyGraphAnalyzer';

export interface ServiceDependencies {
  githubService: GitHubService;
  contextGenerator: ContextGenerator;
  mcpServer: MCPServer;
  gitAnalyzer: AdvancedGitAnalyzer;
  dependencyAnalyzer: DependencyGraphAnalyzer;
}

export class ServiceContainer {
  private static instance: ServiceContainer;
  private dependencies: Partial<ServiceDependencies> = {};
  private config: EnvironmentConfig;

  private constructor(config: EnvironmentConfig = {}) {
    this.config = {
      cacheEnabled: true,
      debugMode: false,
      ...config
    };
  }

  /**
   * Get singleton instance of ServiceContainer
   */
  public static getInstance(config?: EnvironmentConfig): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer(config);
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services with their dependencies
   */
  public async initialize(): Promise<ServiceDependencies> {
    if (Object.keys(this.dependencies).length === 0) {
      await this.initializeServices();
    }
    return this.dependencies as ServiceDependencies;
  }

  /**
   * Get a specific service
   */
  public getService<K extends keyof ServiceDependencies>(
    serviceName: K
  ): ServiceDependencies[K] {
    const service = this.dependencies[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not initialized. Call initialize() first.`);
    }
    return service;
  }

  /**
   * Initialize all services
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize GitHub service with configuration
      const githubConfig = {
        token: this.config.githubToken,
        retries: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2
        }
      };

      const githubService = new GitHubService(githubConfig);
      this.dependencies.githubService = githubService;

      // Initialize Context Generator with configuration
      const contextGenerator = new ContextGenerator({
        outputFormat: 'markdown',
        includeTimestamps: true,
        includeVersioning: true
      });
      this.dependencies.contextGenerator = contextGenerator;

      // Initialize MCP Server with configuration
      const mcpServer = new MCPServer({
        tools: {},
        resources: {},
        customTemplates: new Map()
      });
      this.dependencies.mcpServer = mcpServer;

      // Initialize Advanced Git Analyzer with configuration
      const gitAnalyzer = new AdvancedGitAnalyzer(this.config.githubToken, {
        max_commits: 1000,
        include_branches: true,
        include_file_analysis: true,
        include_author_analysis: true
      });
      this.dependencies.gitAnalyzer = gitAnalyzer;

      // Initialize Dependency Graph Analyzer with configuration
      const dependencyAnalyzer = new DependencyGraphAnalyzer(this.config.githubToken, {
        format: 'mermaid',
        includeDevDependencies: false,
        vulnerabilityCheck: true,
        licenseCheck: true
      });
      this.dependencies.dependencyAnalyzer = dependencyAnalyzer;

      if (this.config.debugMode) {
        console.log('✅ All services initialized successfully');
        console.log(`📊 Cache enabled: ${this.config.cacheEnabled}`);
        console.log(`🐛 Debug mode: ${this.config.debugMode}`);
        console.log(`🔍 Git analysis enabled: true`);
        console.log(`🔗 Dependency analysis enabled: true`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw new Error(`Service initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Update environment configuration
   */
  public updateConfig(newConfig: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.debugMode) {
      console.log('🔧 Configuration updated:', newConfig);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Reset all services and cache
   */
  public async reset(): Promise<void> {
    // Clear service cache
    const githubService = this.dependencies.githubService;
    if (githubService && typeof githubService.clearCache === 'function') {
      githubService.clearCache();
    }

    // Reset dependencies
    this.dependencies = {};

    if (this.config.debugMode) {
      console.log('🔄 Services reset completed');
    }
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): {
    githubService: boolean;
    contextGenerator: boolean;
    mcpServer: boolean;
    gitAnalyzer: boolean;
    dependencyAnalyzer: boolean;
    overall: boolean;
  } {
    const githubService = !!this.dependencies.githubService;
    const contextGenerator = !!this.dependencies.contextGenerator;
    const mcpServer = !!this.dependencies.mcpServer;
    const gitAnalyzer = !!this.dependencies.gitAnalyzer;
    const dependencyAnalyzer = !!this.dependencies.dependencyAnalyzer;

    return {
      githubService,
      contextGenerator,
      mcpServer,
      gitAnalyzer,
      dependencyAnalyzer,
      overall: githubService && contextGenerator && mcpServer && gitAnalyzer && dependencyAnalyzer
    };
  }

  /**
   * Validate environment configuration
   */
  public validateEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for required environment variables
    if (!process.env.VITE_GITHUB_TOKEN && !this.config.githubToken) {
      issues.push('GitHub token not configured');
    }

    // Check for development/production mode
    if (process.env.NODE_ENV === 'production' && this.config.debugMode) {
      issues.push('Debug mode should be disabled in production');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();
