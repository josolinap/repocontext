# 📊 Repository Context Generator

Generate comprehensive context files for GitHub repositories to help AI coding assistants understand your project structure, patterns, and requirements instantly.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF.svg)](https://vitejs.dev/)
[![GitHub API](https://img.shields.io/badge/GitHub_API-v3-181717.svg)](https://docs.github.com/en/rest)

## 🚀 Features

### 🔍 Repository Analysis
- **Deep Code Analysis**: Analyzes repository structure, languages, frameworks, and dependencies
- **Architecture Detection**: Identifies project patterns, component structures, and organization
- **Quality Assessment**: Evaluates code quality, testing coverage, and development practices
- **Contributor Analysis**: Tracks project contributors and activity metrics

### 📊 Advanced Git Integration ⭐
- **Commit History Analysis**: Track development patterns and velocity
- **Branch Management**: Compare branches, analyze merge patterns
- **Code Churn Metrics**: Measure development activity and stability
- **Contributor Statistics**: Detailed contribution analysis and patterns
- **Repository Health**: Overall repository health and maintenance metrics
- **Development Velocity**: Monitor project development speed and trends

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

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI) v6 + Emotion
- **API Integration**: GitHub REST API v3 + Enhanced Git Analysis
- **State Management**: TanStack Query
- **Design System**: Custom Neumorphism + Glassmorphism Theme
- **Routing**: React Router
- **Notifications**: React Hot Toast
- **MCP Integration**: Custom MCP server for IDE connectivity
- **Icons**: Material-UI Icons

## ⚙️ Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/josolinap/repository-context-generator.git
cd repository-context-generator
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

## 🔐 GitHub Authentication

### Create Personal Access Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (for private repos) and `read:org`
4. Copy the token and paste it in the application

## 📋 Available Templates

### 📋 **Comprehensive**
Complete repository analysis including project overview, technical details, architecture analysis, development setup, code quality assessment, and AI assistant guidelines.

### 🎯 **Minimal**
Basic repository information: name, description, primary language, repository statistics, and key files.

### ⚙️ **Technical**
Technical focus: programming languages, frameworks, dependencies, file structure, and development environment setup.

### 📊 **Overview**
High-level summary: key project facts, technology stack, activity metrics, and quick recommendations.

## 🔧 MCP Integration

### For Cursor/Windsurf IDEs
Add this to your MCP configuration:

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

### Available MCP Tools
- `list_templates` - List all available analysis templates
- `get_template` - Get details of a specific template
- `analyze_repository` - Analyze a GitHub repository
- `execute_template` - Execute a template on a repository

## 📖 Usage

### Web Interface
1. **Enter GitHub Token**: Paste your Personal Access Token
2. **Load Repositories**: Click to fetch your GitHub repositories
3. **Select Repository**: Choose a repository to analyze
4. **Choose Template**: Pick Comprehensive, Minimal, Technical, or Overview
5. **Generate Context**: Click to create the analysis
6. **Download**: Get your AI-ready context file

### Example Output
```markdown
# Repository Context

Generated: 2025-01-19T09:27:13.000Z

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

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard with stats
│   └── RepositoryAnalyzer.jsx # Core analysis interface
├── lib/
│   ├── github.js             # GitHub API integration
│   ├── contextGenerator.js   # Context file generation
│   └── mcpServer.js          # MCP server for IDE integration
├── App.jsx                   # Main application component
└── main.jsx                  # Application entry point
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Key Components

- **GitHubService**: Handles all GitHub API interactions
- **ContextGenerator**: Creates formatted Markdown files with multiple templates
- **MCPServer**: Provides IDE integration through Model Context Protocol
- **RepositoryAnalyzer**: Main analysis interface with real-time feedback
- **Dashboard**: Statistics and job management interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Detailer](https://detailer.ginylil.com/) - AI-powered code analysis tool
- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Powered by [GitHub REST API](https://docs.github.com/en/rest)
- MCP integration for modern IDEs

---

**Made with ❤️ for developers who want AI assistants to understand their code better**
