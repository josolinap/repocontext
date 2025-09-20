/**
 * Enhanced MCP Server with TypeScript
 * Provides tools and resources for IDE integration with comprehensive type safety
 */

import type {
  MCPServerConfig,
  MCPTool,
  MCPResource,
  MCPToolCall,
  MCPResourceRequest,
  MCPToolResult,
  MCPResourceResponse,
  MCPCapabilities,
  MCPError,
  MCPAnalysisData,
  MCPTemplate,
  MCPDeploymentGuide,
  MCPProjectScaffold,
  MCPArchitecturePatterns,
  GitHubAnalysisResult
} from '../types';

class MCPServer {
  private tools: Record<string, Function>;
  private resources: Record<string, Function>;
  private customTemplates: Map<string, any>;
  private currentAnalysis: MCPAnalysisData | null;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig = {}) {
    this.config = config;
    this.tools = {
      'analyze_repository': this.analyzeRepository.bind(this),
      'generate_context': this.generateContext.bind(this),
      'list_templates': this.listTemplates.bind(this),
      'get_repository_info': this.getRepositoryInfo.bind(this),
      // Advanced tools inspired by detailer.ginylil.com and MCP servers
      'analyze_code_quality': this.analyzeCodeQuality.bind(this),
      'compare_repositories': this.compareRepositories.bind(this),
      'generate_dependency_graph': this.generateDependencyGraph.bind(this),
      'analyze_security_vulnerabilities': this.analyzeSecurityVulnerabilities.bind(this),
      'create_custom_template': this.createCustomTemplate.bind(this),
      'analyze_team_collaboration': this.analyzeTeamCollaboration.bind(this),
      'generate_deployment_guide': this.generateDeploymentGuide.bind(this),
      'analyze_performance_metrics': this.analyzePerformanceMetrics.bind(this),
      'create_project_scaffold': this.createProjectScaffold.bind(this),
      'analyze_architecture_patterns': this.analyzeArchitecturePatterns.bind(this),
      // Advanced Git Analysis Tools
      'analyze_git_history': this.analyzeGitHistory.bind(this),
      'detect_hot_files': this.detectHotFiles.bind(this),
      'analyze_code_churn': this.analyzeCodeChurn.bind(this),
      'calculate_development_velocity': this.calculateDevelopmentVelocity.bind(this),
      'analyze_contributor_patterns': this.analyzeContributorPatterns.bind(this),
      'assess_repository_health': this.assessRepositoryHealth.bind(this),
      // Dependency Graph Analysis Tools
      'analyze_dependencies': this.analyzeDependencies.bind(this),
      'check_vulnerabilities': this.checkVulnerabilities.bind(this),
      'check_licenses': this.checkLicenses.bind(this),
      'generate_dependency_report': this.generateDependencyReport.bind(this)
    };

    this.resources = {
      'repository://current': this.getCurrentRepository.bind(this),
      'templates://list': this.getTemplatesList.bind(this),
      'context://preview': this.getContextPreview.bind(this),
      // Advanced resources
      'analysis://code-quality': this.getCodeQualityAnalysis.bind(this),
      'comparison://repositories': this.getRepositoryComparison.bind(this),
      'graph://dependencies': this.getDependencyGraph.bind(this),
      'security://vulnerabilities': this.getSecurityReport.bind(this),
      'collaboration://team': this.getTeamCollaborationData.bind(this),
      'performance://metrics': this.getPerformanceMetrics.bind(this),
      'architecture://patterns': this.getArchitecturePatterns.bind(this)
    };

    // Store analysis data
    this.currentAnalysis = null;
    this.customTemplates = new Map();
  }

  // MCP Tools
  async analyzeRepository(args: { owner: string; repo: string; githubToken?: string }): Promise<MCPToolResult> {
    const { owner, repo, githubToken } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      // This would integrate with the GitHub service
      const analysis = await this.performRepositoryAnalysis(owner, repo, githubToken);
      return {
        content: [{
          type: 'text',
          text: `Repository analysis completed for ${owner}/${repo}`
        }],
        data: analysis
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${(error as Error).message}`);
    }
  }

  async generateContext(args: { analysisData: GitHubAnalysisResult; template?: string }): Promise<MCPToolResult> {
    const { analysisData, template = 'comprehensive' } = args;

    if (!analysisData) {
      throw new Error('Analysis data is required');
    }

    try {
      const contextGenerator = await import('./contextGenerator.js');
      const generator = new contextGenerator.default();
      const context = generator.generateContext(analysisData, template);

      return {
        content: [{
          type: 'text',
          text: `Context file generated using ${template} template`
        }],
        data: context
      };
    } catch (error) {
      throw new Error(`Failed to generate context: ${(error as Error).message}`);
    }
  }

  async listTemplates(args: Record<string, never>): Promise<MCPToolResult> {
    const templates: MCPTemplate[] = [
      {
        id: 'comprehensive',
        name: 'Comprehensive Analysis',
        description: 'Complete repository analysis with all details'
      },
      {
        id: 'minimal',
        name: 'Minimal Overview',
        description: 'Basic repository information only'
      },
      {
        id: 'technical',
        name: 'Technical Specs',
        description: 'Technical details and dependencies'
      },
      {
        id: 'overview',
        name: 'Quick Overview',
        description: 'Summary and key facts'
      },
      {
        id: 'rules',
        name: 'Coding Rules',
        description: 'Framework-specific coding rules and standards'
      },
      {
        id: 'workflows',
        name: 'Development Workflows',
        description: 'PR process, release workflow, collaboration guidelines'
      },
      {
        id: 'shortcuts',
        name: 'Productivity Shortcuts',
        description: 'Development commands and productivity tools'
      },
      {
        id: 'scaffold',
        name: 'Project Scaffolds',
        description: 'Component templates and boilerplate code'
      }
    ];

    return {
      content: [{
        type: 'text',
        text: `Available templates: ${templates.map(t => t.name).join(', ')}`
      }],
      data: templates
    };
  }

  async getRepositoryInfo(args: { owner: string; repo: string; githubToken?: string }): Promise<MCPToolResult> {
    const { owner, repo, githubToken } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      // This would fetch basic repository information
      const info = await this.fetchRepositoryInfo(owner, repo, githubToken);
      return {
        content: [{
          type: 'text',
          text: `Repository: ${info.name} (${info.description})`
        }],
        data: info
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${(error as Error).message}`);
    }
  }

  // MCP Resources
  async getCurrentRepository(uri: string): Promise<MCPResourceResponse> {
    // This would return information about the currently analyzed repository
    const currentRepo = this.getCurrentRepositoryData();

    if (!currentRepo) {
      return {
        contents: [{
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify({ error: 'No repository currently analyzed' })
        }]
      };
    }

    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(currentRepo)
      }]
    };
  }

  async getTemplatesList(uri: string): Promise<MCPResourceResponse> {
    const templates = await this.listTemplates({});
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(templates.data)
      }]
    };
  }

  async getContextPreview(uri: string): Promise<MCPResourceResponse> {
    const context = this.getCurrentContextData();

    if (!context) {
      return {
        contents: [{
          uri: uri,
          mimeType: 'text/markdown',
          text: '# No Context Available\n\nNo context file has been generated yet.'
        }]
      };
    }

    return {
      contents: [{
        uri: uri,
        mimeType: 'text/markdown',
        text: context
      }]
    };
  }

  // Helper methods
  private async performRepositoryAnalysis(owner: string, repo: string, githubToken?: string): Promise<GitHubAnalysisResult> {
    try {
      // Import and use the actual GitHub service
      const { default: GitHubService } = await import('./github.js');
      const githubService = new GitHubService({ token: githubToken });
      return await githubService.analyzeRepository(owner, repo);
    } catch (error) {
      console.error('Error in repository analysis:', error);
      throw new Error(`Failed to analyze repository: ${(error as Error).message}`);
    }
  }

  private async fetchRepositoryInfo(owner: string, repo: string, githubToken?: string): Promise<{
    name: string;
    owner: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    issues: number;
  }> {
    // Mock repository info
    return {
      name: repo,
      owner: owner,
      description: 'A sample repository',
      language: 'JavaScript',
      stars: 42,
      forks: 12,
      issues: 3
    };
  }

  private getCurrentRepositoryData(): any {
    // This would return the currently analyzed repository data
    return null; // Not implemented yet
  }

  private getCurrentContextData(): string | null {
    // This would return the currently generated context
    return null; // Not implemented yet
  }

  // Advanced Tools Implementation

  async analyzeCodeQuality(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    branch?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, branch = 'main' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const qualityMetrics = await this.performCodeQualityAnalysis(owner, repo, githubToken, branch);
      return {
        content: [{
          type: 'text',
          text: `Code quality analysis completed for ${owner}/${repo}:${branch}`
        }],
        data: qualityMetrics
      };
    } catch (error) {
      throw new Error(`Failed to analyze code quality: ${(error as Error).message}`);
    }
  }

  async compareRepositories(args: {
    repositories: Array<{ owner: string; name: string }>;
    githubToken?: string;
  }): Promise<MCPToolResult> {
    const { repositories, githubToken } = args;

    if (!repositories || repositories.length < 2) {
      throw new Error('At least 2 repositories are required for comparison');
    }

    try {
      const comparison = await this.performRepositoryComparison(repositories, githubToken);
      return {
        content: [{
          type: 'text',
          text: `Repository comparison completed for ${repositories.length} repositories`
        }],
        data: comparison
      };
    } catch (error) {
      throw new Error(`Failed to compare repositories: ${(error as Error).message}`);
    }
  }

  async generateDependencyGraph(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    format?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, format = 'mermaid' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const graph = await this.createDependencyGraph(owner, repo, githubToken, format);
      return {
        content: [{
          type: 'text',
          text: `Dependency graph generated for ${owner}/${repo} in ${format} format`
        }],
        data: graph
      };
    } catch (error) {
      throw new Error(`Failed to generate dependency graph: ${(error as Error).message}`);
    }
  }

  async analyzeSecurityVulnerabilities(args: {
    owner: string;
    repo: string;
    githubToken?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const securityReport = await this.performSecurityAnalysis(owner, repo, githubToken);
      return {
        content: [{
          type: 'text',
          text: `Security analysis completed for ${owner}/${repo}`
        }],
        data: securityReport
      };
    } catch (error) {
      throw new Error(`Failed to analyze security vulnerabilities: ${(error as Error).message}`);
    }
  }

  async createCustomTemplate(args: {
    name: string;
    description: string;
    sections: string[];
    githubToken?: string;
  }): Promise<MCPToolResult> {
    const { name, description, sections, githubToken } = args;

    if (!name || !sections || sections.length === 0) {
      throw new Error('Template name and sections are required');
    }

    try {
      const template = await this.buildCustomTemplate(name, description, sections, githubToken);
      this.customTemplates.set(name, template);
      return {
        content: [{
          type: 'text',
          text: `Custom template "${name}" created successfully`
        }],
        data: template
      };
    } catch (error) {
      throw new Error(`Failed to create custom template: ${(error as Error).message}`);
    }
  }

  async analyzeTeamCollaboration(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    timeframe?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, timeframe = 30 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const collaborationData = await this.performCollaborationAnalysis(owner, repo, githubToken, timeframe);
      return {
        content: [{
          type: 'text',
          text: `Team collaboration analysis completed for ${owner}/${repo} (${timeframe} days)`
        }],
        data: collaborationData
      };
    } catch (error) {
      throw new Error(`Failed to analyze team collaboration: ${(error as Error).message}`);
    }
  }

  async generateDeploymentGuide(args: {
    analysisData: GitHubAnalysisResult;
    platform?: string;
  }): Promise<MCPToolResult> {
    const { analysisData, platform = 'auto' } = args;

    if (!analysisData) {
      throw new Error('Analysis data is required');
    }

    try {
      const deploymentGuide = await this.createDeploymentGuide(analysisData, platform);
      return {
        content: [{
          type: 'text',
          text: `Deployment guide generated for ${platform} platform`
        }],
        data: deploymentGuide
      };
    } catch (error) {
      throw new Error(`Failed to generate deployment guide: ${(error as Error).message}`);
    }
  }

  async analyzePerformanceMetrics(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    metrics?: string[];
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, metrics = ['complexity', 'maintainability', 'test-coverage'] } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const performanceData = await this.calculatePerformanceMetrics(owner, repo, githubToken, metrics);
      return {
        content: [{
          type: 'text',
          text: `Performance metrics analysis completed for ${owner}/${repo}`
        }],
        data: performanceData
      };
    } catch (error) {
      throw new Error(`Failed to analyze performance metrics: ${(error as Error).message}`);
    }
  }

  async createProjectScaffold(args: {
    template: string;
    framework: string;
    features?: string[];
  }): Promise<MCPToolResult> {
    const { template, framework, features = [] } = args;

    if (!template || !framework) {
      throw new Error('Template and framework are required');
    }

    try {
      const scaffold = await this.generateProjectScaffold(template, framework, features);
      return {
        content: [{
          type: 'text',
          text: `Project scaffold generated for ${framework} with ${features.join(', ')} features`
        }],
        data: scaffold
      };
    } catch (error) {
      throw new Error(`Failed to create project scaffold: ${(error as Error).message}`);
    }
  }

  async analyzeArchitecturePatterns(args: {
    owner: string;
    repo: string;
    githubToken?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const patterns = await this.identifyArchitecturePatterns(owner, repo, githubToken);
      return {
        content: [{
          type: 'text',
          text: `Architecture pattern analysis completed for ${owner}/${repo}`
        }],
        data: patterns
      };
    } catch (error) {
      throw new Error(`Failed to analyze architecture patterns: ${(error as Error).message}`);
    }
  }

  // Advanced Git Analysis Tools Implementation

  async analyzeGitHistory(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      // Import and use the AdvancedGitAnalyzer
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Git analysis failed');
      }

      return {
        content: [{
          type: 'text',
          text: `Git history analysis completed for ${owner}/${repo}. Analyzed ${result.metadata.analyzed_commits} commits in ${result.metadata.analysis_time}ms.`
        }],
        data: result.data
      };
    } catch (error) {
      throw new Error(`Failed to analyze Git history: ${(error as Error).message}`);
    }
  }

  async detectHotFiles(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Hot files detection failed');
      }

      const hotFiles = result.data?.commit_history.hot_files || [];

      return {
        content: [{
          type: 'text',
          text: `Hot files detection completed for ${owner}/${repo}. Found ${hotFiles.length} frequently modified files.`
        }],
        data: {
          hot_files: hotFiles,
          summary: {
            total_files: hotFiles.length,
            critical_files: hotFiles.filter(f => f.impact === 'critical').length,
            high_impact_files: hotFiles.filter(f => f.impact === 'high').length,
            medium_impact_files: hotFiles.filter(f => f.impact === 'medium').length
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to detect hot files: ${(error as Error).message}`);
    }
  }

  async analyzeCodeChurn(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Code churn analysis failed');
      }

      const codeChurn = result.data?.commit_history.code_churn || [];

      return {
        content: [{
          type: 'text',
          text: `Code churn analysis completed for ${owner}/${repo}. Analyzed ${codeChurn.length} files for churn patterns.`
        }],
        data: {
          code_churn: codeChurn,
          summary: {
            total_files: codeChurn.length,
            high_risk_files: codeChurn.filter(f => f.risk === 'high').length,
            medium_risk_files: codeChurn.filter(f => f.risk === 'medium').length,
            avg_complexity: codeChurn.reduce((sum, f) => sum + f.complexity, 0) / Math.max(codeChurn.length, 1)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to analyze code churn: ${(error as Error).message}`);
    }
  }

  async calculateDevelopmentVelocity(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Development velocity calculation failed');
      }

      const velocity = result.data?.commit_history.development_velocity;

      return {
        content: [{
          type: 'text',
          text: `Development velocity analysis completed for ${owner}/${repo}.`
        }],
        data: {
          development_velocity: velocity,
          summary: {
            commits_per_day: velocity?.avg_commits_per_day || 0,
            lines_per_day: velocity?.avg_lines_per_day || 0,
            active_contributors: velocity?.active_contributors || 0,
            development_intensity: velocity?.development_intensity || 'unknown'
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate development velocity: ${(error as Error).message}`);
    }
  }

  async analyzeContributorPatterns(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Contributor pattern analysis failed');
      }

      const authors = result.data?.commit_history.authors || [];
      const patterns = result.data?.commit_history.commit_patterns;

      return {
        content: [{
          type: 'text',
          text: `Contributor pattern analysis completed for ${owner}/${repo}. Analyzed ${authors.length} contributors.`
        }],
        data: {
          contributors: authors,
          commit_patterns: patterns,
          summary: {
            total_contributors: authors.length,
            top_contributors: authors.slice(0, 5).map(a => ({
              name: a.author,
              commits: a.commits,
              productivity_score: a.productivity_score
            })),
            collaboration_score: this.calculateCollaborationScore(authors)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to analyze contributor patterns: ${(error as Error).message}`);
    }
  }

  async assessRepositoryHealth(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    maxCommits?: number;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, maxCommits = 1000 } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: AdvancedGitAnalyzer } = await import('./advancedGitAnalyzer.js');
      const gitAnalyzer = new AdvancedGitAnalyzer(githubToken, { max_commits: maxCommits });

      const result = await gitAnalyzer.analyzeRepository(owner, repo);

      if (!result.success) {
        throw new Error(result.error || 'Repository health assessment failed');
      }

      const health = result.data?.repository_health;
      const recommendations = result.data?.recommendations || [];

      return {
        content: [{
          type: 'text',
          text: `Repository health assessment completed for ${owner}/${repo}. Overall health: ${health?.overall_health || 'unknown'}`
        }],
        data: {
          repository_health: health,
          recommendations,
          summary: {
            overall_score: this.calculateOverallHealthScore(health),
            critical_issues: recommendations.filter(r => r.toLowerCase().includes('critical')).length,
            improvement_areas: recommendations.length
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to assess repository health: ${(error as Error).message}`);
    }
  }

  // Helper methods for Git analysis
  private calculateCollaborationScore(contributors: Array<{ commits: number; productivity_score: number }>): number {
    if (contributors.length === 0) return 0;

    const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
    const avgProductivity = contributors.reduce((sum, c) => sum + c.productivity_score, 0) / contributors.length;

    // Calculate distribution score (lower is better for collaboration)
    const commitDistribution = contributors.map(c => c.commits / totalCommits);
    const giniCoefficient = this.calculateGiniCoefficient(commitDistribution);

    // Collaboration score combines productivity and distribution
    return Math.round((avgProductivity * 0.7) + ((1 - giniCoefficient) * 30));
  }

  private calculateGiniCoefficient(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, val, i) => acc + val * (n - i), 0);

    return (2 * sum) / (n * sorted.reduce((a, b) => a + b, 0)) - (n + 1) / n;
  }

  private calculateOverallHealthScore(health: any): number {
    if (!health) return 0;

    const scores = [
      health.commit_frequency_score || 0,
      health.contributor_diversity_score || 0,
      health.code_churn_score || 0,
      health.branch_management_score || 0
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  // MCP Protocol handlers
  async handleToolCall(toolName: string, args: Record<string, any>): Promise<MCPToolResult> {
    const tool = this.tools[toolName];
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    return await tool(args);
  }

  async handleResourceRequest(uri: string): Promise<MCPResourceResponse> {
    // Parse the URI to determine which resource to return
    const [scheme, path] = uri.split('://');

    if (scheme === 'repository' && path === 'current') {
      return await this.getCurrentRepository(uri);
    }

    if (scheme === 'templates' && path === 'list') {
      return await this.getTemplatesList(uri);
    }

    if (scheme === 'context' && path === 'preview') {
      return await this.getContextPreview(uri);
    }

    // Advanced resources
    if (scheme === 'analysis' && path === 'code-quality') {
      return await this.getCodeQualityAnalysis(uri);
    }

    if (scheme === 'comparison' && path === 'repositories') {
      return await this.getRepositoryComparison(uri);
    }

    if (scheme === 'graph' && path === 'dependencies') {
      return await this.getDependencyGraph(uri);
    }

    if (scheme === 'security' && path === 'vulnerabilities') {
      return await this.getSecurityReport(uri);
    }

    if (scheme === 'collaboration' && path === 'team') {
      return await this.getTeamCollaborationData(uri);
    }

    if (scheme === 'performance' && path === 'metrics') {
      return await this.getPerformanceMetrics(uri);
    }

    if (scheme === 'architecture' && path === 'patterns') {
      return await this.getArchitecturePatterns(uri);
    }

    throw new Error(`Unknown resource: ${uri}`);
  }

  // Advanced Resource Handlers
  async getCodeQualityAnalysis(uri: string): Promise<MCPResourceResponse> {
    const analysis = this.currentAnalysis?.codeQuality;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(analysis || { error: 'No code quality analysis available' })
      }]
    };
  }

  async getRepositoryComparison(uri: string): Promise<MCPResourceResponse> {
    const comparison = this.currentAnalysis?.comparison;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(comparison || { error: 'No repository comparison available' })
      }]
    };
  }

  async getDependencyGraph(uri: string): Promise<MCPResourceResponse> {
    const graph = this.currentAnalysis?.dependencyGraph;
    return {
      contents: [{
        uri: uri,
        mimeType: 'text/plain',
        text: graph || 'graph TD\n  A[No Dependencies] --> B[Available]'
      }]
    };
  }

  async getSecurityReport(uri: string): Promise<MCPResourceResponse> {
    const security = this.currentAnalysis?.security;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(security || { error: 'No security analysis available' })
      }]
    };
  }

  async getTeamCollaborationData(uri: string): Promise<MCPResourceResponse> {
    const collaboration = this.currentAnalysis?.collaboration;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(collaboration || { error: 'No collaboration analysis available' })
      }]
    };
  }

  async getPerformanceMetrics(uri: string): Promise<MCPResourceResponse> {
    const performance = this.currentAnalysis?.performance;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(performance || { error: 'No performance metrics available' })
      }]
    };
  }

  async getArchitecturePatterns(uri: string): Promise<MCPResourceResponse> {
    const patterns = this.currentAnalysis?.architecture;
    return {
      contents: [{
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify(patterns || { error: 'No architecture analysis available' })
      }]
    };
  }

  // MCP Server capabilities
  getCapabilities(): MCPCapabilities {
    return {
      tools: Object.keys(this.tools).map(name => ({
        name,
        description: this.getToolDescription(name),
        inputSchema: this.getToolSchema(name) as MCPTool['inputSchema']
      })),
      resources: Object.keys(this.resources).map(uri => ({
        uri,
        name: this.getResourceName(uri),
        description: this.getResourceDescription(uri),
        mimeType: this.getResourceMimeType(uri)
      }))
    };
  }

  private getToolDescription(toolName: string): string {
    const descriptions: Record<string, string> = {
      'analyze_repository': 'Analyze a GitHub repository and extract key information',
      'generate_context': 'Generate a context file from repository analysis data',
      'list_templates': 'List all available context generation templates',
      'get_repository_info': 'Get basic information about a repository',
      // Advanced tools
      'analyze_code_quality': 'Perform comprehensive code quality analysis including complexity, maintainability, and test coverage',
      'compare_repositories': 'Compare multiple repositories side-by-side with detailed metrics and insights',
      'generate_dependency_graph': 'Generate visual dependency graphs in various formats (Mermaid, DOT, etc.)',
      'analyze_security_vulnerabilities': 'Scan for security vulnerabilities and provide remediation recommendations',
      'create_custom_template': 'Create custom context generation templates with user-defined sections',
      'analyze_team_collaboration': 'Analyze team collaboration patterns, response times, and contribution metrics',
      'generate_deployment_guide': 'Generate deployment guides for various platforms based on repository analysis',
      'analyze_performance_metrics': 'Calculate performance metrics including complexity, maintainability, and test coverage',
      'create_project_scaffold': 'Generate project scaffolding with best practices and framework-specific templates',
      'analyze_architecture_patterns': 'Identify architectural patterns and provide structural recommendations'
    };
    return descriptions[toolName] || 'Unknown tool';
  }

  private getToolSchema(toolName: string): Record<string, any> {
    const schemas: Record<string, Record<string, any>> = {
      'analyze_repository': {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          githubToken: { type: 'string', description: 'GitHub token (optional)' }
        },
        required: ['owner', 'repo']
      },
      'generate_context': {
        type: 'object',
        properties: {
          analysisData: { type: 'object', description: 'Repository analysis data' },
          template: { type: 'string', description: 'Template to use', default: 'comprehensive' }
        },
        required: ['analysisData']
      },
      'list_templates': {
        type: 'object',
        properties: {}
      },
      'get_repository_info': {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          githubToken: { type: 'string', description: 'GitHub token (optional)' }
        },
        required: ['owner', 'repo']
      }
    };
    return schemas[toolName] || { type: 'object', properties: {} };
  }

  private getResourceName(uri: string): string {
    const names: Record<string, string> = {
      'repository://current': 'Current Repository',
      'templates://list': 'Available Templates',
      'context://preview': 'Context Preview'
    };
    return names[uri] || 'Unknown Resource';
  }

  private getResourceDescription(uri: string): string {
    const descriptions: Record<string, string> = {
      'repository://current': 'Information about the currently analyzed repository',
      'templates://list': 'List of all available context generation templates',
      'context://preview': 'Preview of the generated context file'
    };
    return descriptions[uri] || 'Unknown resource';
  }

  private getResourceMimeType(uri: string): string {
    const mimeTypes: Record<string, string> = {
      'repository://current': 'application/json',
      'templates://list': 'application/json',
      'context://preview': 'text/markdown',
      // Advanced resources
      'analysis://code-quality': 'application/json',
      'comparison://repositories': 'application/json',
      'graph://dependencies': 'text/plain',
      'security://vulnerabilities': 'application/json',
      'collaboration://team': 'application/json',
      'performance://metrics': 'application/json',
      'architecture://patterns': 'application/json'
    };
    return mimeTypes[uri] || 'text/plain';
  }

  // Advanced Analysis Implementation Methods

  private async performCodeQualityAnalysis(
    owner: string,
    repo: string,
    githubToken?: string,
    branch: string
  ): Promise<MCPAnalysisData['codeQuality']> {
    // Mock implementation - in real scenario, this would analyze code quality
    return {
      overall: {
        score: 85,
        grade: 'B+',
        issues: 12,
        recommendations: 8
      },
      metrics: {
        complexity: { score: 78, status: 'good', details: 'Code complexity is within acceptable limits' },
        maintainability: { score: 82, status: 'good', details: 'Code is maintainable with current structure' },
        testCoverage: { score: 65, status: 'needs-improvement', details: 'Test coverage could be improved' },
        documentation: { score: 90, status: 'excellent', details: 'Good documentation practices' },
        security: { score: 88, status: 'good', details: 'Security practices are solid' }
      },
      issues: [
        { type: 'complexity', severity: 'medium', file: 'src/main.js', line: 45 },
        { type: 'test-coverage', severity: 'high', file: 'src/utils.js', line: 12 }
      ],
      recommendations: [
        'Add more unit tests to improve coverage',
        'Consider breaking down complex functions',
        'Add JSDoc comments to public APIs'
      ]
    };
  }

  private async performRepositoryComparison(
    repositories: Array<{ owner: string; name: string }>,
    githubToken?: string
  ): Promise<MCPAnalysisData['comparison']> {
    // Mock implementation for repository comparison
    return {
      summary: {
        totalRepos: repositories.length,
        bestPerformer: repositories[0].name,
        averageStars: 125,
        averageIssues: 8
      },
      metrics: repositories.map(repo => ({
        name: repo.name,
        stars: Math.floor(Math.random() * 500),
        forks: Math.floor(Math.random() * 100),
        issues: Math.floor(Math.random() * 20),
        language: 'JavaScript',
        lastCommit: new Date().toISOString()
      })),
      insights: [
        'Repository A has the highest star count',
        'Repository B has better issue management',
        'Consider consolidating similar functionality'
      ]
    };
  }

  private async createDependencyGraph(
    owner: string,
    repo: string,
    githubToken?: string,
    format: string
  ): Promise<string> {
    // Mock implementation for dependency graph
    if (format === 'mermaid') {
      return `graph TD
  A[${repo}] --> B[React]
  A --> C[TypeScript]
  A --> D[Node.js]
  B --> E[React-DOM]
  B --> F[React-Router]
  C --> G[ESLint]
  D --> H[Express]
  D --> I[MongoDB]`;
    }
    return 'Dependency graph generation not implemented for this format';
  }

  private async performSecurityAnalysis(
    owner: string,
    repo: string,
    githubToken?: string
  ): Promise<MCPAnalysisData['security']> {
    // Mock implementation for security analysis
    return {
      overall: {
        score: 92,
        vulnerabilities: 2,
        critical: 0,
        high: 1,
        medium: 1,
        low: 0
      },
      vulnerabilities: [
        {
          severity: 'high',
          package: 'old-package',
          version: '1.2.3',
          description: 'Known security vulnerability',
          fix: 'Upgrade to version 2.0.0'
        },
        {
          severity: 'medium',
          package: 'another-package',
          version: '3.1.0',
          description: 'Potential security issue',
          fix: 'Update to latest version'
        }
      ],
      recommendations: [
        'Update dependencies regularly',
        'Use npm audit regularly',
        'Consider using Snyk or similar tools'
      ]
    };
  }

  private async buildCustomTemplate(
    name: string,
    description: string,
    sections: string[],
    githubToken?: string
  ): Promise<MCPTemplate> {
    // Mock implementation for custom template creation
    return {
      id: name,
      name,
      description,
      sections,
      created: new Date().toISOString(),
      version: '1.0.0',
      template: sections.map(section => `# ${section}\n\nContent for ${section}\n`).join('\n')
    };
  }

  private async performCollaborationAnalysis(
    owner: string,
    repo: string,
    githubToken?: string,
    timeframe: number
  ): Promise<MCPAnalysisData['collaboration']> {
    // Mock implementation for team collaboration analysis
    return {
      period: `${timeframe} days`,
      contributors: {
        total: 8,
        active: 5,
        new: 2
      },
      activity: {
        commits: 47,
        pullRequests: 12,
        issues: 8,
        reviews: 15
      },
      collaboration: {
        avgResponseTime: '4.2 hours',
        codeReviewRate: '85%',
        mergeTime: '2.1 days'
      },
      insights: [
        'Good collaboration patterns observed',
        'Response times are within acceptable range',
        'Consider increasing code review participation'
      ]
    };
  }

  private async createDeploymentGuide(
    analysisData: GitHubAnalysisResult,
    platform: string
  ): Promise<MCPDeploymentGuide> {
    // Mock implementation for deployment guide generation
    const framework = analysisData.analysis?.framework || 'Unknown';
    const language = analysisData.basic?.language || 'Unknown';

    return {
      platform,
      sections: {
        overview: `This guide will help you deploy your ${framework} application to ${platform}.`,
        prerequisites: [`${language} runtime environment`, 'Package manager (npm/yarn)', `${platform} account and CLI tools`],
        buildProcess: `# Install dependencies
npm install

# Build for production
npm run build

# Run tests
npm test`,
        deploymentSteps: [
          `Configure your ${platform} environment`,
          'Set up environment variables',
          'Deploy using the platform CLI',
          'Configure domain and SSL',
          'Set up monitoring and logging'
        ],
        environmentVariables: `NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
API_KEY=your_api_key`,
        monitoring: '- Set up error tracking\n- Configure performance monitoring\n- Set up log aggregation',
        securityConsiderations: '- Use HTTPS in production\n- Implement proper authentication\n- Regular security updates\n- Environment variable security'
      }
    };
  }

  private async calculatePerformanceMetrics(
    owner: string,
    repo: string,
    githubToken?: string,
    metrics: string[]
  ): Promise<Record<string, { score: number; status: string; details: string }>> {
    // Mock implementation for performance metrics
    const results: Record<string, { score: number; status: string; details: string }> = {};

    metrics.forEach(metric => {
      switch (metric) {
        case 'complexity':
          results.complexity = {
            score: Math.floor(Math.random() * 40) + 60,
            status: 'good',
            details: 'Code complexity is within acceptable limits'
          };
          break;
        case 'maintainability':
          results.maintainability = {
            score: Math.floor(Math.random() * 30) + 70,
            status: 'good',
            details: 'Code is maintainable with current structure'
          };
          break;
        case 'test-coverage':
          results.testCoverage = {
            score: Math.floor(Math.random() * 50) + 50,
            status: 'needs-improvement',
            details: 'Test coverage could be improved'
          };
          break;
        default:
          results[metric] = {
            score: Math.floor(Math.random() * 100),
            status: 'unknown',
            details: 'Metric calculation not implemented'
          };
      }
    });

    return results;
  }

  private async generateProjectScaffold(
    template: string,
    framework: string,
    features: string[]
  ): Promise<MCPProjectScaffold> {
    // Mock implementation for project scaffold generation
    return {
      template,
      framework,
      features,
      files: [
        'package.json',
        'README.md',
        'src/index.js',
        'src/App.js',
        'src/components/',
        'src/utils/',
        'tests/',
        '.gitignore',
        '.eslintrc.js'
      ],
      dependencies: [
        'react',
        'react-dom',
        '@types/react',
        'typescript',
        'eslint',
        'jest'
      ],
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      },
      structure: `
project/
├── src/
│   ├── components/
│   ├── utils/
│   └── index.js
├── tests/
├── package.json
└── README.md`
    };
  }

  private async identifyArchitecturePatterns(
    owner: string,
    repo: string,
    githubToken?: string
  ): Promise<MCPArchitecturePatterns> {
    // Mock implementation for architecture pattern analysis
    return {
      primary: 'Layered Architecture',
      patterns: [
        {
          name: 'MVC Pattern',
          confidence: 85,
          description: 'Model-View-Controller pattern detected'
        },
        {
          name: 'Repository Pattern',
          confidence: 72,
          description: 'Data access layer follows repository pattern'
        },
        {
          name: 'Observer Pattern',
          confidence: 68,
          description: 'Event-driven architecture elements found'
        }
      ],
      layers: [
        'Presentation Layer',
        'Business Logic Layer',
        'Data Access Layer'
      ],
      recommendations: [
        'Consider implementing dependency injection',
        'Add more comprehensive error handling',
        'Implement caching layer for better performance'
      ]
    };
  }

  // Dependency Graph Analysis Tools Implementation

  async analyzeDependencies(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    branch?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, branch = 'main' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      // Import and use the DependencyGraphAnalyzer
      const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
      const dependencyAnalyzer = new DependencyGraphAnalyzer(githubToken, {
        format: 'mermaid',
        includeDevDependencies: false,
        vulnerabilityCheck: true,
        licenseCheck: true
      });

      const analysis = await dependencyAnalyzer.analyzeDependencies(owner, repo, branch);

      return {
        content: [{
          type: 'text',
          text: `Dependency analysis completed for ${owner}/${repo}. Found ${analysis.metadata.total_dependencies} dependencies in ${analysis.metadata.analysis_time}ms.`
        }],
        data: analysis
      };
    } catch (error) {
      throw new Error(`Failed to analyze dependencies: ${(error as Error).message}`);
    }
  }

  async checkVulnerabilities(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    branch?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, branch = 'main' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
      const dependencyAnalyzer = new DependencyGraphAnalyzer(githubToken, {
        vulnerabilityCheck: true,
        licenseCheck: false
      });

      const analysis = await dependencyAnalyzer.analyzeDependencies(owner, repo, branch);
      const vulnerabilities = analysis.vulnerabilities;

      return {
        content: [{
          type: 'text',
          text: `Vulnerability check completed for ${owner}/${repo}. Found ${vulnerabilities.length} vulnerabilities.`
        }],
        data: {
          vulnerabilities,
          summary: {
            total_vulnerabilities: vulnerabilities.length,
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to check vulnerabilities: ${(error as Error).message}`);
    }
  }

  async checkLicenses(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    branch?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, branch = 'main' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
      const dependencyAnalyzer = new DependencyGraphAnalyzer(githubToken, {
        vulnerabilityCheck: false,
        licenseCheck: true
      });

      const analysis = await dependencyAnalyzer.analyzeDependencies(owner, repo, branch);
      const licenses = analysis.licenses;

      return {
        content: [{
          type: 'text',
          text: `License check completed for ${owner}/${repo}. Analyzed ${licenses.length} package licenses.`
        }],
        data: {
          licenses,
          summary: {
            total_packages: licenses.length,
            good_licenses: licenses.filter(l => l.compliance === 'good').length,
            warning_licenses: licenses.filter(l => l.compliance === 'warning').length,
            error_licenses: licenses.filter(l => l.compliance === 'error').length,
            unknown_licenses: licenses.filter(l => l.compliance === 'unknown').length
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to check licenses: ${(error as Error).message}`);
    }
  }

  async generateDependencyReport(args: {
    owner: string;
    repo: string;
    githubToken?: string;
    branch?: string;
  }): Promise<MCPToolResult> {
    const { owner, repo, githubToken, branch = 'main' } = args;

    if (!owner || !repo) {
      throw new Error('Owner and repository name are required');
    }

    try {
      const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
      const dependencyAnalyzer = new DependencyGraphAnalyzer(githubToken, {
        format: 'mermaid',
        includeDevDependencies: true,
        vulnerabilityCheck: true,
        licenseCheck: true
      });

      const analysis = await dependencyAnalyzer.analyzeDependencies(owner, repo, branch);
      const report = dependencyAnalyzer.generateReport(analysis);

      return {
        content: [{
          type: 'text',
          text: `Dependency report generated for ${owner}/${repo}.`
        }],
        data: {
          report,
          analysis,
          summary: {
            health_score: dependencyAnalyzer.getDependencyStats(analysis).total > 0 ?
              dependencyAnalyzer.calculateDependencyHealthScore(dependencyAnalyzer.getDependencyStats(analysis)) : 0,
            total_dependencies: analysis.metadata.total_dependencies,
            vulnerabilities: analysis.metadata.vulnerable_packages,
            license_issues: analysis.metadata.license_issues
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate dependency report: ${(error as Error).message}`);
    }
  }
}

export default MCPServer;
