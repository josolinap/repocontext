/**
 * AI-Powered Suggestions Engine
 * Provides intelligent recommendations based on repository analysis data
 */

import type {
  AdvancedGitAnalysis,
  DependencyAnalysis,
  AISuggestion,
  SuggestionContext
} from '../types';

export interface SuggestionEngineConfig {
  enableAdvancedAnalysis?: boolean;
  includeSecuritySuggestions?: boolean;
  includePerformanceSuggestions?: boolean;
  includeCollaborationSuggestions?: boolean;
  includeCodeQualitySuggestions?: boolean;
  minConfidenceScore?: number;
  maxSuggestions?: number;
}

export class AISuggestionsEngine {
  private config: SuggestionEngineConfig;

  constructor(config: SuggestionEngineConfig = {}) {
    this.config = {
      enableAdvancedAnalysis: true,
      includeSecuritySuggestions: true,
      includePerformanceSuggestions: true,
      includeCollaborationSuggestions: true,
      includeCodeQualitySuggestions: true,
      minConfidenceScore: 0.6,
      maxSuggestions: 20,
      ...config
    };
  }

  /**
   * Generate AI-powered suggestions based on repository analysis
   */
  async generateSuggestions(
    gitAnalysis: AdvancedGitAnalysis,
    dependencyAnalysis?: DependencyAnalysis,
    context?: SuggestionContext
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    try {
      console.log('🧠 Starting AI-powered suggestion generation...');

      // Generate suggestions based on different analysis aspects
      const gitSuggestions = await this.generateGitSuggestions(gitAnalysis);
      const dependencySuggestions = dependencyAnalysis ?
        await this.generateDependencySuggestions(dependencyAnalysis) : [];
      const collaborationSuggestions = await this.generateCollaborationSuggestions(gitAnalysis);
      const performanceSuggestions = await this.generatePerformanceSuggestions(gitAnalysis);
      const securitySuggestions = await this.generateSecuritySuggestions(gitAnalysis, dependencyAnalysis);
      const codeQualitySuggestions = await this.generateCodeQualitySuggestions(gitAnalysis);

      // Combine all suggestions
      suggestions.push(...gitSuggestions);
      suggestions.push(...dependencySuggestions);
      suggestions.push(...collaborationSuggestions);
      suggestions.push(...performanceSuggestions);
      suggestions.push(...securitySuggestions);
      suggestions.push(...codeQualitySuggestions);

      // Sort by priority and confidence
      const sortedSuggestions = suggestions
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence;
        })
        .slice(0, this.config.maxSuggestions!);

