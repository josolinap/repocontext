class ContextGenerator {
  constructor() {
    this.templates = {
      'comprehensive': this.generateComprehensiveContext.bind(this),
      'minimal': this.generateMinimalContext.bind(this),
      'technical': this.generateTechnicalContext.bind(this),
      'overview': this.generateOverviewContext.bind(this),
      'rules': this.generateRulesContext.bind(this),
      'workflows': this.generateWorkflowsContext.bind(this),
      'shortcuts': this.generateShortcutsContext.bind(this),
      'scaffold': this.generateScaffoldContext.bind(this)
    };
    this.customTemplates = new Map();
  }

  generateContext(analysisData, template = 'comprehensive') {
    // Check if it's a custom template first
    if (this.customTemplates.has(template)) {
      return this.generateCustomContext(analysisData, this.customTemplates.get(template));
    }

    // Fall back to built-in templates
    const generator = this.templates[template] || this.templates.comprehensive;
    return generator(analysisData);
  }

  generateCustomContext(analysisData, templateConfig) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'custom',
        custom_template_name: templateConfig.name,
        repository: `${analysisData.basic.name}`
      }
    };

    // Generate content for each section defined in the custom template
    templateConfig.sections.forEach(section => {
      if (section && section.trim()) {
        const sectionKey = section.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        context[sectionKey] = this.generateCustomSection(analysisData, section);
      }
    });

    return this.formatCustomAsMarkdown(context, templateConfig);
  }

  generateCustomSection(analysisData, sectionName) {
    // Map common section names to appropriate data generation methods
    const sectionMappings = {
      'overview': () => this.generateProjectOverview(analysisData),
      'technical details': () => this.generateTechnicalDetails(analysisData),
      'architecture': () => this.generateArchitectureAnalysis(analysisData),
      'development setup': () => this.generateDevelopmentSetup(analysisData),
      'code quality': () => this.generateCodeQuality(analysisData),
      'recommendations': () => this.generateRecommendations(analysisData),
      'coding rules': () => this.generateCodingRules(analysisData),
      'best practices': () => this.generateBestPractices(analysisData),
      'development workflow': () => this.generateDevWorkflow(analysisData),
      'productivity shortcuts': () => this.generateProductivityShortcuts(analysisData),
      'project scaffolds': () => this.generateProjectScaffolds(analysisData),
      'languages': () => ({
        languages: Object.entries(analysisData.languages || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([lang, bytes]) => ({
            language: lang,
            percentage: Math.round((bytes / Object.values(analysisData.languages).reduce((a, b) => a + b, 0)) * 100)
          }))
      }),
      'dependencies': () => this.extractDependencies(analysisData),
      'structure': () => this.detailedFileStructure(analysisData),
      'contributors': () => ({
        contributors: analysisData.contributors?.slice(0, 10) || [],
        total_count: analysisData.contributors?.length || 0
      }),
      'statistics': () => ({
        stars: analysisData.basic.stars,
        forks: analysisData.basic.forks,
        issues: analysisData.basic.issues,
        size_kb: Math.round(analysisData.basic.size / 1024),
        created: new Date(analysisData.basic.created).toLocaleDateString(),
        updated: new Date(analysisData.basic.updated).toLocaleDateString()
      })
    };

    // Try to find a matching section generator
    const normalizedSection = sectionName.toLowerCase().trim();
    for (const [key, generator] of Object.entries(sectionMappings)) {
      if (normalizedSection.includes(key) || key.includes(normalizedSection)) {
        return generator();
      }
    }

    // Default fallback for unrecognized sections
    return {
      section_name: sectionName,
      content: `Custom section: ${sectionName}`,
      note: 'This section was generated from a custom template. You may need to customize the content generation logic for this specific section.'
    };
  }

  formatCustomAsMarkdown(context, templateConfig) {
    let markdown = `# ${templateConfig.name}\n\n`;
    markdown += `*${templateConfig.description}*\n\n`;
    markdown += `**Generated:** ${context.metadata.generated_at}\n`;
    markdown += `**Repository:** ${context.metadata.repository}\n`;
    markdown += `**Template:** ${templateConfig.icon} ${templateConfig.name}\n\n`;
    markdown += `---\n\n`;

    // Add each section
    templateConfig.sections.forEach(section => {
      if (section && section.trim()) {
        const sectionKey = section.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const sectionData = context[sectionKey];

        if (sectionData) {
          markdown += `## ${section}\n\n`;
          markdown += this.formatSectionData(sectionData);
          markdown += '\n\n';
        }
      }
    });

    return markdown;
  }

  formatSectionData(data) {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item =>
        typeof item === 'string' ? `- ${item}` : `- ${JSON.stringify(item)}`
      ).join('\n');
    }

    if (typeof data === 'object' && data !== null) {
      let result = '';

      // Handle specific data structures
      if (data.name && data.description) {
        result += `**${data.name}**\n${data.description}\n\n`;
      }

      if (data.languages) {
        result += '**Programming Languages:**\n';
        data.languages.forEach(lang => {
          result += `- ${lang.language}: ${lang.percentage}%\n`;
        });
        result += '\n';
      }

      if (data.dependencies || data.devDependencies) {
        if (data.dependencies?.length > 0) {
          result += '**Dependencies:**\n';
          data.dependencies.forEach(dep => {
            result += `- ${dep}\n`;
          });
          result += '\n';
        }

        if (data.devDependencies?.length > 0) {
          result += '**Dev Dependencies:**\n';
          data.devDependencies.forEach(dep => {
            result += `- ${dep}\n`;
          });
          result += '\n';
        }
      }

      if (data.contributors) {
        result += '**Top Contributors:**\n';
        data.contributors.slice(0, 5).forEach(contributor => {
          result += `- ${contributor.login || contributor.name || 'Unknown'}\n`;
        });
        result += '\n';
      }

      if (data.stars !== undefined) {
        result += '**Repository Statistics:**\n';
        result += `- ⭐ Stars: ${data.stars}\n`;
        result += `- 🍴 Forks: ${data.forks}\n`;
        result += `- 🐛 Open Issues: ${data.issues}\n`;
        result += `- 📦 Size: ${data.size_kb} KB\n`;
        result += `- 📅 Created: ${data.created}\n`;
        result += `- 🔄 Last Updated: ${data.updated}\n\n`;
      }

      // Handle generic object properties
      const remainingKeys = Object.keys(data).filter(key =>
        !['name', 'description', 'languages', 'dependencies', 'devDependencies', 'contributors', 'stars', 'forks', 'issues', 'size_kb', 'created', 'updated'].includes(key)
      );

      if (remainingKeys.length > 0) {
        remainingKeys.forEach(key => {
          const value = data[key];
          if (Array.isArray(value)) {
            result += `**${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:**\n`;
            value.forEach(item => {
              result += `- ${typeof item === 'string' ? item : JSON.stringify(item)}\n`;
            });
            result += '\n';
          } else if (typeof value === 'object' && value !== null) {
            result += `**${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:**\n`;
            result += `${JSON.stringify(value, null, 2)}\n\n`;
          } else {
            result += `**${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:** ${value}\n\n`;
          }
        });
      }

      return result || JSON.stringify(data, null, 2);
    }

    return String(data);
  }

  addCustomTemplate(templateId, templateConfig) {
    this.customTemplates.set(templateId, templateConfig);
  }

  removeCustomTemplate(templateId) {
    this.customTemplates.delete(templateId);
  }

  getCustomTemplates() {
    return Array.from(this.customTemplates.entries()).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  generateComprehensiveContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'comprehensive',
        repository: `${data.basic.name}`
      },
      project_overview: this.generateProjectOverview(data),
      technical_details: this.generateTechnicalDetails(data),
      architecture_analysis: this.generateArchitectureAnalysis(data),
      development_setup: this.generateDevelopmentSetup(data),
      code_quality: this.generateCodeQuality(data),
      recommendations: this.generateRecommendations(data),
      ai_assistant_guidelines: this.generateAIGuidelines(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateMinimalContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'minimal'
      },
      project: {
        name: data.basic.name,
        description: data.basic.description,
        language: data.basic.language,
        framework: data.analysis.framework
      },
      structure: this.summarizeStructure(data.structure),
      key_files: this.identifyKeyFiles(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateTechnicalContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'technical'
      },
      technical_specs: {
        language: data.basic.language,
        framework: data.analysis.framework,
        architecture: data.analysis.architecture,
        complexity: data.analysis.complexity
      },
      dependencies: this.extractDependencies(data),
      file_structure: this.detailedFileStructure(data),
      development_requirements: this.extractDevRequirements(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateOverviewContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'overview'
      },
      summary: {
        name: data.basic.name,
        description: data.basic.description,
        stars: data.basic.stars,
        language: data.basic.language,
        last_updated: data.basic.updated
      },
      quick_facts: this.generateQuickFacts(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateProjectOverview(data) {
    const overview = {
      name: data.basic.name,
      description: data.basic.description || 'No description provided',
      primary_language: data.basic.language,
      repository_stats: {
        stars: data.basic.stars,
        forks: data.basic.forks,
        open_issues: data.basic.issues,
        size_kb: Math.round(data.basic.size / 1024)
      },
      created: new Date(data.basic.created).toLocaleDateString(),
      last_updated: new Date(data.basic.updated).toLocaleDateString(),
      contributors: data.contributors?.length || 0
    };

    // Add Git-specific data if available
    if (data.gitAnalysis) {
      overview.git_insights = {
        total_commits: data.gitAnalysis.total_commits || 0,
        active_branches: data.gitAnalysis.active_branches || 0,
        development_velocity: data.gitAnalysis.development_velocity || 0,
        top_contributors: data.gitAnalysis.top_contributors?.slice(0, 3) || []
      };
    }

    return overview;
  }

  generateTechnicalDetails(data) {
    const languages = Object.entries(data.languages || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      programming_languages: languages.map(([lang, bytes]) => ({
        language: lang,
        percentage: Math.round((bytes / Object.values(data.languages).reduce((a, b) => a + b, 0)) * 100)
      })),
      framework: data.analysis.framework,
      architecture_pattern: data.analysis.architecture,
      complexity_level: data.analysis.complexity
    };
  }

  generateArchitectureAnalysis(data) {
    const structure = data.structure;
    if (!structure) return { structure: 'Unable to analyze structure' };

    const analysis = {
      root_structure: this.analyzeRootStructure(structure),
      key_directories: this.identifyKeyDirectories(structure),
      file_organization: this.analyzeFileOrganization(structure),
      patterns_identified: this.identifyPatterns(data)
    };

    return analysis;
  }

  generateDevelopmentSetup(data) {
    const setup = {
      prerequisites: [],
      installation_steps: [],
      development_scripts: []
    };

    if (data.packageJson) {
      // Extract Node.js version if specified
      if (data.packageJson.engines?.node) {
        setup.prerequisites.push(`Node.js ${data.packageJson.engines.node}`);
      }

      // Extract installation steps
      if (data.packageJson.scripts?.install) {
        setup.installation_steps.push('Run custom install script');
      } else {
        setup.installation_steps.push('npm install');
      }

      // Extract development scripts
      const devScripts = Object.entries(data.packageJson.scripts || {})
        .filter(([key]) => ['dev', 'start', 'build', 'test'].includes(key))
        .map(([key, value]) => ({ command: key, script: value }));

      setup.development_scripts = devScripts;
    }

    return setup;
  }

  generateCodeQuality(data) {
    const quality = {
      has_tests: this.checkForTests(data),
      has_linting: this.checkForLinting(data),
      has_documentation: this.checkForDocumentation(data),
      has_ci_cd: this.checkForCI(data),
      code_quality_score: this.calculateQualityScore(data)
    };

    return quality;
  }

  generateRecommendations(data) {
    const recommendations = [...(data.analysis.recommendations || [])];

    // Additional recommendations based on analysis
    if (!this.checkForTests(data)) {
      recommendations.push('Add comprehensive test coverage');
    }

    if (!this.checkForDocumentation(data)) {
      recommendations.push('Improve documentation with API docs and code comments');
    }

    if (data.basic.open_issues_count > 20) {
      recommendations.push('Address open issues and improve issue management');
    }

    if (!data.basic.description) {
      recommendations.push('Add a clear project description');
    }

    return recommendations;
  }

  generateAIGuidelines(data) {
    return {
      coding_standards: this.inferCodingStandards(data),
      project_patterns: this.identifyProjectPatterns(data),
      development_workflow: this.suggestDevelopmentWorkflow(data),
      contribution_guidelines: this.extractContributionGuidelines(data)
    };
  }

  // Helper methods
  analyzeRootStructure(structure) {
    if (!structure?.children) return 'Unknown';

    const dirs = structure.children.filter(child => child.type === 'directory');
    const files = structure.children.filter(child => child.type === 'file');

    return {
      directories: dirs.length,
      files: files.length,
      key_directories: dirs.map(d => d.name),
      config_files: files.filter(f => this.isConfigFile(f.name)).map(f => f.name)
    };
  }

  identifyKeyDirectories(structure) {
    if (!structure?.children) return [];

    const keyDirs = ['src', 'lib', 'components', 'pages', 'utils', 'hooks', 'types', 'tests'];
    return structure.children
      .filter(child => child.type === 'directory' && keyDirs.includes(child.name))
      .map(child => ({
        name: child.name,
        purpose: this.getDirectoryPurpose(child.name)
      }));
  }

  analyzeFileOrganization(structure) {
    // Analyze how files are organized
    const analysis = {
      has_clear_structure: false,
      follows_conventions: false,
      organization_score: 0
    };

    if (structure?.children) {
      const hasSrc = structure.children.some(child => child.name === 'src');
      const hasTests = structure.children.some(child => child.name === 'tests' || child.name === '__tests__');
      const hasDocs = structure.children.some(child => child.name === 'docs' || child.name === 'README.md');

      analysis.has_clear_structure = hasSrc;
      analysis.follows_conventions = hasSrc && hasTests;
      analysis.organization_score = [hasSrc, hasTests, hasDocs].filter(Boolean).length;
    }

    return analysis;
  }

  identifyPatterns(data) {
    const patterns = [];

    if (data.analysis.framework === 'React') {
      patterns.push('React component patterns');
      patterns.push('JSX/TSX file structure');
    }

    if (data.structure?.children) {
      const hasComponents = data.structure.children.some(child =>
        child.type === 'directory' && child.name === 'components'
      );
      if (hasComponents) {
        patterns.push('Component-based architecture');
      }
    }

    return patterns;
  }

  checkForTests(data) {
    if (data.packageJson?.scripts?.test) return true;
    if (data.structure?.children) {
      return data.structure.children.some(child =>
        child.type === 'directory' && (child.name === 'tests' || child.name === '__tests__')
      );
    }
    return false;
  }

  checkForLinting(data) {
    if (!data.packageJson) return false;
    const deps = { ...data.packageJson.dependencies, ...data.packageJson.devDependencies };
    return Object.keys(deps).some(dep =>
      dep.includes('eslint') || dep.includes('prettier') || dep.includes('lint')
    );
  }

  checkForDocumentation(data) {
    return !!(data.readme || data.structure?.children?.some(child =>
      child.type === 'directory' && child.name === 'docs'
    ));
  }

  checkForCI(data) {
    if (!data.structure?.children) return false;
    return data.structure.children.some(child =>
      child.type === 'file' && (
        child.name === '.github' ||
        child.name.includes('ci') ||
        child.name.includes('workflow')
      )
    );
  }

  calculateQualityScore(data) {
    let score = 50; // Base score

    if (this.checkForTests(data)) score += 15;
    if (this.checkForLinting(data)) score += 10;
    if (this.checkForDocumentation(data)) score += 10;
    if (this.checkForCI(data)) score += 10;
    if (data.basic.description) score += 5;

    return Math.min(score, 100);
  }

  isConfigFile(filename) {
    const configFiles = ['package.json', '.gitignore', 'tsconfig.json', 'webpack.config.js', '.eslintrc', 'babel.config.js'];
    return configFiles.includes(filename) || filename.startsWith('.');
  }

  getDirectoryPurpose(name) {
    const purposes = {
      'src': 'Main source code',
      'lib': 'Library files and utilities',
      'components': 'Reusable UI components',
      'pages': 'Page components/routes',
      'utils': 'Utility functions',
      'hooks': 'Custom React hooks',
      'types': 'TypeScript type definitions',
      'tests': 'Test files'
    };
    return purposes[name] || 'Project files';
  }

  summarizeStructure(structure) {
    if (!structure) return 'No structure available';

    const dirs = structure.children?.filter(child => child.type === 'directory') || [];
    const files = structure.children?.filter(child => child.type === 'file') || [];

    return `${dirs.length} directories, ${files.length} files in root`;
  }

  identifyKeyFiles(data) {
    const keyFiles = [];

    if (data.packageJson) keyFiles.push('package.json');
    if (data.readme) keyFiles.push('README.md');

    if (data.structure?.children) {
      const importantFiles = data.structure.children
        .filter(child => child.type === 'file')
        .filter(child => this.isImportantFile(child.name))
        .map(child => child.name);

      keyFiles.push(...importantFiles);
    }

    return keyFiles;
  }

  isImportantFile(filename) {
    const importantFiles = ['package.json', 'tsconfig.json', '.eslintrc.js', 'webpack.config.js', 'babel.config.js', 'Dockerfile'];
    return importantFiles.includes(filename) || filename.toLowerCase().includes('readme');
  }

  extractDependencies(data) {
    if (!data.packageJson) return { dependencies: [], devDependencies: [] };

    return {
      dependencies: Object.keys(data.packageJson.dependencies || {}),
      devDependencies: Object.keys(data.packageJson.devDependencies || {})
    };
  }

  detailedFileStructure(data) {
    return this.traverseStructure(data.structure);
  }

  traverseStructure(node, depth = 0) {
    if (!node || depth > 3) return '';

    let structure = '';
    const indent = '  '.repeat(depth);

    if (node.type === 'directory') {
      structure += `${indent}📁 ${node.name}/\n`;
      node.children?.forEach(child => {
        structure += this.traverseStructure(child, depth + 1);
      });
    } else {
      structure += `${indent}📄 ${node.name}\n`;
    }

    return structure;
  }

  extractDevRequirements(data) {
    const requirements = [];

    if (data.packageJson?.engines) {
      Object.entries(data.packageJson.engines).forEach(([engine, version]) => {
        requirements.push(`${engine} ${version}`);
      });
    }

    return requirements;
  }

  generateQuickFacts(data) {
    return [
      `Primary language: ${data.basic.language || 'Not specified'}`,
      `Framework: ${data.analysis.framework}`,
      `Architecture: ${data.analysis.architecture}`,
      `Complexity: ${data.analysis.complexity}`,
      `Contributors: ${data.contributors?.length || 0}`,
      `Open issues: ${data.basic.issues}`
    ];
  }

  inferCodingStandards(data) {
    const standards = [];

    if (data.analysis.framework === 'React') {
      standards.push('Use functional components with hooks');
      standards.push('Follow React naming conventions');
    }

    if (data.basic.language === 'TypeScript') {
      standards.push('Use TypeScript for type safety');
      standards.push('Define interfaces for complex objects');
    }

    return standards;
  }

  identifyProjectPatterns(data) {
    const patterns = [];

    if (data.structure?.children) {
      const hasComponents = data.structure.children.some(child =>
        child.name === 'components'
      );
      if (hasComponents) {
        patterns.push('Component-based architecture');
      }
    }

    return patterns;
  }

  suggestDevelopmentWorkflow(data) {
    const workflow = [];

    if (data.packageJson?.scripts?.dev) {
      workflow.push('Use npm run dev for development');
    }

    if (data.packageJson?.scripts?.build) {
      workflow.push('Use npm run build for production builds');
    }

    if (this.checkForTests(data)) {
      workflow.push('Run tests before committing');
    }

    return workflow;
  }

  extractContributionGuidelines(data) {
    // This would typically parse CONTRIBUTING.md or similar files
    return [
      'Follow the existing code style',
      'Add tests for new features',
      'Update documentation as needed',
      'Use descriptive commit messages'
    ];
  }

  // New template methods based on Detailer analysis
  generateRulesContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'rules',
        repository: `${data.basic.name}`
      },
      coding_rules: this.generateCodingRules(data),
      best_practices: this.generateBestPractices(data),
      code_standards: this.generateCodeStandards(data),
      framework_specific_rules: this.generateFrameworkRules(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateWorkflowsContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'workflows',
        repository: `${data.basic.name}`
      },
      development_workflow: this.generateDevWorkflow(data),
      pr_process: this.generatePRProcess(data),
      release_process: this.generateReleaseProcess(data),
      collaboration_guidelines: this.generateCollaborationGuidelines(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateShortcutsContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'shortcuts',
        repository: `${data.basic.name}`
      },
      productivity_shortcuts: this.generateProductivityShortcuts(data),
      development_commands: this.generateDevCommands(data),
      testing_shortcuts: this.generateTestingShortcuts(data),
      deployment_automation: this.generateDeploymentAutomation(data)
    };

    return this.formatAsMarkdown(context);
  }

  generateScaffoldContext(data) {
    const context = {
      metadata: {
        generated_at: new Date().toISOString(),
        generator: 'Repository Context Generator',
        template: 'scaffold',
        repository: `${data.basic.name}`
      },
      project_scaffolds: this.generateProjectScaffolds(data),
      component_templates: this.generateComponentTemplates(data),
      configuration_templates: this.generateConfigTemplates(data),
      boilerplate_code: this.generateBoilerplateCode(data)
    };

    return this.formatAsMarkdown(context);
  }

  // Helper methods for new templates
  generateCodingRules(data) {
    const rules = [];

    if (data.analysis.framework === 'React') {
      rules.push('Use functional components with hooks over class components');
      rules.push('Implement proper error boundaries for component trees');
      rules.push('Use React.memo for expensive components when necessary');
      rules.push('Follow consistent naming conventions for components and files');
      rules.push('Implement proper TypeScript interfaces for props and state');
    }

    if (data.analysis.framework === 'Next.js') {
      rules.push('Use App Router for new applications');
      rules.push('Implement proper metadata for SEO optimization');
      rules.push('Use Server Components when possible for better performance');
      rules.push('Implement proper loading and error states');
    }

    if (data.basic.language === 'TypeScript') {
      rules.push('Use strict TypeScript configuration');
      rules.push('Avoid using any type - use unknown or proper types');
      rules.push('Implement proper interface definitions for complex objects');
      rules.push('Use utility types (Partial, Pick, Omit) when appropriate');
    }

    return rules;
  }

  generateBestPractices(data) {
    const practices = [];

    practices.push('Write descriptive commit messages following conventional commits');
    practices.push('Use meaningful variable and function names');
    practices.push('Add JSDoc comments for complex functions');
    practices.push('Implement proper error handling and logging');

    if (this.checkForTests(data)) {
      practices.push('Write unit tests for all business logic functions');
      practices.push('Maintain test coverage above 80%');
      practices.push('Use descriptive test case names');
    }

    if (this.checkForLinting(data)) {
      practices.push('Run linter before committing code');
      practices.push('Fix all linting errors and warnings');
      practices.push('Configure consistent code formatting');
    }

    return practices;
  }

  generateCodeStandards(data) {
    const standards = {
      file_naming: this.generateFileNamingStandards(data),
      code_formatting: this.generateCodeFormattingStandards(data),
      documentation: this.generateDocumentationStandards(data),
      testing: this.generateTestingStandards(data)
    };

    return standards;
  }

  generateFrameworkRules(data) {
    const rules = [];

    if (data.analysis.framework === 'React') {
      rules.push('Use custom hooks for reusable logic');
      rules.push('Implement proper component composition');
      rules.push('Use Context API for global state management');
      rules.push('Follow atomic design principles for components');
    }

    return rules;
  }

  generateDevWorkflow(data) {
    const workflow = [];

    if (data.packageJson?.scripts) {
      workflow.push('Use npm run dev for local development');
      workflow.push('Run tests before pushing to main branch');
      workflow.push('Use feature branches for new development');
      workflow.push('Implement code review process for all PRs');
    }

    return workflow;
  }

  generatePRProcess(data) {
    return [
      'Create descriptive PR titles and descriptions',
      'Reference related issues in PR descriptions',
      'Ensure all tests pass before requesting review',
      'Request review from appropriate team members',
      'Address all review comments promptly',
      'Squash commits before merging'
    ];
  }

  generateReleaseProcess(data) {
    return [
      'Use semantic versioning for releases',
      'Update CHANGELOG.md with release notes',
      'Tag releases with proper version numbers',
      'Create GitHub releases with detailed descriptions',
      'Deploy to staging environment first',
      'Monitor application after production deployment'
    ];
  }

  generateCollaborationGuidelines(data) {
    return [
      'Communicate clearly and frequently with team members',
      'Document important decisions and architectural changes',
      'Share knowledge through code comments and documentation',
      'Be open to feedback and different perspectives',
      'Help other team members when possible',
      'Maintain a positive and inclusive team environment'
    ];
  }

  generateProductivityShortcuts(data) {
    const shortcuts = [];

    if (data.packageJson?.scripts) {
      shortcuts.push('Use npm run dev for quick development server start');
      shortcuts.push('Use npm run build for production builds');
      shortcuts.push('Use npm run test for running test suites');
      shortcuts.push('Use npm run lint for code quality checks');
    }

    return shortcuts;
  }

  generateDevCommands(data) {
    const commands = [];

    if (data.packageJson?.scripts?.dev) {
      commands.push(`npm run dev - Start development server`);
    }
    if (data.packageJson?.scripts?.build) {
      commands.push(`npm run build - Build for production`);
    }
    if (data.packageJson?.scripts?.test) {
      commands.push(`npm run test - Run test suite`);
    }
    if (data.packageJson?.scripts?.lint) {
      commands.push(`npm run lint - Check code quality`);
    }

    return commands;
  }

  generateTestingShortcuts(data) {
    const shortcuts = [];

    if (this.checkForTests(data)) {
      shortcuts.push('Run unit tests with npm run test');
      shortcuts.push('Run tests in watch mode during development');
      shortcuts.push('Generate coverage reports regularly');
      shortcuts.push('Write tests for new features before implementation');
    }

    return shortcuts;
  }

  generateDeploymentAutomation(data) {
    const automation = [];

    if (this.checkForCI(data)) {
      automation.push('Automated testing on every push');
      automation.push('Automated building on main branch pushes');
      automation.push('Automated deployment to staging on feature branches');
      automation.push('Manual approval required for production deployments');
    }

    return automation;
  }

  generateProjectScaffolds(data) {
    const scaffolds = [];

    if (data.analysis.framework === 'React') {
      scaffolds.push('Component scaffold with TypeScript interfaces');
      scaffolds.push('Custom hook template with proper typing');
      scaffolds.push('Page component with layout and metadata');
      scaffolds.push('API integration hook with error handling');
    }

    return scaffolds;
  }

  generateComponentTemplates(data) {
    const templates = [];

    if (data.analysis.framework === 'React') {
      templates.push('Functional component with TypeScript');
      templates.push('Custom hook with proper typing');
      templates.push('Context provider with reducer pattern');
      templates.push('Form component with validation');
    }

    return templates;
  }

  generateConfigTemplates(data) {
    const templates = [];

    templates.push('ESLint configuration for code quality');
    templates.push('Prettier configuration for code formatting');
    templates.push('TypeScript configuration with strict settings');
    templates.push('Jest configuration for testing');

    return templates;
  }

  generateBoilerplateCode(data) {
    const boilerplate = [];

    if (data.analysis.framework === 'React') {
      boilerplate.push('React component boilerplate with props interface');
      boilerplate.push('Custom hook boilerplate with TypeScript');
      boilerplate.push('API service boilerplate with error handling');
      boilerplate.push('Utility function boilerplate with JSDoc');
    }

    return boilerplate;
  }

  // Helper methods for standards
  generateFileNamingStandards(data) {
    const standards = [];

    if (data.analysis.framework === 'React') {
      standards.push('Use PascalCase for component files (ComponentName.tsx)');
      standards.push('Use camelCase for utility files (helperFunctions.ts)');
      standards.push('Use kebab-case for configuration files (.eslintrc.js)');
    }

    return standards;
  }

  generateCodeFormattingStandards(data) {
    const standards = [];

    standards.push('Use 2 spaces for indentation');
    standards.push('Use single quotes for strings (except JSX)');
    standards.push('Add trailing commas in multi-line objects/arrays');
    standards.push('Use semicolons at end of statements');

    return standards;
  }

  generateDocumentationStandards(data) {
    const standards = [];

    standards.push('Add JSDoc comments for all public functions');
    standards.push('Document complex business logic with inline comments');
    standards.push('Maintain up-to-date README.md');
    standards.push('Document API endpoints and data structures');

    return standards;
  }

  generateTestingStandards(data) {
    const standards = [];

    if (this.checkForTests(data)) {
      standards.push('Write unit tests for all utility functions');
      standards.push('Write integration tests for component interactions');
      standards.push('Maintain test coverage above 80%');
      standards.push('Use descriptive test case names');
    }

    return standards;
  }

  formatAsMarkdown(context) {
    let markdown = '# Repository Context\n\n';
    markdown += `Generated: ${context.metadata.generated_at}\n`;
    markdown += `Template: ${context.metadata.template}\n`;
    markdown += `Repository: ${context.metadata.repository}\n\n`;

    // Add sections based on template
    if (context.project_overview) {
      markdown += '## Project Overview\n\n';
      markdown += `**Name:** ${context.project_overview.name}\n`;
      markdown += `**Description:** ${context.project_overview.description}\n`;
      markdown += `**Language:** ${context.project_overview.primary_language}\n`;
      markdown += `**Stars:** ${context.project_overview.repository_stats.stars}\n`;
      markdown += `**Forks:** ${context.project_overview.repository_stats.forks}\n\n`;
    }

    if (context.technical_details) {
      markdown += '## Technical Details\n\n';
      markdown += `**Framework:** ${context.technical_details.framework}\n`;
      markdown += `**Architecture:** ${context.technical_details.architecture_pattern}\n`;
      markdown += `**Complexity:** ${context.technical_details.complexity_level}\n\n`;

      if (context.technical_details.programming_languages.length > 0) {
        markdown += '**Languages:**\n';
        context.technical_details.programming_languages.forEach(lang => {
          markdown += `- ${lang.language}: ${lang.percentage}%\n`;
        });
        markdown += '\n';
      }
    }

    // New template sections
    if (context.coding_rules) {
      markdown += '## Coding Rules\n\n';
      context.coding_rules.forEach(rule => {
        markdown += `- ${rule}\n`;
      });
      markdown += '\n';
    }

    if (context.best_practices) {
      markdown += '## Best Practices\n\n';
      context.best_practices.forEach(practice => {
        markdown += `- ${practice}\n`;
      });
      markdown += '\n';
    }

    if (context.development_workflow) {
      markdown += '## Development Workflow\n\n';
      context.development_workflow.forEach(step => {
        markdown += `- ${step}\n`;
      });
      markdown += '\n';
    }

    if (context.productivity_shortcuts) {
      markdown += '## Productivity Shortcuts\n\n';
      context.productivity_shortcuts.forEach(shortcut => {
        markdown += `- ${shortcut}\n`;
      });
      markdown += '\n';
    }

    if (context.project_scaffolds) {
      markdown += '## Project Scaffolds\n\n';
      context.project_scaffolds.forEach(scaffold => {
        markdown += `- ${scaffold}\n`;
      });
      markdown += '\n';
    }

    if (context.architecture_analysis) {
      markdown += '## Architecture Analysis\n\n';
      if (context.architecture_analysis.root_structure) {
        markdown += `**Structure:** ${context.architecture_analysis.root_structure.directories} directories, ${context.architecture_analysis.root_structure.files} files\n`;
      }

      if (context.architecture_analysis.patterns_identified?.length > 0) {
        markdown += '**Identified Patterns:**\n';
        context.architecture_analysis.patterns_identified.forEach(pattern => {
          markdown += `- ${pattern}\n`;
        });
        markdown += '\n';
      }
    }

    if (context.development_setup) {
      markdown += '## Development Setup\n\n';
      if (context.development_setup.installation_steps.length > 0) {
        markdown += '**Installation:**\n';
        context.development_setup.installation_steps.forEach(step => {
          markdown += `- ${step}\n`;
        });
        markdown += '\n';
      }

      if (context.development_setup.development_scripts.length > 0) {
        markdown += '**Available Scripts:**\n';
        context.development_setup.development_scripts.forEach(script => {
          markdown += `- \`${script.command}\`: ${script.script}\n`;
        });
        markdown += '\n';
      }
    }

    if (context.recommendations?.length > 0) {
      markdown += '## Recommendations\n\n';
      context.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += '\n';
    }

    if (context.ai_assistant_guidelines) {
      markdown += '## AI Assistant Guidelines\n\n';
      if (context.ai_assistant_guidelines.coding_standards?.length > 0) {
        markdown += '**Coding Standards:**\n';
        context.ai_assistant_guidelines.coding_standards.forEach(standard => {
          markdown += `- ${standard}\n`;
        });
        markdown += '\n';
      }

      if (context.ai_assistant_guidelines.development_workflow?.length > 0) {
        markdown += '**Development Workflow:**\n';
        context.ai_assistant_guidelines.development_workflow.forEach(workflow => {
          markdown += `- ${workflow}\n`;
        });
        markdown += '\n';
      }
    }

    return markdown;
  }
}

export default ContextGenerator;
