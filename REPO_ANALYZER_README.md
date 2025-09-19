# Repository Context Generator

A powerful tool that automatically generates comprehensive context files for GitHub repositories, enabling AI coding assistants to understand your project structure, patterns, and requirements instantly.

## Features

### 🔍 Repository Analysis
- **Deep Code Analysis**: Analyzes repository structure, languages, frameworks, and dependencies
- **Architecture Detection**: Identifies project patterns, component structures, and organization
- **Quality Assessment**: Evaluates code quality, testing coverage, and development practices
- **Contributor Analysis**: Tracks project contributors and activity metrics

### 📝 Context Generation
- **Multiple Templates**: Choose from Comprehensive, Minimal, Technical, or Overview templates
- **AI-Ready Format**: Generates Markdown files optimized for AI assistants
- **Customizable Output**: Tailored context based on repository characteristics
- **Instant Download**: One-click download of generated context files

### 🔧 Developer Tools
- **GitHub Integration**: Seamless authentication with GitHub API
- **MCP Server Support**: Compatible with Cursor, Windsurf, and other MCP-enabled IDEs
- **Real-time Analysis**: Live repository analysis with progress indicators
- **Template System**: Pre-built templates for different analysis needs

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Using the Repository Analyzer

#### Web Interface
1. Open the application in your browser
2. Click on the "📊 Repo Analysis" tab
3. Enter your GitHub Personal Access Token
4. Click "Load Repositories" to fetch your GitHub repos
5. Select a repository to analyze
6. Choose a template (Comprehensive, Minimal, Technical, Overview)
7. Click "Generate Context File" to create the analysis
8. Download the generated Markdown file

#### MCP Integration (for IDEs)

Add this to your Cursor/Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "repo-analyzer": {
      "command": "node",
      "args": ["./src/lib/mcpServer.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

## GitHub Authentication

### Creating a Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
4. Copy the generated token
5. Paste it into the application

## Available Templates

### 📋 Comprehensive
Complete repository analysis including:
- Project overview and statistics
- Technical details and dependencies
- Architecture analysis
- Development setup instructions
- Code quality assessment
- AI assistant guidelines

### 🎯 Minimal
Basic repository information:
- Project name and description
- Primary programming language
- Repository statistics
- Key files and structure

### ⚙️ Technical
Technical focus:
- Programming languages and frameworks
- Dependencies and requirements
- File structure and organization
- Development environment setup

### 📊 Overview
High-level summary:
- Key project facts
- Technology stack
- Activity metrics
- Quick recommendations

## MCP Tools

When integrated with MCP-enabled IDEs, the following tools are available:

### `list_templates`
Lists all available analysis templates.

**Usage:**
```
list_templates
```

### `get_template`
Retrieves details of a specific template.

**Usage:**
```
get_template "comprehensive"
```

### `analyze_repository`
Analyzes a GitHub repository and returns structured data.

**Usage:**
```
analyze_repository "owner/repository"
```

### `execute_template`
Executes a template on a repository and returns the generated context.

**Usage:**
```
execute_template "comprehensive" "owner/repository"
```

## Example Usage

### Analyzing a React Project

1. **Input Repository**: `facebook/react`
2. **Selected Template**: Comprehensive
3. **Generated Context** includes:
   - Project statistics (stars, forks, contributors)
   - Technology stack (JavaScript, TypeScript, HTML)
   - Architecture patterns (Component-based, Hooks)
   - Development setup (npm scripts, testing framework)
   - Code quality metrics
   - AI assistant guidelines for React development

### Sample Output Structure

```markdown
# Repository Context

Generated: 2025-01-19T09:04:32.000Z

## Project Overview

**Name:** my-awesome-project
**Description:** A fantastic web application
**Language:** JavaScript
**Stars:** 42
**Forks:** 7

## Technical Details

**Framework:** React
**Architecture:** Component-based
**Complexity:** Medium

## Languages:
- JavaScript: 85%
- CSS: 10%
- HTML: 5%

## Development Setup

**Installation:** npm install
**Development:** npm run dev
**Build:** npm run build
**Test:** npm run test

## Recommendations

- Add comprehensive test coverage
- Consider adding TypeScript for better type safety
- Improve documentation with API docs
```

## Architecture

### Core Components

- **GitHub Service** (`src/lib/github.js`): Handles GitHub API interactions
- **Context Generator** (`src/lib/contextGenerator.js`): Creates formatted context files
- **MCP Server** (`src/lib/mcpServer.js`): Provides IDE integration
- **UI Components** (`src/App.jsx`): Web interface for repository analysis

### Data Flow

1. **Authentication**: GitHub token validation
2. **Repository Selection**: User selects repository to analyze
3. **Data Collection**: GitHub API calls for repository data
4. **Analysis**: Code structure, dependencies, and patterns analysis
5. **Context Generation**: Template-based Markdown generation
6. **Output**: Downloadable context file for AI assistants

## API Reference

### GitHubService Class

```javascript
const githubService = new GitHubService(token)

// Get user repositories
const repos = await githubService.getUserRepos()

// Analyze specific repository
const analysis = await githubService.analyzeRepository('owner', 'repo')
```

### ContextGenerator Class

```javascript
const generator = new ContextGenerator()

// Generate context with specific template
const context = generator.generateContext(analysisData, 'comprehensive')
```

### MCPServer Class

```javascript
const mcpServer = new MCPServer()

// Initialize server
await mcpServer.initialize()

// List available templates
const templates = await mcpServer.listTemplates()

// Execute template on repository
const result = await mcpServer.executeTemplate('comprehensive', 'owner/repo')
```

## Troubleshooting

### Common Issues

**"Failed to load repositories"**
- Check your GitHub token is valid
- Ensure token has `repo` scope
- Verify network connectivity

**"Repository not found"**
- Check repository URL format
- Ensure repository is accessible with your token
- Verify repository exists and is not private (if token lacks permissions)

**"Analysis failed"**
- Check repository size (very large repos may timeout)
- Ensure stable internet connection
- Try analyzing a smaller repository first

### Token Issues

If you're having authentication problems:

1. Regenerate your GitHub token
2. Ensure all required scopes are selected
3. Check token hasn't expired
4. Try with a public repository first

## Contributing

This tool is designed to be extensible. To add new templates:

1. Add template definition to `ContextGenerator.templates`
2. Implement the generation method
3. Update the template selection UI
4. Test with various repository types

## License

This project is part of your personal development toolkit. Feel free to modify and extend it according to your needs.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review GitHub API documentation
- Test with different repository types
- Ensure your GitHub token has appropriate permissions
