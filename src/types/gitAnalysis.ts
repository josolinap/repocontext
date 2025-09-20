/**
 * Advanced Git Analysis Types and Interfaces
 */

import type { GitHubUser } from './github';

export interface GitCommit {
  sha: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  message: string;
  tree: {
    sha: string;
    url: string;
  };
  parents: Array<{
    sha: string;
    url: string;
  }>;
  url: string;
  comment_count: number;
  verification?: {
    verified: boolean;
    reason: string;
    signature: string | null;
    payload: string | null;
  };
}

export interface GitFileChange {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface GitCommitDetail {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: GitCommit;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: GitFileChange[];
}

export interface HotFile {
  filename: string;
  changes: number;
  additions: number;
  deletions: number;
  lastModified: string;
  authors: string[];
  changeFrequency: number; // changes per week
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeChurn {
  file: string;
  churn: number; // lines added + deleted
  age: number; // days since first commit
  complexity: number; // estimated complexity score
  risk: 'low' | 'medium' | 'high';
}

export interface BranchDivergence {
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  conflicting_files: string[];
  merge_conflicts: boolean;
}

export interface ContributorVelocity {
  author: string;
  email: string;
  commits: number;
  additions: number;
  deletions: number;
  files_changed: number;
  avg_commit_size: number;
  active_days: number;
  productivity_score: number;
}

export interface DevelopmentVelocity {
  total_commits: number;
  active_contributors: number;
  avg_commits_per_day: number;
  avg_lines_per_day: number;
  peak_development_days: string[];
  development_intensity: 'low' | 'medium' | 'high' | 'very_high';
}

export interface CommitPattern {
  hour_of_day: number[];
  day_of_week: number[];
  commit_size_distribution: {
    small: number; // 1-10 lines
    medium: number; // 11-50 lines
    large: number; // 51-200 lines
    huge: number; // 200+ lines
  };
  author_collaboration: Record<string, number>;
  file_type_distribution: Record<string, number>;
}

export interface AdvancedGitAnalysis {
  commit_history: {
    total_commits: number;
    time_range: {
      first_commit: string;
      last_commit: string;
      days_active: number;
    };
    authors: ContributorVelocity[];
    hot_files: HotFile[];
    code_churn: CodeChurn[];
    development_velocity: DevelopmentVelocity;
    commit_patterns: CommitPattern;
  };
  branch_analysis: {
    current_branch: string;
    branches: Array<{
      name: string;
      protected: boolean;
      ahead_behind?: BranchDivergence;
    }>;
    branch_divergence: Record<string, BranchDivergence>;
  };
  repository_health: {
    commit_frequency_score: number;
    contributor_diversity_score: number;
    code_churn_score: number;
    branch_management_score: number;
    overall_health: 'poor' | 'fair' | 'good' | 'excellent';
  };
  recommendations: string[];
}

export interface GitAnalysisConfig {
  max_commits?: number; // Maximum commits to analyze (default: 1000)
  time_range?: {
    since?: string;
    until?: string;
  };
  include_branches?: boolean;
  include_file_analysis?: boolean;
  include_author_analysis?: boolean;
  complexity_threshold?: number;
}

export interface GitAnalysisResult {
  success: boolean;
  data?: AdvancedGitAnalysis;
  error?: string;
  metadata: {
    analyzed_commits: number;
    analysis_time: number;
    last_updated: string;
  };
}
