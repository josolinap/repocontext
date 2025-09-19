# Repository Context Generator - MCP Integration

This project now includes full MCP (Model Context Protocol) integration, allowing you to use the repository analysis tools directly within your IDE.

## 🚀 New Features Added

Based on the analysis of https://detailer.ginylil.com/, we've implemented:

### 1. **Enhanced Template System**
- **📋 Comprehensive**: Complete repository analysis with all details
- **🎯 Minimal**: Basic repository information only
- **⚙️ Technical**: Technical details and dependencies
- **📊 Overview**: Summary and key facts
- **📝 Rules**: Framework-specific coding rules and standards
- **🔄 Workflows**: PR process, release workflow, collaboration guidelines
- **⚡ Shortcuts**: Development commands and productivity tools
- **🏗️ Scaffold**: Component templates and boilerplate code

### 2. **MCP Server Integration**
- **Tools**: `analyze_repository`, `generate_context`, `list_templates`, `get_repository_info`
- **Resources**: `repository://current`, `templates://list`, `context://preview`
- **IDE Integration**: Works with VSCode, Cursor, and other MCP-compatible editors

### 3. **Advanced Analysis Features**
- **Framework Detection**: React, Next.js, Vue, Angular, etc.
- **Architecture Analysis**: Component-based, MVC, Microservices, etc.
- **Code Quality Scoring**: Automated quality assessment
- **Language Distribution**: Detailed language breakdown
- **Complexity Analysis**: Code complexity metrics

## 🛠️ MCP Setup Instructions

### For VSCode/Cursor:

1. **Install MCP Extension**
   ```bash
   # For VSCode
   code --install-extension modelcontextprotocol.vscode-mcp

   # For Cursor
   # MCP is built-in
   ```

2. **Configure MCP Server**
   Add to your MCP configuration file (usually `~/.mcp/config.json`):

   ```json
   {
     "mcpServers": {
       "repo-context-generator": {
         "command": "node",
         "args": ["/path/to/your/project/src/lib/mcpServer.js"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

3. **Restart Your IDE**
   Restart VSCode/Cursor to load the MCP server.

### For Other MCP-Compatible Editors:

Follow your editor's MCP setup instructions and use the same configuration format.

## 📖 MCP Tools Usage

### Available Tools:

#### 1. `analyze_repository`
Analyzes a GitHub repository and extracts key information.

```javascript
// Usage in your IDE
await mcp.callTool('analyze_repository', {
  owner: 'microsoft',
  repo: 'vscode',
  githubToken: 'your_github_token' // optional
});
```

#### 2. `generate_context`
Generates a context file from repository analysis data.

```javascript
await mcp.callTool('generate_context', {
  analysisData: analysisResult,
  template: 'comprehensive' // or 'rules', 'workflows', etc.
});
```

#### 3. `list_templates`
Lists all available context generation templates.

```javascript
await mcp.callTool('list_templates', {});
```

#### 4. `get_repository_info`
Gets basic information about a repository.

```javascript
await mcp.callTool('get_repository_info', {
  owner: 'facebook',
  repo: 'react'
});
```

## 📚 MCP Resources

### Available Resources:

#### 1. `repository://current`
Information about the currently analyzed repository.

#### 2. `templates://list`
List of all available context generation templates.

#### 3. `context://preview`
Preview of the generated context file.

## 🎯 Template Details

### Comprehensive Template
- Project overview with stats and metadata
- Technical details (languages, frameworks, architecture)
- Code quality analysis
- Development setup instructions
- AI assistant guidelines

### Rules Template
- Framework-specific coding rules
- Best practices and conventions
- Code standards and formatting
- Documentation requirements

### Workflows Template
- Development workflow guidelines
- PR process and review guidelines
- Release process and versioning
- Collaboration guidelines

### Shortcuts Template
- Productivity shortcuts and commands
- Development server quick starts
- Testing and linting shortcuts
- Deployment automation

### Scaffold Template
- Project scaffolding templates
- Component boilerplate code
- Configuration file templates
- Utility function templates

## 🚀 Advanced Features (Inspired by detailer.ginylil.com & MCP Servers)

### 1. **Code Quality Analysis**
Analyze code quality metrics including:
- **Complexity Analysis**: Cyclomatic complexity and maintainability index
- **Test Coverage**: Automated test coverage assessment
- **Documentation Quality**: API documentation completeness
- **Security Scoring**: Basic security vulnerability detection
- **Performance Metrics**: Code performance indicators

```javascript
await mcp.callTool('analyze_code_quality', {
  owner: 'microsoft',
  repo: 'vscode',
  branch: 'main'
});
```

### 2. **Repository Comparison**
Compare multiple repositories side-by-side:
- **Metrics Comparison**: Stars, forks, issues, activity levels
- **Language Distribution**: Programming language breakdowns
- **Performance Insights**: Comparative analysis and recommendations
- **Best Practices**: Identify successful patterns across repos