      console.log(`✅ Generated ${sortedSuggestions.length} AI-powered suggestions`);
      return sortedSuggestions;

    } catch (error) {
      console.error('❌ AI suggestion generation failed:', error);
      return [];
    }
  }

  /**
   * Generate Git-based suggestions
   */
  private async generateGitSuggestions(gitAnalysis: AdvancedGitAnalysis): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const health = gitAnalysis.repository_health;
    const velocity = gitAnalysis.commit_history.development_velocity;
    const hotFiles = gitAnalysis.commit_history.hot_files;

    // Repository health suggestions
    if (health.commit_frequency_score < 60) {
      suggestions.push({
        id: 'git-health-low-commit-frequency',
        category: 'development',
        priority: 'medium',
        confidence: 0.8,
        title: 'Increase Commit Frequency',
        description: 'Low commit frequency detected. Consider committing smaller, more frequent changes to improve code review and collaboration.',
        impact: 'Improves code review quality and reduces merge conflicts',
        effort: 'low',
        actionable: true,
        implementation: [
          'Break large features into smaller commits',
          'Commit early and often',
          'Use feature branches for experimental work',
          'Set up commit hooks for better commit messages'
        ],
        metrics: {
          current: health.commit_frequency_score,
          target: 80,
          improvement: '35% increase in commit frequency'
        }
      });
    }

    if (health.contributor_diversity_score < 70) {
      suggestions.push({
        id: 'git-health-low-contributor-diversity',
        category: 'collaboration',
        priority: 'medium',
        confidence: 0.75,
        title: 'Improve Contributor Diversity',
        description: 'Limited contributor diversity detected. Encourage more team members to contribute to reduce bus factor.',
        impact: 'Reduces knowledge silos and improves code quality',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Implement pair programming sessions',
          'Create mentorship programs for new contributors',
          'Establish code review rotation',
          'Document contribution guidelines clearly'
        ],
        metrics: {
          current: health.contributor_diversity_score,
          target: 85,
          improvement: '20% increase in contributor diversity'
        }
      });
    }

    // Hot files suggestions
    const criticalHotFiles = hotFiles.filter(f => f.impact === 'critical');
    if (criticalHotFiles.length > 0) {
      suggestions.push({
        id: 'git-hot-files-critical',
        category: 'architecture',
        priority: 'high',
        confidence: 0.9,
        title: 'Refactor Critical Hot Files',
        description: `Critical hot files detected: ${criticalHotFiles.slice(0, 3).map(f => f.filename).join(', ')}. These files are modified frequently and may benefit from refactoring.`,
        impact: 'Improves maintainability and reduces technical debt',
        effort: 'high',
        actionable: true,
        implementation: [
          'Analyze dependencies and coupling of hot files',
          'Extract common functionality into shared modules',
          'Implement proper separation of concerns',
          'Consider splitting large files into smaller, focused modules',
          'Add comprehensive tests before refactoring'
        ],
        metrics: {
          current: criticalHotFiles.length,
          target: 0,
          improvement: 'Eliminate critical hot file dependencies'
        }
      });
    }

    // Development velocity suggestions
    if (velocity.development_intensity === 'very_high') {
      suggestions.push({
        id: 'git-velocity-very-high',
        category: 'development',
        priority: 'medium',
        confidence: 0.7,
        title: 'Balance Development Intensity',
        description: 'Very high development intensity detected. Consider adding more testing and code review to maintain quality.',
        impact: 'Maintains code quality during rapid development',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Implement automated testing for new features',
          'Increase code review requirements',
          'Add performance testing for critical paths',
          'Consider feature flags for safer deployments',
          'Monitor technical debt regularly'
        ],
        metrics: {
          current: velocity.avg_commits_per_day,
          target: velocity.avg_commits_per_day * 0.8,
          improvement: '20% reduction in development intensity'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate dependency-based suggestions
   */
  private async generateDependencySuggestions(dependencyAnalysis: DependencyAnalysis): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const vulnerabilities = dependencyAnalysis.vulnerabilities;
    const licenseIssues = dependencyAnalysis.licenses.filter(l =>
      l.compliance === 'warning' || l.compliance === 'error'
    );

    // Vulnerability suggestions
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');

    if (criticalVulns.length > 0) {
      suggestions.push({
        id: 'dep-security-critical-vulnerabilities',
        category: 'security',
        priority: 'critical',
        confidence: 0.95,
        title: 'Address Critical Security Vulnerabilities',
        description: `${criticalVulns.length} critical security vulnerabilities found. Immediate action required.`,
        impact: 'Prevents potential security breaches and data loss',
        effort: 'high',
        actionable: true,
        implementation: [
          'Update vulnerable packages immediately',
          'Review security advisories for each vulnerability',
          'Test applications after updates',
          'Implement security monitoring',
          'Consider using tools like Snyk or Dependabot'
        ],
        metrics: {
          current: criticalVulns.length,
          target: 0,
          improvement: '100% vulnerability resolution'
        }
      });
    }

    if (highVulns.length > 0) {
      suggestions.push({
        id: 'dep-security-high-vulnerabilities',
        category: 'security',
        priority: 'high',
        confidence: 0.9,
        title: 'Address High-Severity Security Vulnerabilities',
        description: `${highVulns.length} high-severity security vulnerabilities found. Schedule updates within the next sprint.`,
        impact: 'Reduces security risk and improves compliance',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Plan security updates in the next development cycle',
          'Create tickets for each vulnerability',
          'Test updates in staging environment first',
          'Update documentation with security considerations'
        ],
        metrics: {
          current: highVulns.length,
          target: 0,
          improvement: '100% high-severity vulnerability resolution'
        }
      });
    }

    // License compliance suggestions
    if (licenseIssues.length > 0) {
      suggestions.push({
        id: 'dep-license-compliance-issues',
        category: 'legal',
        priority: licenseIssues.some(l => l.compliance === 'error') ? 'high' : 'medium',
        confidence: 0.85,
        title: 'Review License Compliance Issues',
        description: `${licenseIssues.length} packages have license compliance issues that may affect distribution and usage.`,
        impact: 'Ensures legal compliance and reduces business risk',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Review license terms for each flagged package',
          'Consult legal team for compliance concerns',
          'Consider replacing packages with incompatible licenses',
          'Document license decisions and rationale',
          'Implement license scanning in CI/CD pipeline'
        ],
        metrics: {
          current: licenseIssues.length,
          target: 0,
          improvement: '100% license compliance'
        }
      });
    }

    // Dependency health suggestions
    const stats = this.getDependencyStats(dependencyAnalysis);
    if (stats.total > 50) {
      suggestions.push({
        id: 'dep-health-high-dependency-count',
        category: 'maintenance',
        priority: 'low',
        confidence: 0.6,
        title: 'Consider Dependency Optimization',
        description: 'High number of dependencies detected. Consider optimizing to reduce maintenance burden.',
        impact: 'Reduces maintenance overhead and security surface',
        effort: 'high',
        actionable: true,
        implementation: [
          'Audit dependencies for actual usage',
          'Remove unused dependencies',
          'Consider monorepo structure for shared dependencies',
          'Implement dependency size monitoring',
          'Use tools like Bundle Analyzer to identify heavy dependencies'
        ],
        metrics: {
          current: stats.total,
          target: Math.max(stats.total * 0.8, 20),
          improvement: '20% reduction in dependency count'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate collaboration suggestions
   */
  private async generateCollaborationSuggestions(gitAnalysis: AdvancedGitAnalysis): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const authors = gitAnalysis.commit_history.authors;
    const patterns = gitAnalysis.commit_history.commit_patterns;

    // Collaboration pattern analysis
    const topContributor = authors[0];
    const totalCommits = authors.reduce((sum, a) => sum + a.commits, 0);
    const topContributorPercentage = (topContributor?.commits || 0) / totalCommits;

    if (topContributorPercentage > 0.5) {
      suggestions.push({
        id: 'collab-uneven-contribution',
        category: 'collaboration',
        priority: 'medium',
        confidence: 0.8,
        title: 'Balance Contribution Load',
        description: 'Uneven contribution distribution detected. Consider redistributing workload to prevent burnout.',
        impact: 'Improves team sustainability and knowledge sharing',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Identify areas where junior developers can contribute',
          'Implement mentorship programs',
          'Share complex tasks among team members',
          'Encourage code reviews from all team members',
          'Document complex business logic for better onboarding'
        ],
        metrics: {
          current: topContributorPercentage * 100,
          target: 30,
          improvement: 'Reduce top contributor load by 40%'
        }
      });
    }

    // Commit pattern suggestions
    const peakHours = patterns.hour_of_day
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    if (peakHours.some(h => h.hour < 9 || h.hour > 17)) {
      suggestions.push({
        id: 'collab-work-life-balance',
        category: 'collaboration',
        priority: 'low',
        confidence: 0.7,
        title: 'Improve Work-Life Balance',
        description: 'Commits detected outside normal working hours. Consider establishing healthy work boundaries.',
        impact: 'Improves team well-being and long-term productivity',
        effort: 'low',
        actionable: true,
        implementation: [
          'Establish core working hours for collaboration',
          'Set expectations for response times',
          'Encourage work-life balance in team culture',
          'Consider flexible working arrangements',
          'Monitor and address overtime trends'
        ],
        metrics: {
          current: peakHours.filter(h => h.hour < 9 || h.hour > 17).length,
          target: 0,
          improvement: 'Eliminate after-hours commits'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate performance suggestions
   */
  private async generatePerformanceSuggestions(gitAnalysis: AdvancedGitAnalysis): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const codeChurn = gitAnalysis.commit_history.code_churn;

    // High churn files
    const highChurnFiles = codeChurn.filter(f => f.risk === 'high');
    if (highChurnFiles.length > 0) {
      suggestions.push({
        id: 'perf-high-churn-files',
        category: 'performance',
        priority: 'medium',
        confidence: 0.75,
        title: 'Optimize High-Churn Files',
        description: `${highChurnFiles.length} files with high churn detected. These may benefit from performance optimization.`,
        impact: 'Improves application performance and user experience',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Profile high-churn files for performance bottlenecks',
          'Implement caching for frequently accessed data',
          'Optimize database queries in these files',
          'Consider lazy loading for heavy components',
          'Add performance monitoring for these areas'
        ],
        metrics: {
          current: highChurnFiles.length,
          target: 0,
          improvement: 'Optimize all high-churn files'
        }
      });
    }

    // Large files analysis
    const largeFiles = codeChurn.filter(f => f.complexity > 80);
    if (largeFiles.length > 0) {
      suggestions.push({
        id: 'perf-large-files',
        category: 'performance',
        priority: 'low',
        confidence: 0.6,
        title: 'Consider Splitting Large Files',
        description: `${largeFiles.length} large files with high complexity detected. Consider breaking them into smaller modules.`,
        impact: 'Improves code maintainability and performance',
        effort: 'high',
        actionable: true,
        implementation: [
          'Analyze dependencies and coupling in large files',
          'Identify logical separation points',
          'Create interfaces for better modularity',
          'Implement gradual refactoring approach',
          'Add comprehensive tests for refactored modules'
        ],
        metrics: {
          current: largeFiles.length,
          target: 0,
          improvement: 'Break down all large files'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate security suggestions
   */
  private async generateSecuritySuggestions(
    gitAnalysis: AdvancedGitAnalysis,
    dependencyAnalysis?: DependencyAnalysis
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Security-focused suggestions based on analysis
    if (dependencyAnalysis?.vulnerabilities.length) {
      suggestions.push({
        id: 'sec-dependency-vulnerabilities',
        category: 'security',
        priority: 'critical',
        confidence: 0.95,
        title: 'Implement Security Scanning',
        description: 'Vulnerabilities detected in dependencies. Implement automated security scanning in CI/CD pipeline.',
        impact: 'Prevents security breaches through early detection',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Set up automated vulnerability scanning',
          'Implement security gates in CI/CD',
          'Create security review checklist',
          'Establish incident response process',
          'Regular security dependency updates'
        ],
        metrics: {
          current: dependencyAnalysis.vulnerabilities.length,
          target: 0,
          improvement: 'Zero known vulnerabilities'
        }
      });
    }

    // Branch protection suggestions
    const protectedBranches = gitAnalysis.branch_analysis.branches.filter(b => b.protected).length;
    const totalBranches = gitAnalysis.branch_analysis.branches.length;

    if (protectedBranches / totalBranches < 0.5) {
      suggestions.push({
        id: 'sec-branch-protection',
        category: 'security',
        priority: 'high',
        confidence: 0.8,
        title: 'Implement Branch Protection Rules',
        description: 'Low branch protection coverage detected. Implement protection rules for critical branches.',
        impact: 'Prevents unauthorized code changes and improves code quality',
        effort: 'low',
        actionable: true,
        implementation: [
          'Enable branch protection for main/master branches',
          'Require pull request reviews',
          'Require status checks to pass',
          'Restrict direct pushes to protected branches',
          'Set up code owners for sensitive areas'
        ],
        metrics: {
          current: (protectedBranches / totalBranches) * 100,
          target: 80,
          improvement: '80% branch protection coverage'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate code quality suggestions
   */
  private async generateCodeQualitySuggestions(gitAnalysis: AdvancedGitAnalysis): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const health = gitAnalysis.repository_health;

    if (health.code_churn_score < 60) {
      suggestions.push({
        id: 'quality-code-churn-management',
        category: 'quality',
        priority: 'medium',
        confidence: 0.7,
        title: 'Improve Code Churn Management',
        description: 'High code churn detected. Implement strategies to reduce unnecessary code changes.',
        impact: 'Improves code stability and maintainability',
        effort: 'medium',
        actionable: true,
        implementation: [
          'Implement code review guidelines',
          'Add automated testing for frequently changed code',
          'Document architectural decisions',
          'Consider feature flags for experimental features',
          'Monitor and address technical debt regularly'
        ],
        metrics: {
          current: health.code_churn_score,
          target: 80,
          improvement: '33% improvement in code churn score'
        }
      });
    }

    // Test coverage suggestion based on development patterns
    const commitSizes = gitAnalysis.commit_history.commit_patterns.commit_size_distribution;
    const largeCommits = commitSizes.large + commitSizes.huge;

    if (largeCommits > commitSizes.small * 0.5) {
      suggestions.push({
        id: 'quality-test-coverage',
        category: 'quality',
        priority: 'medium',
        confidence: 0.65,
        title: 'Increase Test Coverage',
        description: 'Large commits detected, suggesting potential lack of comprehensive testing. Consider improving test coverage.',
        impact: 'Reduces bugs and improves code confidence',
        effort: 'high',
        actionable: true,
        implementation: [
          'Implement unit tests for new features',
          'Add integration tests for critical paths',
          'Set up test coverage reporting',
          'Create testing guidelines for the team',
          'Consider test-driven development practices'
        ],
        metrics: {
          current: largeCommits,
          target: commitSizes.small * 0.3,
          improvement: 'Reduce large commits by 40%'
        }
      });
    }

    return suggestions;
  }

  /**
   * Get dependency statistics
   */
  private getDependencyStats(dependencyAnalysis: DependencyAnalysis): {
    total: number;
    runtime: number;
    development: number;
    peer: number;
    vulnerable: number;
    licenseIssues: number;
  } {
    const runtime = dependencyAnalysis.dependencies.filter(d => d.type === 'runtime').length;
    const development = dependencyAnalysis.dependencies.filter(d => d.type === 'development').length;
    const peer = dependencyAnalysis.dependencies.filter(d => d.type === 'peer').length;

    return {
      total: dependencyAnalysis.dependencies.length,
      runtime,
      development,
      peer,
      vulnerable: dependencyAnalysis.vulnerabilities.length,
      licenseIssues: dependencyAnalysis.licenses.filter(l => l.compliance === 'warning' || l.compliance === 'error').length
    };
  }

  /**
   * Filter suggestions based on configuration
   */
  filterSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    return suggestions.filter(suggestion => {
      // Filter by confidence score
      if (suggestion.confidence < this.config.minConfidenceScore!) {
        return false;
      }

      // Filter by category based on configuration
      switch (suggestion.category) {
        case 'security':
          return this.config.includeSecuritySuggestions;
        case 'performance':
          return this.config.includePerformanceSuggestions;
        case 'collaboration':
          return this.config.includeCollaborationSuggestions;
        case 'quality':
          return this.config.includeCodeQualitySuggestions;
        default:
          return true;
      }
    });
  }
}

export default AISuggestionsEngine;
