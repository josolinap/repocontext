/**
 * Type definitions index - exports all type interfaces
 */

export * from './github';
export * from './context';
export * from './mcp';

// Import and re-export git analysis types
import type { AdvancedGitAnalysis } from './gitAnalysis';
export type { AdvancedGitAnalysis } from './gitAnalysis';
export * from './gitAnalysis';

// Dependency Graph Types
export interface DependencyNode {
  id: string;
  label: string;
  type: 'root' | 'runtime' | 'development' | 'peer';
  size?: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'runtime' | 'development' | 'peer';
  weight?: number;
  label?: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface PackageJsonDependency {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer';
  required: boolean;
}

export interface DependencyVulnerability {
  package: string;
  version: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fix: string;
  cvss: number;
  published: string;
}

export interface LicenseInfo {
  package: string;
  license: string;
  compliance: 'good' | 'warning' | 'error' | 'unknown';
  restrictions: string[];
  spdx: string;
}

export interface DependencyAnalysis {
  packageJson: any;
  dependencies: PackageJsonDependency[];
  graph: DependencyGraph;
  vulnerabilities: DependencyVulnerability[];
  licenses: LicenseInfo[];
  visualGraph: string;
  metadata: {
    analysis_time: number;
    total_dependencies: number;
    vulnerable_packages: number;
    license_issues: number;
    last_updated: string;
  };
}

// AI Suggestions Types
export type SuggestionCategory =
  | 'development'
  | 'security'
  | 'performance'
  | 'collaboration'
  | 'quality'
  | 'architecture'
  | 'legal'
  | 'maintenance';

export type SuggestionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SuggestionContext {
  repository?: {
    owner: string;
    name: string;
    language?: string;
    size?: number;
  };
  team?: {
    size: number;
    experience?: 'junior' | 'mixed' | 'senior';
  };
  project?: {
    type: 'web' | 'mobile' | 'desktop' | 'library' | 'tool';
    framework?: string;
    complexity?: 'low' | 'medium' | 'high';
  };
}

export interface AISuggestion {
  id: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  confidence: number; // 0-1
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actionable: boolean;
  implementation: string[];
  metrics?: {
    current: number;
    target: number;
    improvement: string;
  };
  tags?: string[];
  relatedFiles?: string[];
  estimatedTime?: string;
}

// Multi-Repository Analysis Types
export interface MultiRepoAnalysis {
  repositories: Array<{
    repository: { owner: string; name: string; token?: string };
    gitAnalysis: AdvancedGitAnalysis | null;
    dependencyAnalysis: DependencyAnalysis | null;
    analysisTime: number;
    success: boolean;
    error?: string;
  }>;
  comparison: RepoComparison | null;
  insights: CrossRepoInsights;
  report: string | null;
  metadata: {
    totalRepositories: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    analysisTime: number;
    analyzedAt: string;
    context?: {
      organization?: string;
      team?: string;
      project?: string;
    };
  };
}

export interface RepositoryMetrics {
  repository: string;
  gitMetrics: {
    totalCommits: number;
    activeContributors: number;
    avgCommitsPerDay: number;
    repositoryHealth: 'poor' | 'fair' | 'good' | 'excellent';
    hotFilesCount: number;
    codeChurnScore: number;
  };
  dependencyMetrics: {
    totalDependencies: number;
    vulnerabilities: number;
    licenseIssues: number;
    healthScore: number;
  } | null;
  overallScore: number;
}

export interface RepoComparison {
  canCompare: boolean;
  reason?: string;
  metrics: RepositoryMetrics[];
  bestPerformer: string;
  worstPerformer: string;
  averages: {
    avgCommits: number;
    avgContributors: number;
    avgHealthScore: number;
    avgOverallScore: number;
  };
  patterns: Array<{
    type: string;
    description: string;
    significance: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

export interface CrossRepoInsights {
  summary: {
    totalRepos: number;
    successfulAnalyses: number;
    averageHealth: 'poor' | 'fair' | 'good' | 'excellent';
    commonPatterns: Array<{
      type: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
    riskAreas: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      affectedRepos?: string[];
    }>;
  };
  patterns: {
    development: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      trend: 'improving' | 'stable' | 'needs_improvement' | 'critical';
    }>;
    security: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      trend: 'improving' | 'stable' | 'needs_attention' | 'critical';
    }>;
    dependencies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      trend: 'improving' | 'stable' | 'needs_attention' | 'critical';
    }>;
    collaboration: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      trend: 'improving' | 'stable' | 'needs_improvement' | 'critical';
    }>;
  };
  recommendations: string[];
  organization?: string;
  team?: string;
  project?: string;
}

