# 📊 Enhanced Repository Context Generator - Phase 2 Documentation

## Overview

Phase 2 introduces **Advanced Repository Analysis** capabilities with comprehensive Git analysis, dependency analysis, AI-powered suggestions, interactive dashboards, and automated workflows.

## 🚀 New Features

### 1. Advanced Git Analysis Service

**Location**: `src/lib/advancedGitAnalyzer.ts`

#### Features:
- **Commit History Analysis**: Up to 1000 commits with detailed metrics
- **Hot Files Detection**: Identifies frequently modified files with impact scoring
- **Code Churn Analysis**: Tracks file modification patterns and complexity
- **Contributor Velocity**: Measures development speed and productivity
- **Development Patterns**: Analyzes commit timing and collaboration patterns
- **Repository Health**: Multi-dimensional scoring system
- **Branch Analysis**: Branch structure and divergence analysis

#### Usage:
```typescript
import { AdvancedGitAnalyzer } from './src/lib/advancedGitAnalyzer';

const analyzer = new AdvancedGitAnalyzer(token, {
  max_commits: 1000,
  include_branches: true,
  include_file_analysis: true
});

const result = await analyzer.analyzeRepository('owner', 'repo');
```

### 2. Dependency Graph Analyzer

**Location**: `src/lib/dependencyGraphAnalyzer.ts`

#### Features:
- **Visual Graph Generation**: Supports Mermaid, DOT, JSON, and D3 formats
- **Vulnerability Scanning**: Identifies security issues with CVSS scoring
- **License Compliance**: Checks license compatibility and restrictions
- **Dependency Health Scoring**: Comprehensive health assessment
- **Interactive Reports**: Detailed markdown reports with recommendations

#### Usage:
```typescript
import { DependencyGraphAnalyzer } from './src/lib/dependencyGraphAnalyzer';

const analyzer = new DependencyGraphAnalyzer(token, {
  format: 'mermaid',
  includeDevDependencies: false,
  vulnerabilityCheck: true,
  licenseCheck: true
});

const analysis = await analyzer.analyzeDependencies('owner', 'repo');
```

### 3. AI-Powered Suggestions Engine

**Location**: `src/lib/aiSuggestionsEngine.ts`

#### Features:
- **Intelligent Recommendations**: Context-aware suggestions based on analysis data
- **Multi-Category Analysis**: Development, security, performance, collaboration, quality, architecture, legal, maintenance
- **Priority-Based Scoring**: Critical, high, medium, low priority with confidence scores
- **Actionable Implementation**: Step-by-step implementation guides
- **Metrics-Driven**: Current vs target metrics with improvement tracking

#### Usage:
```typescript
import { AISuggestionsEngine } from './src/lib/aiSuggestionsEngine';

const engine = new AISuggestionsEngine({
  includeSecuritySuggestions: true,
  includePerformanceSuggestions: true,
  minConfidenceScore: 0.6
});

const suggestions = await engine.generateSuggestions(gitAnalysis, dependencyAnalysis);
```

### 4. Interactive Dashboard

**Location**: `src/components/RepositoryDashboard.jsx`

#### Features:
- **Material-UI Interface**: Modern, responsive design with charts and metrics
- **Multi-Tab Layout**: Git Analysis, Dependencies, and Recommendations tabs
- **Interactive Charts**: Bar charts, pie charts, progress bars, and data visualizations
- **Real-time Analysis**: Repository analysis dialog with form validation
- **Health Scoring**: Visual progress bars and color-coded status indicators
- **Security Alerts**: Vulnerability and license compliance warnings

#### Components:
- **Git Analysis Tab**: Repository health, development velocity, hot files, contributor charts
- **Dependencies Tab**: Dependency overview, security status, license compliance, top dependencies
- **Recommendations Tab**: AI-powered suggestions with implementation guides

### 5. GitHub Actions Automation

**Location**: `.github/workflows/repository-analysis.yml`

#### Features:
- **Automated Analysis Workflow**: Runs on push, PR, schedule, and manual trigger
- **Comprehensive Analysis**: Git history, dependencies, vulnerabilities, and licenses
- **Report Generation**: Automated markdown report creation
- **Artifact Management**: Uploads analysis results for download
- **PR Integration**: Comments on pull requests with analysis summaries
- **Scheduled Runs**: Daily analysis at 2 AM UTC

#### Scripts:
- `scripts/generate-report.js` - Report generation for GitHub Actions
- `scripts/pr-comment.js` - PR commenting functionality

### 6. Comprehensive Testing Suite

**Location**: `src/lib/__tests__/advancedGitAnalyzer.test.ts`

#### Features:
- **Unit Tests**: Complete test coverage for AdvancedGitAnalyzer
- **Integration Tests**: API mocking and error handling tests
- **Performance Tests**: Large dataset handling and memory optimization
- **Edge Case Testing**: Empty repositories, malformed data, special characters
- **Error Handling**: Network errors, rate limiting, API failures
- **Mock Implementation**: Comprehensive mocking for external dependencies

## 🛠️ Technical Architecture

### Service Container Integration

All services are integrated through a dependency injection container:

```typescript
import { serviceContainer } from './src/lib/serviceContainer';

const services = await serviceContainer.initialize();
const gitAnalyzer = services.gitAnalyzer;
const dependencyAnalyzer = services.dependencyAnalyzer;
```

### MCP Server Tools

**Advanced Git Analysis Tools:**
- `analyze_git_history` - Comprehensive commit history analysis
- `detect_hot_files` - Hot files detection with impact scoring
- `analyze_code_churn` - Code churn analysis with risk assessment
- `calculate_development_velocity` - Development velocity metrics
- `analyze_contributor_patterns` - Contributor collaboration analysis
- `assess_repository_health` - Repository health assessment

