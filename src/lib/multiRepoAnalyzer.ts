/**
 * Multi-Repository Analysis Engine
 * Analyzes multiple repositories simultaneously and provides comparative insights
 */

import type {
  GitHubAnalysisResult,
  AdvancedGitAnalysis,
  DependencyAnalysis,
  MultiRepoAnalysis,
  RepoComparison,
  CrossRepoInsights,
  RepositoryMetrics,
  ComparativeAnalysis
} from '../types';

export interface MultiRepoConfig {
  maxRepos?: number;
  includeDependencies?: boolean;
  includeSecurity?: boolean;
  includePerformance?: boolean;
  comparativeAnalysis?: boolean;
  generateReport?: boolean;
  outputFormat?: 'json' | 'markdown' | 'html';
}

export class MultiRepoAnalyzer {
  private config: MultiRepoConfig;

  constructor(config: MultiRepoConfig = {}) {
    this.config = {
      maxRepos: 10,
      includeDependencies: true,
      includeSecurity: true,
      includePerformance: true,
      comparativeAnalysis: true,
      generateReport: true,
      outputFormat: 'markdown',
      ...config
    };
  }

  /**
   * Analyze multiple repositories simultaneously
   */
  async analyzeMultipleRepos(
    repositories: Array<{ owner: string; name: string; token?: string }>,
    context?: {
      organization?: string;
      team?: string;
      project?: string;
    }
  ): Promise<MultiRepoAnalysis> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Starting multi-repository analysis for ${repositories.length} repositories`);

      // Limit repositories to prevent API overload
      const limitedRepos = repositories.slice(0, this.config.maxRepos!);

      // Analyze all repositories in parallel
      const analysisPromises = limitedRepos.map(async (repo) => {
        try {
          // Import services dynamically to avoid circular dependencies
          const { serviceContainer } = await import('./serviceContainer.js');
          const services = await serviceContainer.initialize();

          // Analyze Git history
          const gitResult = await services.gitAnalyzer.analyzeRepository(repo.owner, repo.name);

          // Analyze dependencies if enabled
          let dependencyResult: DependencyAnalysis | undefined;
          if (this.config.includeDependencies) {
            try {
              const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
              const depAnalyzer = new DependencyGraphAnalyzer(repo.token);
              const depAnalysis = await depAnalyzer.analyzeDependencies(repo.owner, repo.name);
              dependencyResult = depAnalysis;
            } catch (error) {
              console.warn(`Dependency analysis failed for ${repo.owner}/${repo.name}:`, error);
            }
          }

          return {
            repository: repo,
            gitAnalysis: gitResult.success ? gitResult.data : null,
            dependencyAnalysis: dependencyResult,
            analysisTime: Date.now() - startTime,
            success: gitResult.success
          };
        } catch (error) {
          console.error(`Failed to analyze ${repo.owner}/${repo.name}:`, error);
          return {
            repository: repo,
            gitAnalysis: null,
            dependencyAnalysis: null,
            analysisTime: Date.now() - startTime,
            success: false,
            error: (error as Error).message
          };
        }
      });

      const results = await Promise.all(analysisPromises);

      // Generate comparative analysis
      const comparison = this.config.comparativeAnalysis ?
        await this.generateComparativeAnalysis(results) : null;

      // Generate cross-repository insights
      const insights = await this.generateCrossRepoInsights(results, context);

      // Generate report if enabled
      const report = this.config.generateReport ?
        await this.generateMultiRepoReport(results, comparison, insights) : null;

      const analysis: MultiRepoAnalysis = {
        repositories: results,
        comparison,
        insights,
        report,
        metadata: {
          totalRepositories: repositories.length,
          successfulAnalyses: results.filter(r => r.success).length,
          failedAnalyses: results.filter(r => !r.success).length,
          analysisTime: Date.now() - startTime,
          analyzedAt: new Date().toISOString(),
          context
        }
      };

      console.log(`✅ Multi-repository analysis completed in ${analysis.metadata.analysisTime}ms`);
      return analysis;

    } catch (error) {
      console.error('❌ Multi-repository analysis failed:', error);
      throw new Error(`Multi-repository analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate comparative analysis between repositories
   */
  private async generateComparativeAnalysis(
    results: Array<{
      repository: { owner: string; name: string };
    gitAnalysis: AdvancedGitAnalysis | null | undefined;
    dependencyAnalysis: DependencyAnalysis | null | undefined;
      success: boolean;
    }>
  ): Promise<RepoComparison> {
    const successfulResults = results.filter(r => r.success && r.gitAnalysis);

    if (successfulResults.length < 2) {
      return {
        canCompare: false,
        reason: 'Need at least 2 successful analyses for comparison'
      };
    }

    // Extract metrics for comparison
    const metrics: RepositoryMetrics[] = successfulResults.map(result => {
      const git = result.gitAnalysis!;
      const dep = result.dependencyAnalysis;

      return {
        repository: `${result.repository.owner}/${result.repository.name}`,
        gitMetrics: {
          totalCommits: git.commit_history.total_commits,
          activeContributors: git.commit_history.authors.length,
          avgCommitsPerDay: git.commit_history.development_velocity.avg_commits_per_day,
          repositoryHealth: git.repository_health.overall_health,
          hotFilesCount: git.commit_history.hot_files.length,
          codeChurnScore: git.repository_health.code_churn_score
        },
        dependencyMetrics: dep ? {
          totalDependencies: dep.metadata.total_dependencies,
          vulnerabilities: dep.metadata.vulnerable_packages,
          licenseIssues: dep.metadata.license_issues,
          healthScore: this.calculateDependencyHealthScore(dep)
        } : null,
        overallScore: this.calculateOverallScore(git, dep)
      };
    });

    // Find best and worst performers
    const sortedByScore = metrics.sort((a, b) => b.overallScore - a.overallScore);
    const bestPerformer = sortedByScore[0];
    const worstPerformer = sortedByScore[sortedByScore.length - 1];

    // Calculate averages
    const averages = this.calculateAverages(metrics);

    // Identify patterns and trends
    const patterns = this.identifyPatterns(metrics);

    return {
      canCompare: true,
      metrics,
      bestPerformer: bestPerformer.repository,
      worstPerformer: worstPerformer.repository,
      averages,
      patterns,
      recommendations: this.generateComparisonRecommendations(metrics, bestPerformer, worstPerformer)
    };
  }