// Performance Optimization Types
export interface PerformanceMetrics {
  totalAnalyses: number;
  averageAnalysisTime: number;
  cacheHitRate: number;
  memoryUsage: MemoryUsage;
  errorRate: number;
  throughput: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface AnalysisQueue {
  high: Array<{
    key: string;
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    startTime: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  medium: Array<{
    key: string;
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    startTime: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  low: Array<{
    key: string;
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    startTime: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface BatchAnalysisResult<T> {
  results: T[];
  errors: Array<{ item: any; error: Error; index: number }>;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  totalTime: number;
  averageTimePerItem: number;
  batches: number;
}

export interface OptimizationConfig {
  enableCaching?: boolean;
  cacheTtl?: number;
  maxConcurrentAnalyses?: number;
  memoryThreshold?: number;
  enableStreaming?: boolean;
  batchSize?: number;
  enableCompression?: boolean;
  priorityQueue?: boolean;
}

// Enterprise API Types
export interface EnterpriseConfig {
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

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'viewer' | 'api';
  permissions: string[];
  createdAt: Date;
  lastLogin: Date | null;
  isActive: boolean;
}

export interface ApiKey {
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  event: string;
  details: any;
  timestamp: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface WebhookConfig {
  github?: {
    secret: string;
    events: string[];
  };
  gitlab?: {
    secret: string;
    events: string[];
  };
  custom?: Array<{
    name: string;
    url: string;
    secret: string;
    events: string[];
  }>;
}

export interface IntegrationConfig {
  github?: {
    appId: string;
    privateKey: string;
    webhookSecret: string;
  };
  jira?: {
    host: string;
    username: string;
    password: string;
  };
  slack?: {
    token: string;
    channels: string[];
  };
  teams?: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
}

// Real-time Collaboration Types
export interface CollaborationSession {
  id: string;
  type: 'analysis' | 'review' | 'planning' | 'general';
  title: string;
  description?: string;
  initiator: {
    userId: string;
    username: string;
    role: string;
  };
  participants: Array<{
    userId: string;
    username: string;
    role: string;
  }>;
  status: 'active' | 'ended' | 'paused';
  createdAt: Date;
  lastActivity: Date;
  settings: {
    maxParticipants: number;
    allowGuests: boolean;
    enableRecording: boolean;
    isPublic: boolean;
    requireApproval: boolean;
  };
  metadata: {
    messageCount: number;
    fileCount: number;
    analysisCount: number;
    duration: number;
  };
}

export interface TeamWorkspace {
  id: string;
  name: string;
  description?: string;
  creator: {
    userId: string;
    username: string;
    role: string;
  };
  members: Array<{
    userId: string;
    username: string;
    role: string;
  }>;
  repositories: Array<{
    owner: string;
    name: string;
    addedAt: Date;
    addedBy: string;
  }>;
  sharedAnalyses: SharedAnalysis[];
  settings: {
    isPublic: boolean;
    maxMembers: number;
    allowGuests: boolean;
    requireApproval: boolean;
    enableNotifications: boolean;
  };
  activity: TeamActivity[];
  createdAt: Date;
  lastActivity: Date;
}

export interface LiveAnalysis {
  id: string;
  sessionId: string;
  repository: {
    owner: string;
    name: string;
  };
  initiator: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStage: string;
  startedAt: Date;
  lastUpdate: Date;
  options: {
    includeDependencies?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
    realTimeUpdates?: boolean;
  };
  participants: string[];
  results: {
    gitAnalysis: AdvancedGitAnalysis | null;
    dependencyAnalysis: DependencyAnalysis | null;
    completedAt: Date;
  } | null;
  error: string | null;
}

export interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  recipients: string[];
  priority: 'low' | 'medium' | 'high';
  category?: string;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
  readBy: string[];
  status: 'sent' | 'delivered' | 'read';
}

export interface UserPresence {
  userId: string;
  username: string;
  sessionId?: string;
  status: 'active' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentActivity: string;
  metadata?: {
    device?: string;
    browser?: string;
    location?: string;
  };
}

export interface CollaborativeAnnotation {
  id: string;
  sessionId: string;
  userId: string;
  type: 'comment' | 'suggestion' | 'question' | 'highlight' | 'approval';
  content: string;
  target?: {
    file?: string;
    line?: number;
    column?: number;
    analysisId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  replies?: CollaborativeAnnotation[];
  reactions?: Array<{
    userId: string;
    type: 'like' | 'dislike' | 'laugh' | 'confused' | 'heart' | 'thumbs_up' | 'thumbs_down';
    createdAt: Date;
  }>;
}

export interface SharedAnalysis {
  id: string;
  type: 'git' | 'dependency' | 'security' | 'performance' | 'custom';
  title: string;
  description?: string;
  data: any;
  sharedBy: string;
  sharedAt: Date;
  permissions: {
    view: string[];
    edit: string[];
    delete: string[];
  };
  tags: string[];
  metadata: {
    repositoryCount?: number;
    analysisTime?: number;
    fileSize?: number;
    version?: string;
  };
}

export interface TeamActivity {
  id: string;
  type: 'session_created' | 'user_joined' | 'user_left' | 'session_ended' |
        'analysis_started' | 'analysis_completed' | 'analysis_failed' |
        'workspace_created' | 'member_added' | 'analysis_shared' |
        'annotation_added' | 'notification_sent' | 'file_uploaded';
  userId: string;
  username: string;
  sessionId?: string;
  details: any;
  timestamp: Date;
}

export interface RealTimeConfig {
  enableLiveAnalysis?: boolean;
  enableTeamWorkspaces?: boolean;
  enableNotifications?: boolean;
  enableAnnotations?: boolean;
  enablePresenceTracking?: boolean;
  maxTeamSize?: number;
  sessionTimeout?: number;
  notificationRetention?: number;
  enableActivityTracking?: boolean;
}

// Advanced Analytics Types
export interface AnalyticsConfig {
  enableML?: boolean;
  enablePredictions?: boolean;
  enableRiskAssessment?: boolean;
  enableQualityMetrics?: boolean;
  enableTeamAnalytics?: boolean;
  modelUpdateInterval?: number;
  dataRetentionDays?: number;
  confidenceThreshold?: number;
  enableRealTimeAnalytics?: boolean;
  maxDataPoints?: number;
}

export interface MLModel {
  id: string;
  type: 'classification' | 'regression' | 'time_series' | 'clustering';
  version: string;
  lastUpdated: Date;
  accuracy: number;
  features?: string[];
  parameters?: Record<string, any>;
}

export interface PredictiveInsight {
  id: string;
  type: 'risk' | 'quality' | 'team' | 'security' | 'performance' | 'trend';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendation: string;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;
  timeframe: string;
  metrics: Record<string, {
    score: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    insights: string[];
  }>;
  patterns: Array<{
    type: string;
    description: string;
    significance: 'low' | 'medium' | 'high';
  }>;
  predictions: Array<{
    metric: string;
    prediction: string;
    confidence: number;
  }>;
  analyzedAt: Date;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Record<string, {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    insights: string[];
  }>;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  recommendations: string[];
  confidence: number;
  assessedAt: Date;
}

export interface QualityMetrics {
  overallScore: number;
  factors: Record<string, {
    score: number;
    insights: string[];
  }>;
  issues: string[];
  strengths: string[];
  recommendations: string[];
  confidence: number;
  analyzedAt: Date;
}

export interface PerformancePrediction {
  predictedScore: number;
  confidence: number;
  timeframe: string;
  factors: Record<string, {
    score: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    insights: string[];
  }>;
  recommendations: string[];
  predictedAt: Date;
}

export interface TeamAnalytics {
  collaborationScore: number;
  productivityScore: number;
  communicationScore: number;
  knowledgeDistribution: Record<string, number>;
  collaborationPatterns: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface RepositoryInsights {
  repository: { owner: string; name: string };
  generatedAt: Date;
  context?: {
    organization?: string;
    team?: string;
    timeframe?: string;
  };
  quality: QualityMetrics;
  risk: RiskAssessment;
  performance: PerformancePrediction;
  trends: TrendAnalysis;
  team: TeamAnalytics;
  predictions: PredictiveInsight[];
  overallScore: number;
  confidence: number;
  recommendations: string[];
  metadata: {
    dataPoints: number;
    analysisTime: number;
    modelVersion: string;
    featuresUsed: string[];
  };
}

export interface AnalyticsResult {
  success: boolean;
  insights?: RepositoryInsights;
  error?: string;
  metadata: {
    analysisTime: number;
    modelVersion: string;
    confidence: number;
  };
}

// Deployment Manager Types
export interface DeploymentConfig {
  environment?: 'development' | 'staging' | 'production';
  enableDocker?: boolean;
  enableKubernetes?: boolean;
  enableMonitoring?: boolean;
  enableBackup?: boolean;
  enableAutoScaling?: boolean;
  cloudProvider?: 'aws' | 'gcp' | 'azure' | 'local';
  registry?: string;
  namespace?: string;
  replicas?: number;
  resources?: {
    cpu: string;
    memory: string;
    storage: string;
  };
}

export interface DockerConfig {
  imageName: string;
  tag: string;
  registry: string;
  dockerfile: string;
  buildContext: string;
  ports: Array<{ host: number; container: number }>;
  environment: Record<string, string>;
  volumes: Array<{ host: string; container: string }>;
  restartPolicy: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  healthCheck?: {
    command: string[];
    interval: number;
    timeout: number;
    retries: number;
    startPeriod: number;
  };
}

export interface KubernetesConfig {
  namespace: string;
  deployment: {
    name: string;
    replicas: number;
    image: string;
    ports: Array<{ name: string; containerPort: number; protocol: string }>;
    resources: {
      requests: { cpu: string; memory: string };
      limits: { cpu: string; memory: string };
    };
    env: Array<{ name: string; value: string }>;
    healthChecks: {
      liveness: { path: string; port: number; initialDelay: number; period: number };
      readiness: { path: string; port: number; initialDelay: number; period: number };
    };
  };
  service: {
    name: string;
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    ports: Array<{ name: string; port: number; targetPort: number; protocol: string }>;
  };
  ingress?: {
    name: string;
    className: string;
    hosts: Array<{ host: string; paths: Array<{ path: string; pathType: string; backend: { serviceName: string; servicePort: number } }> }>;
    tls: Array<{ hosts: string[]; secretName: string }>;
  };
}

export interface CloudConfig {
  provider: 'aws' | 'gcp' | 'azure';
  region: string;
  project?: string;
  resourceGroup?: string;
  instanceType: string;
  autoScaling: {
    minSize: number;
    maxSize: number;
    desiredCapacity: number;
  };
  database: {
    instanceClass: string;
    engine: string;
    version: string;
    storage: number;
  };
  cache: {
    nodeType: string;
    engine: string;
    version: string;
    nodes: number;
  };
  storage: {
    bucket: string;
    versioning: boolean;
    encryption: string;
  };
}

export interface DeploymentStatus {
  id: string;
  status: 'initializing' | 'ready' | 'deployed' | 'failed' | 'updating' | 'rolling_back' | 'stopped';
  environment: string;
  services: Array<{
    name: string;
    status: 'starting' | 'running' | 'stopped' | 'failed';
    health: 'healthy' | 'unhealthy' | 'unknown';
    replicas: number;
  }>;
  deployedAt: Date;
  version: string;
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  metadata?: Record<string, any>;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime: number;
  lastChecked: Date;
  checks: Record<string, {
    status: 'pass' | 'fail';
    responseTime: number;
    lastChecked: Date;
    message?: string;
  }>;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: { rx: number; tx: number };
  };
}

export interface ScalingConfig {
  service: string;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  lastScaled: Date;
  autoScaling: boolean;
  metrics?: {
    cpuThreshold: number;
    memoryThreshold: number;
    scaleUpCooldown: number;
    scaleDownCooldown: number;
  };
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
  types: Array<'database' | 'files' | 'volumes' | 'config'>;
  compression: boolean;
  encryption: boolean;
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    path: string;
    credentials?: Record<string, string>;
  };
}

// Common utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

export interface ServiceConfig {
  timeout?: number;
  retries?: RetryConfig;
  cacheEnabled?: boolean;
  cacheTtl?: number;
}

export interface EnvironmentConfig {
  githubToken?: string;
  mcpEnabled?: boolean;
  debugMode?: boolean;
  apiBaseUrl?: string;
  cacheEnabled?: boolean;
}

// Error types
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
