/**
 * Ollama Cloud Service
 * Provides AI-powered analysis and generation for Spec-Driven Development
 */

class OllamaService {
  constructor() {
    this.apiKey = '5e196f3a38c14a50812d811b7891fadf.kGRv5b4E1TUEqFi6XAY8g32W'
    this.baseURL = 'https://api.ollama.cloud/v1'
    this.models = [
      'llama3.1:8b',
      'llama3.1:70b',
      'llama3.1:405b',
      'codellama:7b',
      'codellama:13b',
      'codellama:34b',
      'mistral:7b',
      'mistral-nemo:12b',
      'qwen2:7b',
      'qwen2:72b'
    ]
    this.currentModelIndex = 0
  }

  // Get current model with rotation
  getCurrentModel() {
    const model = this.models[this.currentModelIndex]
    this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length
    return model
  }

  // Reset model rotation
  resetModelRotation() {
    this.currentModelIndex = 0
  }

  // Make API request to Ollama Cloud
  async makeRequest(prompt, options = {}) {
    const model = options.model || this.getCurrentModel()
    const maxRetries = 3
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Making request to Ollama Cloud (attempt ${attempt}/${maxRetries})`)
        console.log(`📝 Using model: ${model}`)
        console.log(`📝 Prompt length: ${prompt.length} characters`)

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are an expert software engineer and technical writer with 10+ years of experience. You specialize in creating high-quality software specifications, technical documentation, and implementation plans. Your responses should be:

1. **Comprehensive**: Cover all aspects of the request thoroughly
2. **Practical**: Provide actionable, real-world advice
3. **Structured**: Use clear headings, bullet points, and formatting
4. **Professional**: Use industry-standard terminology and best practices
5. **Detailed**: Include specific examples, code snippets, and explanations

Focus on creating production-ready, maintainable solutions.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Ollama API error: ${response.status} - ${errorData.error || response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ Ollama response received (${data.usage?.total_tokens || 'unknown'} tokens)`)