```javascript
await mcp.callTool('compare_repositories', {
  repositories: [
    { owner: 'facebook', repo: 'react' },
    { owner: 'vuejs', repo: 'vue' }
  ]
});
```

### 3. **Dependency Graph Generation**
Visualize project dependencies:
- **Mermaid Diagrams**: Interactive dependency graphs
- **Security Analysis**: Vulnerable dependency detection
- **Update Recommendations**: Outdated package suggestions
- **Licensing Information**: Dependency license tracking

```javascript
await mcp.callTool('generate_dependency_graph', {
  owner: 'microsoft',
  repo: 'vscode',
  format: 'mermaid'
});
```

### 4. **Security Vulnerability Analysis**
Comprehensive security scanning:
- **Vulnerability Detection**: Known security issues in dependencies
- **Severity Classification**: Critical, high, medium, low risk levels
- **Fix Recommendations**: Specific upgrade paths and patches
- **Compliance Reporting**: Security compliance metrics

```javascript
await mcp.callTool('analyze_security_vulnerabilities', {
  owner: 'myorg',
  repo: 'myproject'
});
```

### 5. **Custom Template Builder**
Create personalized context templates:
- **Dynamic Sections**: User-defined template sections
- **Framework Integration**: Framework-specific content generation
- **Team Standards**: Organization-specific guidelines
- **Project-Specific**: Tailored content for different project types

```javascript
await mcp.callTool('create_custom_template', {
  name: 'my-custom-template',
  description: 'Custom template for React projects',
  sections: ['Overview', 'Architecture', 'API', 'Testing']
});
```

### 6. **Team Collaboration Analysis**
Analyze team dynamics and productivity:
- **Contribution Metrics**: Individual and team contribution analysis
- **Response Times**: PR review and issue response tracking
- **Collaboration Patterns**: Team interaction analysis
- **Productivity Insights**: Workflow efficiency recommendations

```javascript
await mcp.callTool('analyze_team_collaboration', {
  owner: 'myorg',
  repo: 'myproject',
  timeframe: 30
});
```

### 7. **Deployment Guide Generation**
Automated deployment documentation:
- **Platform-Specific**: AWS, Vercel, Netlify, Docker guides
- **Framework Integration**: React, Next.js, Vue deployment configs
- **Environment Setup**: Development, staging, production configs
- **CI/CD Integration**: Automated deployment pipelines

```javascript
await mcp.callTool('generate_deployment_guide', {
  analysisData: analysisResult,
  platform: 'vercel'
});
```

### 8. **Performance Metrics Analysis**
Comprehensive performance evaluation:
- **Code Complexity**: Maintainability and complexity scoring
- **Bundle Analysis**: JavaScript bundle size optimization
- **Runtime Performance**: Memory usage and execution metrics
- **Optimization Recommendations**: Performance improvement suggestions

```javascript
await mcp.callTool('analyze_performance_metrics', {
  owner: 'myorg',
  repo: 'myproject',
  metrics: ['complexity', 'maintainability', 'test-coverage']
});
```

### 9. **Project Scaffolding**
Generate project boilerplates:
- **Framework Templates**: React, Vue, Angular, Next.js starters
- **Feature Integration**: Authentication, database, testing setups
- **Best Practices**: ESLint, Prettier, TypeScript configurations
- **Development Tools**: Hot reload, debugging, build optimization

```javascript
await mcp.callTool('create_project_scaffold', {
  template: 'react-typescript',
  framework: 'React',
  features: ['authentication', 'testing', 'storybook']
});
```

### 10. **Architecture Pattern Analysis**
Identify and recommend architectural patterns:
- **Pattern Recognition**: MVC, MVVM, Microservices detection
- **Design Quality**: SOLID principles compliance
- **Scalability Assessment**: Architecture scalability evaluation
- **Refactoring Suggestions**: Architecture improvement recommendations

```javascript
await mcp.callTool('analyze_architecture_patterns', {
  owner: 'myorg',
  repo: 'myproject'
});
```

## 📚 Advanced MCP Resources

### New Resource Endpoints:

#### 1. `analysis://code-quality`
Real-time code quality metrics and analysis results.

#### 2. `comparison://repositories`
Side-by-side repository comparison data.

#### 3. `graph://dependencies`
Interactive dependency visualization data.

#### 4. `security://vulnerabilities`
Security vulnerability reports and recommendations.

#### 5. `collaboration://team`
Team collaboration metrics and insights.

#### 6. `performance://metrics`
Performance analysis results and optimization suggestions.

#### 7. `architecture://patterns`
Architecture pattern analysis and recommendations.

## 🔧 Advanced Configuration

### Custom Analysis Rules
```json
{
  "analysis": {
    "codeQuality": {
      "complexityThreshold": 10,
      "testCoverageMinimum": 80,
      "securityScanEnabled": true
    },
    "performance": {
      "bundleSizeLimit": "500KB",
      "performanceBudget": "2s"
    }
  }
}
```

