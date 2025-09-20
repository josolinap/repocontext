/**
 * Dependency Graph Analyzer
 * Generates visual dependency graphs and analyzes dependency relationships
 */

import { Octokit } from '@octokit/rest';
import type {
  DependencyNode,
  DependencyEdge,
  DependencyGraph,
  DependencyAnalysis,
  PackageJsonDependency,
  DependencyVulnerability,
  LicenseInfo
} from '../types';

export interface DependencyGraphConfig {
  format?: 'mermaid' | 'dot' | 'json' | 'd3';
  includeDevDependencies?: boolean;
  includeTransitive?: boolean;
  maxDepth?: number;
  vulnerabilityCheck?: boolean;
  licenseCheck?: boolean;
}

export class DependencyGraphAnalyzer {
  private octokit: Octokit;
  private config: DependencyGraphConfig;

  constructor(token?: string, config: DependencyGraphConfig = {}) {
    this.octokit = token ? new Octokit({ auth: token }) : new Octokit();
    this.config = {
      format: 'mermaid',
      includeDevDependencies: false,
      includeTransitive: false,
      maxDepth: 3,
      vulnerabilityCheck: true,
      licenseCheck: true,
      ...config
    };
  }

  /**
   * Generate dependency graph for a repository
   */
  async analyzeDependencies(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<DependencyAnalysis> {
    const startTime = Date.now();

    try {
      console.log(`🔗 Starting dependency analysis for ${owner}/${repo}`);

      // Get package.json files
      const packageJson = await this.getPackageJson(owner, repo, branch);

      if (!packageJson) {
        throw new Error('No package.json found in repository');
      }

      // Analyze dependencies
      const dependencies = await this.analyzePackageDependencies(packageJson);

      // Build dependency graph
      const graph = this.buildDependencyGraph(dependencies);

      // Check for vulnerabilities
      const vulnerabilities = this.config.vulnerabilityCheck ?
        await this.checkVulnerabilities(dependencies) : [];

      // Check licenses
      const licenses = this.config.licenseCheck ?
        await this.checkLicenses(dependencies) : [];

      // Generate visual representation
      const visualGraph = this.generateVisualGraph(graph, this.config.format!);

      const analysis: DependencyAnalysis = {
        packageJson,
        dependencies,
        graph,
        vulnerabilities,
        licenses,
        visualGraph,
        metadata: {
          analysis_time: Date.now() - startTime,
          total_dependencies: dependencies.length,
          vulnerable_packages: vulnerabilities.length,
          license_issues: licenses.filter(l => l.compliance === 'warning' || l.compliance === 'error').length,
          last_updated: new Date().toISOString()
        }
      };

      console.log(`✅ Dependency analysis completed in ${analysis.metadata.analysis_time}ms`);
      return analysis;

    } catch (error) {
      console.error('❌ Dependency analysis failed:', error);
      throw new Error(`Failed to analyze dependencies: ${(error as Error).message}`);
    }
  }

  /**
   * Get package.json from repository
   */
  private async getPackageJson(owner: string, repo: string, branch: string): Promise<any> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
        ref: branch
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString();
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.warn('Could not fetch package.json:', error);
      return null;
    }
  }

  /**
   * Analyze package dependencies
   */
  private async analyzePackageDependencies(packageJson: any): Promise<PackageJsonDependency[]> {
    const dependencies: PackageJsonDependency[] = [];

    // Process regular dependencies
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        dependencies.push({
          name: name as string,
          version: version as string,
          type: 'runtime',
          required: true
        });
      }
    }

    // Process dev dependencies if enabled
    if (this.config.includeDevDependencies && packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        dependencies.push({
          name: name as string,
          version: version as string,
          type: 'development',
          required: false
        });
      }
    }

    // Process peer dependencies
    if (packageJson.peerDependencies) {
      for (const [name, version] of Object.entries(packageJson.peerDependencies)) {
        dependencies.push({
          name: name as string,
          version: version as string,
          type: 'peer',
          required: true
        });
      }
    }

    return dependencies;
  }

  /**
   * Build dependency graph structure
   */
  private buildDependencyGraph(dependencies: PackageJsonDependency[]): DependencyGraph {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Add root node (the main package)
    nodes.push({
      id: 'root',
      label: 'Root Package',
      type: 'root',
      size: 100,
      color: '#4CAF50'
    });

    // Add dependency nodes
    dependencies.forEach((dep, index) => {
      const nodeId = `dep_${index}`;
      const isDevDep = dep.type === 'development';

      nodes.push({
        id: nodeId,
        label: `${dep.name}@${dep.version}`,
        type: dep.type,
        size: isDevDep ? 60 : 80,
        color: isDevDep ? '#FF9800' : '#2196F3',
        metadata: {
          name: dep.name,
          version: dep.version,
          required: dep.required
        }
      });

      // Add edge from root to dependency
      edges.push({
        source: 'root',
        target: nodeId,
        type: dep.type,
        weight: dep.required ? 2 : 1,
        label: dep.type
      });
    });

    return { nodes, edges };
  }

  /**
   * Check for known vulnerabilities
   */
  private async checkVulnerabilities(dependencies: PackageJsonDependency[]): Promise<DependencyVulnerability[]> {
    const vulnerabilities: DependencyVulnerability[] = [];

    // Mock vulnerability data - in real implementation, this would query vulnerability databases
    const mockVulnerabilities: Record<string, any> = {
      'old-package': {
        severity: 'high',
        description: 'Known security vulnerability in authentication',
        fix: 'Upgrade to version 2.0.0',
        cvss: 7.8
      },
      'another-package': {
        severity: 'medium',
        description: 'Potential security issue with data validation',
        fix: 'Update to latest version',
        cvss: 5.3
      }
    };

    for (const dep of dependencies) {
      if (mockVulnerabilities[dep.name]) {
        const vuln = mockVulnerabilities[dep.name];
        vulnerabilities.push({
          package: dep.name,
          version: dep.version,
          severity: vuln.severity,
          description: vuln.description,
          fix: vuln.fix,
          cvss: vuln.cvss,
          published: new Date().toISOString()
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Check license compliance
   */
  private async checkLicenses(dependencies: PackageJsonDependency[]): Promise<LicenseInfo[]> {
    const licenses: LicenseInfo[] = [];

    // Mock license data - in real implementation, this would check license compatibility
    const mockLicenses: Record<string, any> = {
      'react': {
        license: 'MIT',
        compliance: 'good',
        restrictions: []
      },
      'some-proprietary': {
        license: 'Proprietary',
        compliance: 'warning',
        restrictions: ['Commercial use restricted', 'No redistribution']
      },
      'problematic-license': {
        license: 'GPL-2.0',
        compliance: 'error',
        restrictions: ['Copyleft license', 'May require source disclosure']
      }
    };

    for (const dep of dependencies) {
      const licenseInfo = mockLicenses[dep.name] || {
        license: 'Unknown',
        compliance: 'unknown' as const,
        restrictions: ['License information not available']
      };

      licenses.push({
        package: dep.name,
        license: licenseInfo.license,
        compliance: licenseInfo.compliance,
        restrictions: licenseInfo.restrictions,
        spdx: this.getSpdxIdentifier(licenseInfo.license)
      });
    }

    return licenses;
  }

  /**
   * Generate visual graph representation
   */
  private generateVisualGraph(graph: DependencyGraph, format: string): string {
    switch (format) {
      case 'mermaid':
        return this.generateMermaidGraph(graph);
      case 'dot':
        return this.generateDotGraph(graph);
      case 'json':
        return JSON.stringify(graph, null, 2);
      case 'd3':
        return this.generateD3Graph(graph);
      default:
        return this.generateMermaidGraph(graph);
    }
  }

  /**
   * Generate Mermaid graph syntax
   */
  private generateMermaidGraph(graph: DependencyGraph): string {
    let mermaid = 'graph TD\n';

    // Add nodes
    graph.nodes.forEach(node => {
      const color = node.color || '#666';
      mermaid += `  ${node.id}[${node.label}]\n`;
    });

    mermaid += '\n';

    // Add edges
    graph.edges.forEach(edge => {
      const style = edge.type === 'development' ? '-.->' : '-->';
      mermaid += `  ${edge.source} ${style} ${edge.target}\n`;
    });

    return mermaid;
  }

  /**
   * Generate DOT graph syntax
   */
  private generateDotGraph(graph: DependencyGraph): string {
    let dot = 'digraph G {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box];\n\n';

    // Add nodes
    graph.nodes.forEach(node => {
      const color = node.color || 'lightgray';
      dot += `  ${node.id} [label="${node.label}" fillcolor="${color}" style="filled"];\n`;
    });

    dot += '\n';

    // Add edges
    graph.edges.forEach(edge => {
      const style = edge.type === 'development' ? '[style=dashed]' : '';
      dot += `  ${edge.source} -> ${edge.target} ${style};\n`;
    });

    dot += '}';
    return dot;
  }

  /**
   * Generate D3.js compatible graph data
   */
  private generateD3Graph(graph: DependencyGraph): string {
    const d3Data = {
      nodes: graph.nodes.map(node => ({
        id: node.id,
        name: node.label,
        group: node.type === 'root' ? 1 : node.type === 'runtime' ? 2 : 3,
        size: node.size || 50,
        color: node.color || '#666'
      })),
      links: graph.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.weight || 1,
        type: edge.type
      }))
    };

    return JSON.stringify(d3Data, null, 2);
  }

  /**
   * Get SPDX license identifier
   */
  private getSpdxIdentifier(license: string): string {
    const spdxMap: Record<string, string> = {
      'MIT': 'MIT',
      'Apache-2.0': 'Apache-2.0',
      'GPL-2.0': 'GPL-2.0-only',
      'GPL-3.0': 'GPL-3.0-only',
      'BSD-2-Clause': 'BSD-2-Clause',
      'BSD-3-Clause': 'BSD-3-Clause',
      'ISC': 'ISC',
      'UNLICENSED': 'UNLICENSED'
    };

    return spdxMap[license] || 'NOASSERTION';
  }

  /**
   * Get dependency statistics
   */
  getDependencyStats(analysis: DependencyAnalysis): {
    total: number;
    runtime: number;
    development: number;
    peer: number;
    vulnerable: number;
    licenseIssues: number;
  } {
    const runtime = analysis.dependencies.filter(d => d.type === 'runtime').length;
    const development = analysis.dependencies.filter(d => d.type === 'development').length;
    const peer = analysis.dependencies.filter(d => d.type === 'peer').length;

    return {
      total: analysis.dependencies.length,
      runtime,
      development,
      peer,
      vulnerable: analysis.vulnerabilities.length,
      licenseIssues: analysis.licenses.filter(l => l.compliance === 'warning' || l.compliance === 'error').length
    };
  }

  /**
   * Generate dependency report
   */
  generateReport(analysis: DependencyAnalysis): string {
    const stats = this.getDependencyStats(analysis);
    const healthScore = this.calculateDependencyHealthScore(stats);

    let report = `# Dependency Analysis Report\n\n`;
    report += `**Analysis Date:** ${analysis.metadata.last_updated}\n`;
    report += `**Analysis Time:** ${analysis.metadata.analysis_time}ms\n\n`;

    report += `## 📊 Overview\n\n`;
    report += `- **Total Dependencies:** ${stats.total}\n`;
    report += `- **Runtime Dependencies:** ${stats.runtime}\n`;
    report += `- **Development Dependencies:** ${stats.development}\n`;
    report += `- **Peer Dependencies:** ${stats.peer}\n`;
    report += `- **Health Score:** ${healthScore}/100\n\n`;

    if (stats.vulnerable > 0) {
      report += `## ⚠️ Security Vulnerabilities\n\n`;
      analysis.vulnerabilities.forEach(vuln => {
        report += `- **${vuln.package}** (${vuln.severity}): ${vuln.description}\n`;
        report += `  - Fix: ${vuln.fix}\n`;
        report += `  - CVSS: ${vuln.cvss}\n\n`;
      });
    }

    if (stats.licenseIssues > 0) {
      report += `## 📄 License Issues\n\n`;
      analysis.licenses
        .filter(l => l.compliance === 'warning' || l.compliance === 'error')
        .forEach(license => {
          report += `- **${license.package}**: ${license.license} (${license.compliance})\n`;
          license.restrictions.forEach(restriction => {
            report += `  - ${restriction}\n`;
          });
          report += '\n';
        });
    }

    report += `## 🔗 Dependency Graph\n\n`;
    report += '```mermaid\n';
    report += analysis.visualGraph;
    report += '```\n\n';

    report += `## 📋 Top Dependencies\n\n`;
    analysis.dependencies
      .slice(0, 10)
      .forEach(dep => {
        const vuln = analysis.vulnerabilities.find(v => v.package === dep.name);
        const license = analysis.licenses.find(l => l.package === dep.name);

        report += `- **${dep.name}** (${dep.version}) - ${dep.type}`;
        if (vuln) report += ` ⚠️`;
        if (license && (license.compliance === 'warning' || license.compliance === 'error')) report += ` 📄`;
        report += '\n';
      });

    return report;
  }

  /**
   * Calculate dependency health score
   */
  public calculateDependencyHealthScore(stats: ReturnType<typeof this.getDependencyStats>): number {
    let score = 100;

    // Deduct points for vulnerabilities
    score -= stats.vulnerable * 20;

    // Deduct points for license issues
    score -= stats.licenseIssues * 10;

    // Deduct points for high dependency count
    if (stats.total > 50) score -= Math.min((stats.total - 50) * 0.5, 20);

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate dependency health score (private implementation)
   */
  private calculateDependencyHealthScoreInternal(stats: ReturnType<typeof this.getDependencyStats>): number {
    return this.calculateDependencyHealthScore(stats);
  }
}

export default DependencyGraphAnalyzer;
