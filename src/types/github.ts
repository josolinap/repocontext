/**
 * GitHub API Types and Interfaces
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  size: number;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  owner: GitHubUser;
  languages?: Record<string, number>;
  contributors?: GitHubContributor[];
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: 'User' | 'Bot' | 'Anonymous';
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string | null;
  url: string;
  sha: string;
  children?: GitHubFile[];
}

export interface GitHubPackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  keywords?: string[];
}

export interface GitHubError extends Error {
  status?: number;
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface GitHubAnalysisResult {
  basic: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    issues: number;
    created: string;
    updated: string;
    size: number;
  };
  languages: Record<string, number>;
  contributors: GitHubContributor[];
  packageJson?: GitHubPackageJson;
  readme?: string;
  structure: GitHubFile | null;
  analysis: RepositoryAnalysis;
  gitAnalysis?: {
    total_commits: number;
    active_branches: number;
    development_velocity: number;
    top_contributors: Array<{
      login: string;
      contributions: number;
    }>;
  };
}

export interface RepositoryAnalysis {
  framework: string;
  architecture: string;
  complexity: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

export interface GitHubServiceConfig {
  token?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
}

export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  rateLimit?: GitHubRateLimit;
}