**Dependency Analysis Tools:**
- `analyze_dependencies` - Full dependency analysis with graphs
- `check_vulnerabilities` - Security vulnerability scanning
- `check_licenses` - License compliance checking
- `generate_dependency_report` - Comprehensive dependency reports

### Type Definitions

All new types are exported from `src/types/index.ts`:

```typescript
import type {
  AdvancedGitAnalysis,
  DependencyAnalysis,
  AISuggestion,
  SuggestionCategory,
  SuggestionPriority
} from '../types';
```

## 📊 Dashboard Features

### Git Analysis Tab
- **Repository Health Overview**: Visual progress bars for all health metrics
- **Development Velocity**: Commits per day, lines per day, development intensity
- **Hot Files Detection**: Color-coded chips showing frequently modified files
- **Contributor Charts**: Interactive bar charts showing top contributors
- **Commit Activity**: Total commits, active days, and time range analysis

### Dependencies Tab
- **Dependency Overview**: Total counts and categorization
- **Security Status**: Vulnerability alerts with severity levels
- **License Compliance**: Pie chart showing license distribution
- **Top Dependencies**: Visual chips showing key packages

### Recommendations Tab
- **Actionable Insights**: AI-generated recommendations based on analysis
- **Security Alerts**: Critical vulnerability notifications
- **License Warnings**: Compliance issue notifications

## 🔧 Configuration

### Environment Variables
```bash
VITE_GITHUB_TOKEN=your_github_token
VITE_MCP_ENABLED=true
VITE_DEBUG_MODE=false
```

### Service Configuration
```typescript
const config = {
  githubToken: process.env.VITE_GITHUB_TOKEN,
  mcpEnabled: process.env.VITE_MCP_ENABLED === 'true',
  debugMode: process.env.VITE_DEBUG_MODE === 'true',
  cacheEnabled: true
};
```

## 📈 Performance Optimizations

### Memory Management
- Efficient data structures for large commit histories
- Streaming analysis for memory-constrained environments
- Garbage collection optimization for long-running processes

### API Rate Limiting
- Intelligent request batching
- Exponential backoff for retries
- Request caching and deduplication

### Analysis Parallelization
- Concurrent analysis of different aspects
- Background processing for large repositories
- Progress tracking and cancellation support

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Generate coverage report
```

### Test Categories
- **Unit Tests**: Individual method functionality
- **Integration Tests**: API interactions and data flow
- **Performance Tests**: Speed and memory efficiency
- **Error Tests**: Graceful failure handling
- **Edge Case Tests**: Unusual input scenarios

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
VITE_GITHUB_TOKEN=your_production_token
VITE_MCP_ENABLED=true
```

## 📋 API Reference

### AdvancedGitAnalyzer
```typescript
interface GitAnalysisConfig {
  max_commits?: number;
  include_branches?: boolean;
  include_file_analysis?: boolean;
  include_author_analysis?: boolean;
  complexity_threshold?: number;
}

class AdvancedGitAnalyzer {
  constructor(token?: string, config?: GitAnalysisConfig);
  analyzeRepository(owner: string, repo: string): Promise<GitAnalysisResult>;
  analyzeCommits(commits: GitCommitDetail[]): AdvancedGitAnalysis['commit_history'];
  calculateRepositoryHealth(...): RepositoryHealth;
  generateRecommendations(...): string[];
}
```

### DependencyGraphAnalyzer
```typescript
interface DependencyGraphConfig {
  format?: 'mermaid' | 'dot' | 'json' | 'd3';
  includeDevDependencies?: boolean;
  includeTransitive?: boolean;
  maxDepth?: number;
  vulnerabilityCheck?: boolean;
  licenseCheck?: boolean;
}

class DependencyGraphAnalyzer {
  constructor(token?: string, config?: DependencyGraphConfig);
  analyzeDependencies(owner: string, repo: string, branch?: string): Promise<DependencyAnalysis>;
  generateReport(analysis: DependencyAnalysis): string;
  getDependencyStats(analysis: DependencyAnalysis): DependencyStats;
}
```

### AISuggestionsEngine
```typescript
interface SuggestionEngineConfig {
  enableAdvancedAnalysis?: boolean;
  includeSecuritySuggestions?: boolean;
  includePerformanceSuggestions?: boolean;
  includeCollaborationSuggestions?: boolean;
  includeCodeQualitySuggestions?: boolean;
  minConfidenceScore?: number;
  maxSuggestions?: number;
}

class AISuggestionsEngine {
  constructor(config?: SuggestionEngineConfig);
  generateSuggestions(
    gitAnalysis: AdvancedGitAnalysis,
    dependencyAnalysis?: DependencyAnalysis,
    context?: SuggestionContext
  ): Promise<AISuggestion[]>;
  filterSuggestions(suggestions: AISuggestion[]): AISuggestion[];
}
```

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/josolinap/repository-context-generator.git
cd repository-context-generator
npm install
npm run dev
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

### Pull Request Process
1. Create feature branch
2. Add tests for new functionality
3. Update documentation
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Phase 1**: Basic repository analysis and context generation
- **Phase 2**: Advanced Git analysis, dependency analysis, AI suggestions, dashboard, and automation
- **Tech Stack**: React, TypeScript, Material-UI, GitHub API, MCP Protocol
- **Testing**: Jest, comprehensive test coverage
- **CI/CD**: GitHub Actions with automated workflows

---

**Built with ❤️ for developers who want AI assistants to understand their code better**