  /**
   * Generate cross-repository insights
   */
  private async generateCrossRepoInsights(
    results: Array<{
      repository: { owner: string; name: string };
      gitAnalysis: AdvancedGitAnalysis | null;
      dependencyAnalysis: DependencyAnalysis | null;
      success: boolean;
    }>,
    context?: { organization?: string; team?: string; project?: string }
  ): Promise<CrossRepoInsights> {
    const insights: CrossRepoInsights = {
      summary: {
        totalRepos: results.length,
        successfulAnalyses: results.filter(r => r.success).length,
        averageHealth: 'good',
        commonPatterns: [],
        riskAreas: []
      },
      patterns: {
        development: [],
        security: [],
        dependencies: [],
        collaboration: []
      },
      recommendations: [],
      organization: context?.organization,
      team: context?.team,
      project: context?.project
    };

    // Analyze development patterns
    const successfulResults = results.filter(r => r.success && r.gitAnalysis);
    if (successfulResults.length > 0) {
      const avgHealthScore = successfulResults.reduce((sum, r) => {
        const health = r.gitAnalysis!.repository_health;
        const score = (health.commit_frequency_score + health.contributor_diversity_score +
                      health.code_churn_score + health.branch_management_score) / 4;
        return sum + score;
      }, 0) / successfulResults.length;

      insights.summary.averageHealth = avgHealthScore >= 80 ? 'excellent' :
                                       avgHealthScore >= 60 ? 'good' :
                                       avgHealthScore >= 40 ? 'fair' : 'poor';

      // Identify common patterns
      const hotFiles = successfulResults.flatMap(r => r.gitAnalysis!.commit_history.hot_files);
      const commonHotFiles = this.findCommonHotFiles(hotFiles);

      if (commonHotFiles.length > 0) {
        insights.summary.commonPatterns.push({
          type: 'hot_files',
          description: `Common hot files across repositories: ${commonHotFiles.slice(0, 5).join(', ')}`,
          impact: 'high',
          recommendation: 'Consider extracting common functionality into shared modules'
        });
      }

      // Identify risk areas
      const criticalHotFiles = hotFiles.filter(f => f.impact === 'critical');
      if (criticalHotFiles.length > 0) {
        insights.summary.riskAreas.push({
          type: 'critical_hot_files',
          description: `${criticalHotFiles.length} critical hot files detected across repositories`,
          severity: 'high',
          affectedRepos: criticalHotFiles.map(f => f.filename).slice(0, 10)
        });
      }

      // Security insights
      const securityIssues = successfulResults
        .map(r => r.dependencyAnalysis?.vulnerabilities.length || 0)
        .reduce((sum, count) => sum + count, 0);

      if (securityIssues > 0) {
        insights.patterns.security.push({
          type: 'vulnerabilities',
          description: `${securityIssues} security vulnerabilities found across all repositories`,
          severity: 'high',
          trend: 'needs_attention'
        });
      }

      // Collaboration insights
      const totalContributors = successfulResults
        .map(r => r.gitAnalysis!.commit_history.authors.length)
        .reduce((sum, count) => sum + count, 0);

      const avgContributors = totalContributors / successfulResults.length;

      if (avgContributors < 3) {
        insights.patterns.collaboration.push({
          type: 'contributor_diversity',
          description: `Average of ${avgContributors.toFixed(1)} contributors per repository`,
          severity: 'medium',
          trend: 'needs_improvement'
        });
      }

      // Generate recommendations
      insights.recommendations = this.generateCrossRepoRecommendations(successfulResults);
    }

    return insights;
  }

