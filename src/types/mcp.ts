/**
 * MCP Server Types and Interfaces
 */

export interface MCPServerConfig {
  tools?: Record<string, Function>;
  resources?: Record<string, Function>;
  customTemplates?: Map<string, any>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPToolCall {
  toolName: string;
  args: Record<string, any>;
}

export interface MCPResourceRequest {
  uri: string;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'json' | 'markdown';
    text: string;
  }>;
  data?: any;
}

export interface MCPResourceResponse {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}

export interface MCPCapabilities {
  tools: MCPTool[];
  resources: MCPResource[];
}

export interface MCPError extends Error {
  code?: string;
  details?: any;
}

export interface MCPAnalysisData {
  repository?: {
    owner: string;
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
  };
  analysis?: {
    framework: string;
    architecture: string;
    complexity: string;
    recommendations: string[];
  };
  codeQuality?: {
    overall: {
      score: number;
      grade: string;
      issues: number;
      recommendations: number;
    };
    metrics: Record<string, {
      score: number;
      status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
      details: string;
    }>;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      file: string;
      line?: number;
    }>;
    recommendations: string[];
  };
  comparison?: {
    summary: {
      totalRepos: number;
      bestPerformer: string;
      averageStars: number;
      averageIssues: number;
    };
    metrics: Array<{
      name: string;
      stars: number;
      forks: number;
      issues: number;
      language: string;
      lastCommit: string;
    }>;
    insights: string[];
  };
  dependencyGraph?: string;
  security?: {
    overall: {
      score: number;
      vulnerabilities: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    vulnerabilities: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      package: string;
      version: string;
      description: string;
      fix: string;
    }>;
    recommendations: string[];
  };
  collaboration?: {
    period: string;
    contributors: {
      total: number;
      active: number;
      new: number;
    };
    activity: {
      commits: number;
      pullRequests: number;
      issues: number;
      reviews: number;
    };
    collaboration: {
      avgResponseTime: string;
      codeReviewRate: string;
      mergeTime: string;
    };
    insights: string[];
  };
  performance?: Record<string, {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    details: string;
  }>;
  architecture?: {
    primary: string;
    patterns: Array<{
      name: string;
      confidence: number;
      description: string;
    }>;
    layers: string[];
    recommendations: string[];
  };
}

export interface MCPTemplate {
  id: string;
  name: string;
  description: string;
  sections?: string[];
  created?: string;
  version?: string;
  template?: string;
}

export interface MCPDeploymentGuide {
  platform: string;
  sections: {
    overview: string;
    prerequisites: string[];
    buildProcess: string;
    deploymentSteps: string[];
    environmentVariables: string;
    monitoring: string;
    securityConsiderations: string;
  };
}

export interface MCPProjectScaffold {
  template: string;
  framework: string;
  features: string[];
  files: string[];
  dependencies: string[];
  scripts: Record<string, string>;
  structure: string;
}

export interface MCPArchitecturePatterns {
  primary: string;
  patterns: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  layers: string[];
  recommendations: string[];
}