### Integration with External Tools
- **SonarQube**: Advanced code quality analysis
- **Snyk**: Security vulnerability scanning
- **Dependabot**: Automated dependency updates
- **CodeClimate**: Maintainability analysis
- **Lighthouse**: Performance auditing

## 🎨 UI Enhancements (Inspired by detailer.ginylil.com)

### Advanced Visualization
- **Interactive Charts**: Real-time metrics visualization
- **Dependency Graphs**: Mermaid diagram integration
- **Code Quality Dashboards**: Comprehensive quality metrics
- **Security Reports**: Vulnerability visualization
- **Performance Timelines**: Historical performance tracking

### Enhanced User Experience
- **Template Preview**: Live preview before generation
- **Comparison Views**: Side-by-side repository analysis
- **Custom Dashboards**: Personalized metrics views
- **Real-time Updates**: Live analysis progress
- **Export Options**: Multiple format exports (PDF, JSON, Markdown)

## 🚀 Integration Examples

### VSCode Integration
```json
{
  "mcpServers": {
    "repo-analyzer": {
      "command": "node",
      "args": ["/path/to/project/src/lib/mcpServer.js"],
      "env": {
        "NODE_ENV": "development",
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

### Cursor Integration
```json
{
  "mcp": {
    "servers": {
      "repo-context": {
        "command": "node",
        "args": ["src/lib/mcpServer.js"],
        "env": {
          "ANALYSIS_DEPTH": "comprehensive"
        }
      }
    }
  }
}
```

## 📊 Advanced Analytics

### Repository Health Scoring
- **Overall Health**: 0-100 composite score
- **Component Scores**: Code quality, security, performance, maintainability
- **Trend Analysis**: Historical health tracking
- **Benchmarking**: Industry standard comparisons

### Team Productivity Metrics
- **Velocity Tracking**: Sprint and release velocity
- **Quality Gates**: Automated quality checks
- **Collaboration Index**: Team interaction effectiveness
- **Knowledge Sharing**: Documentation and code review metrics

## 🔒 Enterprise Features

### Security & Compliance
- **Audit Trails**: Complete analysis history
- **Compliance Reports**: SOC2, GDPR compliance tracking
- **Access Control**: Role-based feature access
- **Data Encryption**: End-to-end encrypted analysis data

### Scalability & Performance
- **Batch Processing**: Analyze multiple repositories simultaneously
- **Caching Layer**: Intelligent result caching and invalidation
- **Background Jobs**: Asynchronous analysis for large repositories
- **Load Balancing**: Distributed analysis processing

## 🤝 API Integration

### REST API Endpoints
- `POST /api/analyze` - Repository analysis
- `GET /api/templates` - Available templates
- `POST /api/compare` - Repository comparison
- `GET /api/metrics/:repo` - Repository metrics

### Webhook Support
- **GitHub Webhooks**: Automatic re-analysis on changes
- **Slack Integration**: Analysis result notifications
- **Email Reports**: Scheduled analysis reports
- **API Callbacks**: Custom integration endpoints

## 🔧 Advanced Features

### Multi-Branch Analysis
Support for analyzing different branches:
```javascript
await mcp.callTool('analyze_repository', {
  owner: 'owner',
  repo: 'repo',
  branch: 'develop' // specify branch
});
```

### Custom Template System
Create your own templates by extending the `ContextGenerator` class:

```javascript
class CustomContextGenerator extends ContextGenerator {
  generateCustomTemplate(data) {
    // Your custom template logic
  }
}
```

### Incremental Analysis
Analyze only changes since last analysis for faster updates.

## 🚀 Getting Started

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd <your-repo>
   npm install
   npm run dev
   ```

2. **Configure GitHub Token**
   - Go to https://github.com/settings/tokens
   - Create a Personal Access Token with `repo` scope
   - Add it to your MCP server environment or pass it to tools

3. **Start Using MCP Tools**
   - Use the tools in your IDE
   - Generate context files for your repositories
   - Integrate with your development workflow

## 📋 Example Workflow

1. **Analyze Repository**
   ```javascript
   const analysis = await mcp.callTool('analyze_repository', {
     owner: 'your-org',
     repo: 'your-project'
   });
   ```

2. **Generate Context**
   ```javascript
   const context = await mcp.callTool('generate_context', {
     analysisData: analysis.data,
     template: 'rules'
   });
   ```

3. **Use in AI Assistant**
   - The generated context file contains all the information your AI assistant needs
   - Include it in your prompts for better code suggestions
   - Use it for code reviews and documentation

## 🔍 Troubleshooting

### Common Issues:

1. **MCP Server Not Loading**
   - Check your MCP configuration file path
   - Ensure Node.js is in your PATH
   - Restart your IDE

2. **GitHub Token Issues**
   - Verify token has correct scopes
   - Check token hasn't expired
   - Ensure token format is correct (starts with `ghp_` or `github_pat_`)

3. **Template Not Working**
   - Check template name is spelled correctly
   - Ensure analysis data is valid
   - Try using 'comprehensive' as fallback

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Add your enhancements
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for AI-powered development workflows**