        return data.choices[0].message.content

      } catch (error) {
        console.error(`❌ Ollama request failed (attempt ${attempt}):`, error.message)
        lastError = error

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying with different model...`)
          // Try with a different model on retry
          this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`)
  }

  // Generate project constitution
  async generateConstitution(projectName, description, requirements = []) {
    const prompt = `# Project Constitution Generation

**Project Name:** ${projectName}
**Description:** ${description}
**Requirements:** ${requirements.join(', ')}

Please create a comprehensive project constitution that will guide the development of this project. The constitution should include:

## 1. Project Vision & Mission
- Clear statement of what the project aims to achieve
- Target audience and use cases
- Success metrics

## 2. Development Principles
- Code quality standards
- Architecture principles
- Testing requirements
- Documentation standards

## 3. Technical Standards
- Language and framework choices
- Coding conventions
- Security requirements
- Performance standards

## 4. Process Guidelines
- Development workflow
- Code review process
- Deployment strategy
- Maintenance procedures

## 5. Quality Gates
- Testing requirements
- Performance benchmarks
- Security checks
- Documentation requirements

Make this constitution specific to the project type and provide actionable guidance for developers.`

    return await this.makeRequest(prompt, { temperature: 0.8, maxTokens: 1500 })
  }

  // Generate project specifications
  async generateSpecifications(constitution, existingSpecs = []) {
    const prompt = `# Project Specifications Generation

**Project Constitution:**
${constitution}

**Existing Specifications:**
${existingSpecs.map(spec => `- ${spec.title}: ${spec.description}`).join('\n')}

Based on the project constitution above, generate comprehensive project specifications. Each specification should:

## Requirements:
1. **Clear Title** - Brief, descriptive name
2. **Detailed Description** - What needs to be built and why
3. **Priority Level** - High/Medium/Low/Critical
4. **Status** - Draft/Review/Approved/Implemented
5. **Category** - Feature/Bug/Enhancement/Technical Debt

## Specification Categories:
- **Core Features** - Essential functionality
- **User Experience** - UI/UX improvements
- **Technical Features** - Backend/API functionality
- **Integration** - Third-party service connections
- **Security** - Authentication, authorization, data protection
- **Performance** - Optimization and scalability
- **Quality** - Testing, documentation, code quality

Generate 5-8 specifications that cover the main aspects of the project. Focus on the "what" and "why" rather than technical implementation details.`

    return await this.makeRequest(prompt, { temperature: 0.7, maxTokens: 2000 })
  }

  // Generate technical implementation plan
  async generateTechnicalPlan(projectName, specifications, preferences = {}) {
    const prompt = `# Technical Implementation Plan Generation

**Project:** ${projectName}
**Specifications:** ${specifications}

**Technical Preferences:**
- AI Assistant: ${preferences.aiAssistant || 'GitHub Copilot'}
- Script Type: ${preferences.scriptType || 'POSIX Shell'}
- Complexity: ${preferences.complexity || 'Medium'}

Generate a comprehensive technical implementation plan that includes:

## 1. Technology Stack Selection
- Frontend technologies (frameworks, libraries)
- Backend technologies (runtime, frameworks)
- Database and storage solutions
- Development tools and utilities

## 2. Architecture Design
- System architecture overview
- Component relationships
- Data flow diagrams (described)
- API design principles

## 3. Development Environment
- Local development setup
- Required tools and dependencies
- Configuration management
- Testing environment

## 4. Implementation Strategy
- Development phases
- Feature prioritization
- Integration approach
- Deployment strategy

## 5. Quality Assurance
- Testing strategy
- Code quality standards
- Performance requirements
- Security considerations

## 6. Project Structure
- Directory organization
- File naming conventions
- Module structure
- Configuration files

Provide specific, actionable technical decisions with justifications. Include code examples where helpful.`

    return await this.makeRequest(prompt, { temperature: 0.6, maxTokens: 2500 })
  }

  // Generate implementation tasks
  async generateTasks(technicalPlan, specifications) {
    const prompt = `# Implementation Tasks Generation

**Technical Plan:**
${technicalPlan}

**Specifications:**
${specifications}

Generate a detailed task breakdown for implementing this project. Each task should include:

## Task Requirements:
1. **Title** - Clear, actionable task name
2. **Description** - What needs to be done
3. **Priority** - High/Medium/Low/Critical
4. **Status** - Pending/In Progress/Review/Completed
5. **Estimated Effort** - Hours or complexity level
6. **Dependencies** - Other tasks this depends on
7. **Deliverables** - What will be produced

## Task Categories:
- **Setup & Configuration** - Environment setup, dependencies
- **Core Implementation** - Main feature development
- **Integration** - Connecting components
- **Testing** - Unit, integration, end-to-end tests
- **Documentation** - Code docs, user guides
- **Quality Assurance** - Code review, security checks

## Implementation Order:
1. Foundation tasks first
2. Core functionality
3. Advanced features
4. Integration and testing
5. Documentation and polish

Generate 10-15 tasks that cover the complete implementation. Include specific technical details and acceptance criteria.`

    return await this.makeRequest(prompt, { temperature: 0.7, maxTokens: 3000 })
  }

  // Generate implementation code
  async generateImplementation(projectData) {
    const prompt = `# Implementation Code Generation

**Project:** ${projectData.projectName}
**Constitution:** ${projectData.constitution}
**Technical Plan:** ${projectData.technicalPlan}
**Tasks:** ${projectData.tasks.map(t => t.title).join(', ')}

Generate the actual implementation code for this project. Provide:

## 1. Project Structure
- Directory tree with file descriptions
- Key files and their purposes

## 2. Core Implementation Files
- Main application files
- Configuration files
- Utility functions
- Component definitions

## 3. Implementation Details
- Code examples with explanations
- API endpoints and handlers
- Database schemas (if applicable)
- Configuration settings

## 4. Setup Instructions
- Installation commands
- Environment configuration
- Build and run instructions

## 5. Integration Points
- How components connect
- External service integrations
- Configuration management

Focus on creating a complete, working implementation that follows the technical plan and fulfills the specifications. Include error handling, logging, and best practices.`

    return await this.makeRequest(prompt, { temperature: 0.5, maxTokens: 4000 })
  }

  // Analyze existing code
  async analyzeCode(code, context = '') {
    const prompt = `# Code Analysis

**Context:** ${context}

**Code to Analyze:**
\`\`\`
${code}
\`\`\`

Please provide a comprehensive code analysis including:

## 1. Code Quality Assessment
- Overall structure and organization
- Code style and conventions
- Complexity analysis
- Maintainability score

## 2. Functionality Review
- What the code does
- Potential bugs or issues
- Performance considerations
- Security vulnerabilities

## 3. Improvement Suggestions
- Refactoring opportunities
- Best practice recommendations
- Optimization suggestions
- Testing recommendations

## 4. Documentation
- Code documentation needs
- Comments and explanations
- API documentation requirements

Provide specific examples and actionable feedback. Rate the code quality on a scale of 1-10.`

    return await this.makeRequest(prompt, { temperature: 0.6, maxTokens: 2000 })
  }

  // Generate context summary
  async generateContextSummary(projectData) {
    const prompt = `# Context Summary Generation

**Project Data:**
- Name: ${projectData.projectName}
- Constitution: ${projectData.constitution}
- Specifications: ${projectData.specifications.length} specs
- Technical Plan: ${projectData.technicalPlan}
- Tasks: ${projectData.tasks.length} tasks

Generate a comprehensive context summary that can be used by AI assistants to understand this project. Include:

## 1. Project Overview
- Purpose and goals
- Target audience
- Key features

## 2. Technical Context
- Technology stack
- Architecture decisions
- Development standards

## 3. Implementation Status
- Completed work
- In-progress tasks
- Remaining work

## 4. Development Guidelines
- Coding standards
- Quality requirements
- Process guidelines

## 5. Success Criteria
- Definition of done
- Quality metrics
- Performance requirements

This summary should provide AI assistants with all the context they need to contribute effectively to this project.`

    return await this.makeRequest(prompt, { temperature: 0.7, maxTokens: 1500 })
  }
}

// Export singleton instance
export default new OllamaService()