  /**
   * Generate comprehensive multi-repository report
   */
  private async generateMultiRepoReport(
    results: Array<{
      repository: { owner: string; name: string };
      gitAnalysis: AdvancedGitAnalysis | null;
      dependencyAnalysis: DependencyAnalysis | null;
      success: boolean;
    }>,
    comparison: RepoComparison | null,
    insights: CrossRepoInsights
  ): Promise<string> {
    const successfulResults = results.filter(r => r.success && r.gitAnalysis);

    let report = `# Multi-Repository Analysis Report

## 📊 Overview

- **Analysis Date:** ${new Date().toISOString()}
- **Total Repositories:** ${results.length}
- **Successful Analyses:** ${successfulResults.length}
- **Failed Analyses:** ${results.filter(r => !r.success).length}
- **Average Health:** ${insights.summary.averageHealth.toUpperCase()}

## 🔍 Repository Summary

| Repository | Health | Commits | Contributors | Hot Files | Status |
|------------|--------|---------|-------------|-----------|--------|
`;

    results.forEach(result => {
      const git = result.gitAnalysis;
      const health = git?.repository_health.overall_health || 'unknown';
      const commits = git?.commit_history.total_commits || 0;
      const contributors = git?.commit_history.authors.length || 0;
      const hotFiles = git?.commit_history.hot_files.length || 0;
      const status = result.success ? '✅' : '❌';

      report += `| ${result.repository.owner}/${result.repository.name} | ${health} | ${commits} | ${contributors} | ${hotFiles} | ${status} |\n`;
    });

    report += '\n## 📈 Comparative Analysis\n\n';

    if (comparison?.canCompare) {
      report += '### Repository Rankings\n\n';
      report += '| Rank | Repository | Overall Score | Health | Commits | Contributors |\n';
      report += '|------|------------|---------------|--------|---------|-------------|\n';

      comparison.metrics
        .sort((a, b) => b.overallScore - a.overallScore)
        .forEach((metric, index) => {
          report += `| ${index + 1} | ${metric.repository} | ${metric.overallScore.toFixed(1)} | ${metric.gitMetrics.repositoryHealth} | ${metric.gitMetrics.totalCommits} | ${metric.gitMetrics.activeContributors} |\n`;
        });

      report += '\n### Key Insights\n\n';
      comparison.patterns.forEach(pattern => {
        report += `- **${pattern.type}**: ${pattern.description}\n`;
      });

      report += '\n### Recommendations\n\n';
      comparison.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    } else {
      report += 'Comparative analysis requires at least 2 successful repository analyses.\n\n';
    }

    report += '\n## 🔍 Cross-Repository Insights\n\n';

    report += '### Common Patterns\n\n';
    insights.summary.commonPatterns.forEach(pattern => {
      report += `- **${pattern.type}**: ${pattern.description}\n`;
      report += `  - Impact: ${pattern.impact}\n`;
      report += `  - Recommendation: ${pattern.recommendation}\n\n`;
    });

    report += '### Risk Areas\n\n';
    insights.summary.riskAreas.forEach(risk => {
      report += `- **${risk.type}**: ${risk.description}\n`;
      report += `  - Severity: ${risk.severity}\n`;
      report += `  - Affected: ${risk.affectedRepos?.join(', ')}\n\n`;
    });

    report += '### Security Overview\n\n';
    insights.patterns.security.forEach(security => {
      report += `- **${security.type}**: ${security.description}\n`;
      report += `  - Severity: ${security.severity}\n`;
      report += `  - Trend: ${security.trend}\n\n`;
    });

    report += '### Collaboration Patterns\n\n';
    insights.patterns.collaboration.forEach(collab => {
      report += `- **${collab.type}**: ${collab.description}\n`;
      report += `  - Severity: ${collab.severity}\n`;
      report += `  - Trend: ${collab.trend}\n\n`;
    });

    report += '### Recommendations\n\n';
    insights.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });

    report += '\n## 📋 Detailed Repository Analysis\n\n';

    successfulResults.forEach(result => {
      const git = result.gitAnalysis!;
      const dep = result.dependencyAnalysis;

      report += `### ${result.repository.owner}/${result.repository.name}\n\n`;

      report += '#### Git Analysis\n\n';
      report += `- **Total Commits:** ${git.commit_history.total_commits}\n`;
      report += `- **Active Contributors:** ${git.commit_history.authors.length}\n`;
      report += `- **Repository Health:** ${git.repository_health.overall_health}\n`;
      report += `- **Development Velocity:** ${git.commit_history.development_velocity.avg_commits_per_day.toFixed(1)} commits/day\n\n`;

      if (git.commit_history.hot_files.length > 0) {
        report += '#### Hot Files\n\n';
        git.commit_history.hot_files.slice(0, 5).forEach(file => {
          report += `- ${file.filename} (${file.changes} changes, ${file.impact} impact)\n`;
        });
        report += '\n';
      }

      if (dep) {
        report += '#### Dependencies\n\n';
        report += `- **Total Dependencies:** ${dep.metadata.total_dependencies}\n`;
        report += `- **Vulnerabilities:** ${dep.metadata.vulnerable_packages}\n`;
        report += `- **License Issues:** ${dep.metadata.license_issues}\n\n`;
      }

      report += '#### Recommendations\n\n';
      git.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
      report += '\n---\n\n';
    });

    report += '## 📊 Summary\n\n';
    report += `Analysis completed for ${successfulResults.length} out of ${results.length} repositories.\n`;
    report += `Overall health: ${insights.summary.averageHealth.toUpperCase()}\n\n`;

    if (insights.summary.riskAreas.length > 0) {
      report += '**⚠️ Risk Areas Identified:**\n\n';
      insights.summary.riskAreas.forEach(risk => {
        report += `- ${risk.description}\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
    report += '*This report was automatically generated by the Multi-Repository Analysis Engine*\n';

    return report;
  }

  // Helper methods
  private calculateOverallScore(git: AdvancedGitAnalysis, dep?: DependencyAnalysis | null): number {
    const health = git.repository_health;
    const baseScore = (health.commit_frequency_score + health.contributor_diversity_score +
                      health.code_churn_score + health.branch_management_score) / 4;

    if (dep) {
      const depScore = this.calculateDependencyHealthScore(dep);
      return (baseScore * 0.7) + (depScore * 0.3);
    }

    return baseScore;
  }

  private calculateDependencyHealthScore(dep: DependencyAnalysis): number {
    const stats = {
      total: dep.metadata.total_dependencies,
      vulnerable: dep.metadata.vulnerable_packages,
      licenseIssues: dep.metadata.license_issues
    };

    let score = 100;
    score -= stats.vulnerable * 20;
    score -= stats.licenseIssues * 10;
    if (stats.total > 50) score -= Math.min((stats.total - 50) * 0.5, 20);

    return Math.max(0, Math.round(score));
  }

  private calculateAverages(metrics: RepositoryMetrics[]) {
    const totals = metrics.reduce((acc, metric) => ({
      commits: acc.commits + metric.gitMetrics.totalCommits,
      contributors: acc.contributors + metric.gitMetrics.activeContributors,
      healthScore: acc.healthScore + (metric.gitMetrics.repositoryHealth === 'excellent' ? 100 :
                                       metric.gitMetrics.repositoryHealth === 'good' ? 80 :
                                       metric.gitMetrics.repositoryHealth === 'fair' ? 60 : 40),
      overallScore: acc.overallScore + metric.overallScore
    }), { commits: 0, contributors: 0, healthScore: 0, overallScore: 0 });

    return {
      avgCommits: totals.commits / metrics.length,
      avgContributors: totals.contributors / metrics.length,
      avgHealthScore: totals.healthScore / metrics.length,
      avgOverallScore: totals.overallScore / metrics.length
    };
  }

  private identifyPatterns(metrics: RepositoryMetrics[]) {
    const patterns = [];

    // Health distribution
    const healthCounts = metrics.reduce((acc, m) => {
      acc[m.gitMetrics.repositoryHealth] = (acc[m.gitMetrics.repositoryHealth] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonHealth = Object.entries(healthCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonHealth) {
      patterns.push({
        type: 'health_distribution',
        description: `Most repositories have ${mostCommonHealth[0]} health (${mostCommonHealth[1]}/${metrics.length})`,
        significance: mostCommonHealth[1] / metrics.length > 0.5 ? 'high' as const : 'medium' as const
      });
    }

    // Contributor patterns
    const avgContributors = metrics.reduce((sum, m) => sum + m.gitMetrics.activeContributors, 0) / metrics.length;
    if (avgContributors < 3) {
      patterns.push({
        type: 'contributor_diversity',
        description: `Low contributor diversity (average: ${avgContributors.toFixed(1)} per repo)`,
        significance: 'high' as const
      });
    }

    return patterns;
  }

  private findCommonHotFiles(hotFiles: Array<{ filename: string; changes: number; impact: string }>): string[] {
    const fileCounts = hotFiles.reduce((acc, file) => {
      acc[file.filename] = (acc[file.filename] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(fileCounts)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .map(([filename]) => filename);
  }

  private generateComparisonRecommendations(
    metrics: RepositoryMetrics[],
    best: RepositoryMetrics,
    worst: RepositoryMetrics
  ): string[] {
    const recommendations = [];

    // Health recommendations
    if (worst.gitMetrics.repositoryHealth !== 'excellent') {
      recommendations.push(`Improve repository health in ${worst.repository} (currently ${worst.gitMetrics.repositoryHealth}) by following patterns from ${best.repository}`);
    }

    // Contributor recommendations
    if (worst.gitMetrics.activeContributors < best.gitMetrics.activeContributors * 0.5) {
      recommendations.push(`Increase contributor diversity in ${worst.repository} - currently has ${worst.gitMetrics.activeContributors} vs ${best.repository}'s ${best.gitMetrics.activeContributors}`);
    }

    // Hot files recommendations
    if (worst.gitMetrics.hotFilesCount > best.gitMetrics.hotFilesCount * 2) {
      recommendations.push(`Address hot files in ${worst.repository} (${worst.gitMetrics.hotFilesCount} files) - consider refactoring strategies used in ${best.repository}`);
    }

    return recommendations;
  }

  private generateCrossRepoRecommendations(
    results: Array<{
      repository: { owner: string; name: string };
      gitAnalysis: AdvancedGitAnalysis;
      dependencyAnalysis: DependencyAnalysis | null;
    }>
  ): string[] {
    const recommendations = [];

    // Security recommendations
    const securityIssues = results
      .map(r => r.dependencyAnalysis?.vulnerabilities.length || 0)
      .filter(count => count > 0);

    if (securityIssues.length > 0) {
      recommendations.push('Implement organization-wide security scanning and automated dependency updates');
    }

    // Collaboration recommendations
    const lowContributorRepos = results.filter(r =>
      r.gitAnalysis.commit_history.authors.length < 3
    );

    if (lowContributorRepos.length > results.length * 0.3) {
      recommendations.push('Consider implementing mentorship programs and encouraging broader team participation');
    }

    // Architecture recommendations
    const commonHotFiles = this.findCommonHotFiles(
      results.flatMap(r => r.gitAnalysis.commit_history.hot_files)
    );

    if (commonHotFiles.length > 0) {
      recommendations.push(`Extract common functionality from shared hot files: ${commonHotFiles.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }
}

export default MultiRepoAnalyzer;
