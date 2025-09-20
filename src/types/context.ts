/**
 * Context Generator Types and Interfaces
 */

export interface ContextMetadata {
  generated_at: string;
  generator: string;
  template: string;
  repository: string;
  custom_template_name?: string;
  version?: string;
}

export interface ContextTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  sections: string[];
  category: 'comprehensive' | 'minimal' | 'technical' | 'overview' | 'rules' | 'workflows' | 'shortcuts' | 'scaffold' | 'custom';
}

export interface CustomTemplateConfig {
  name: string;
  description: string;
  icon?: string;
  sections: string[];
  version: string;
  created_at: string;
}

export interface ContextSection {
  [key: string]: any;
}

export interface GeneratedContext {
  metadata: ContextMetadata;
  [key: string]: ContextSection | ContextMetadata;
}

export interface TemplateGenerator {
  generateContext(data: any, template?: string): string;
  generateCustomContext(data: any, templateConfig: CustomTemplateConfig): string;
  addCustomTemplate(templateId: string, templateConfig: CustomTemplateConfig): void;
  removeCustomTemplate(templateId: string): void;
  getCustomTemplates(): Array<{ id: string } & CustomTemplateConfig>;
}

export interface ProjectOverview {
  name: string;
  description: string;
  primary_language: string;
  repository_stats: {
    stars: number;
    forks: number;
    open_issues: number;
    size_kb: number;
  };
  created: string;
  last_updated: string;
  contributors: number;
  git_insights?: {
    total_commits: number;
    active_branches: number;
    development_velocity: number;
    top_contributors: Array<{
      login: string;
      contributions: number;
    }>;
  };
}

export interface TechnicalDetails {
  programming_languages: Array<{
    language: string;
    percentage: number;
  }>;
  framework: string;
  architecture_pattern: string;
  complexity_level: string;
}

export interface ArchitectureAnalysis {
  root_structure: {
    directories: number;
    files: number;
    key_directories: string[];
    config_files: string[];
  };
  key_directories: Array<{
    name: string;
    purpose: string;
  }>;
  file_organization: {
    has_clear_structure: boolean;
    follows_conventions: boolean;
    organization_score: number;
  };
  patterns_identified: string[];
}

export interface DevelopmentSetup {
  prerequisites: string[];
  installation_steps: string[];
  development_scripts: Array<{
    command: string;
    script: string;
  }>;
}

export interface CodeQuality {
  has_tests: boolean;
  has_linting: boolean;
  has_documentation: boolean;
  has_ci_cd: boolean;
  code_quality_score: number;
}

export interface AIGuidelines {
  coding_standards: string[];
  project_patterns: string[];
  development_workflow: string[];
  contribution_guidelines: string[];
}

export interface CodingRules {
  framework_specific: string[];
  best_practices: string[];
  code_standards: {
    file_naming: string[];
    code_formatting: string[];
    documentation: string[];
    testing: string[];
  };
}

export interface DevelopmentWorkflow {
  development_process: string[];
  pr_process: string[];
  release_process: string[];
  collaboration_guidelines: string[];
}

export interface ProductivityShortcuts {
  development_commands: Array<{
    command: string;
    description: string;
  }>;
  testing_shortcuts: string[];
  deployment_automation: string[];
}

export interface ProjectScaffolds {
  component_templates: string[];
  configuration_templates: string[];
  boilerplate_code: string[];
}

export interface ContextGeneratorConfig {
  templates?: Record<string, Function>;
  customTemplates?: Map<string, CustomTemplateConfig>;
  outputFormat?: 'markdown' | 'json' | 'both';
  includeTimestamps?: boolean;
  includeVersioning?: boolean;
}
