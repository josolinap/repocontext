/**
 * Enhanced GitHub Service with TypeScript
 * Provides GitHub API integration with caching, retry logic, and error handling
 */

import { Octokit } from '@octokit/rest';
import type {
  GitHubRepository,
  GitHubUser,
  GitHubContributor,
  GitHubFile,
  GitHubPackageJson,
  GitHubAnalysisResult,
  GitHubServiceConfig,
  GitHubRateLimit,
  GitHubApiResponse,
  RetryConfig,
  CacheEntry
} from '../types';
import { ServiceError, NetworkError, ValidationError } from '../types';

class GitHubService {
  private octokit: Octokit;
  private token: string | null;
  private cache: Map<string, CacheEntry<any>>;
  private retryConfig: RetryConfig;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: GitHubServiceConfig = {}) {
    this.token = config.token || null;
    this.octokit = this.token ? new Octokit({ auth: this.token }) : new Octokit();
    this.cache = new Map();
    this.retryConfig = {
      maxAttempts: (config.retries as any)?.maxAttempts || 3,
      delayMs: (config.retries as any)?.delayMs || 1000,
      backoffMultiplier: (config.retries as any)?.backoffMultiplier || 2
    };
  }

  /**
   * Update the GitHub token
   */
  setToken(token: string): void {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
    // Clear cache when token changes
    this.cache.clear();
  }

  /**
   * Get authenticated user's repositories
   */
  async getUserRepos(): Promise<GitHubRepository[]> {
    if (!this.token) {
      throw new ValidationError('GitHub token is required', 'token');
    }

    const cacheKey = 'user_repos';
    const cached = this.getCachedData<GitHubRepository[]>(cacheKey);
    if (cached) return cached;

    return this.withRetry(async () => {
      try {
        const response = await this.octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 100,
          type: 'all'
        });

        this.checkRateLimit(response.headers);
        const repositories = response.data || [];

        this.setCacheData(cacheKey, repositories);
        return repositories;
      } catch (error) {
        throw this.handleGitHubError(error, 'fetching user repositories');
      }
    });
  }

  /**
   * Get detailed repository information
   */
  async getRepoDetails(owner: string, repo: string): Promise<GitHubApiResponse<GitHubAnalysisResult['basic'] & {
    languages: Record<string, number>;
    contributors: GitHubContributor[];
  }>> {
    if (!owner || !repo) {
      throw new ValidationError('Owner and repository name are required', 'owner/repo');
    }

    const cacheKey = `repo_details_${owner}_${repo}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        rateLimit: undefined
      };
    }

    return this.withRetry(async () => {
      try {
        const [repoResponse, languagesResponse, contributorsResponse] = await Promise.all([
          this.octokit.repos.get({ owner, repo }),
          this.octokit.repos.listLanguages({ owner, repo }),
          this.octokit.repos.listContributors({ owner, repo, per_page: 10 })
        ]);

        this.checkRateLimit(repoResponse.headers);

        const result = {
          ...repoResponse.data,
          languages: languagesResponse.data,
          contributors: contributorsResponse.data
        };

        this.setCacheData(cacheKey, result);

        return {
          data: result,
          status: repoResponse.status,
          headers: repoResponse.headers,
          rateLimit: this.parseRateLimit(repoResponse.headers)
        };
      } catch (error) {
        throw this.handleGitHubError(error, 'fetching repository details');
      }
    });
  }

  /**
   * Get repository contents
   */
  async getRepoContents(owner: string, repo: string, path = ''): Promise<GitHubFile[]> {
    if (!owner || !repo) {
      throw new ValidationError('Owner and repository name are required', 'owner/repo');
    }

    const cacheKey = `repo_contents_${owner}_${repo}_${path}`;
    const cached = this.getCachedData<GitHubFile[]>(cacheKey);
    if (cached) return cached;

    return this.withRetry(async () => {
      try {
        const response = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: 'HEAD'
        });

        let files: GitHubFile[];

        if (Array.isArray(response.data)) {
          files = response.data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type as 'file' | 'dir',
            size: item.size,
            download_url: item.download_url,
            url: item.url,
            sha: item.sha
          }));
        } else {
          files = [{
            name: response.data.name,
            path: response.data.path,
            type: response.data.type as 'file' | 'dir',
            size: response.data.size,
            content: response.data.content,
            encoding: response.data.encoding,
            sha: response.data.sha
          }];
        }

        this.setCacheData(cacheKey, files);
        return files;
      } catch (error) {
        throw this.handleGitHubError(error, 'fetching repository contents');
      }
    });
  }

  /**
   * Analyze a complete repository
   */
  async analyzeRepository(owner: string, repo: string): Promise<GitHubAnalysisResult> {
    if (!owner || !repo) {
      throw new ValidationError('Owner and repository name are required', 'owner/repo');
    }

    const cacheKey = `repo_analysis_${owner}_${repo}`;
    const cached = this.getCachedData<GitHubAnalysisResult>(cacheKey);
    if (cached) return cached;

    return this.withRetry(async () => {
      try {
        const [repoDetails, rootContents] = await Promise.all([
          this.getRepoDetails(owner, repo),
          this.getRepoContents(owner, repo)
        ]);

        // Analyze package.json if it exists
        let packageJson: GitHubPackageJson | undefined;
        const packageFile = rootContents.find(file => file.name === 'package.json');
        if (packageFile) {
          packageJson = await this.getPackageJson(owner, repo);
        }

        // Analyze README
        let readme: string | undefined;
        const readmeFile = rootContents.find(file =>
          file.name.toLowerCase().includes('readme')
        );
        if (readmeFile) {
          readme = await this.getReadme(owner, repo, readmeFile.path);
        }

        // Get directory structure
        const structure = await this.buildDirectoryStructure(owner, repo, '', 2);

        const analysis = this.generateAnalysis(repoDetails.data, packageJson, structure);

        const result: GitHubAnalysisResult = {
          basic: {
            name: repoDetails.data.name,
            description: repoDetails.data.description,
            language: repoDetails.data.language,
            stars: repoDetails.data.stargazers_count,
            forks: repoDetails.data.forks_count,
            issues: repoDetails.data.open_issues_count,
            created: repoDetails.data.created_at,
            updated: repoDetails.data.updated_at,
            size: repoDetails.data.size
          },
          languages: repoDetails.data.languages || {},
          contributors: repoDetails.data.contributors || [],
          packageJson,
          readme,
          structure,
          analysis
        };

        this.setCacheData(cacheKey, result);
        return result;
      } catch (error) {
        throw this.handleGitHubError(error, 'analyzing repository');
      }
    });
  }

  /**
   * Build directory structure recursively
   */
  private async buildDirectoryStructure(
    owner: string,
    repo: string,
    path = '',
    depth = 2,
    currentDepth = 0
  ): Promise<GitHubFile | null> {
    if (currentDepth >= depth) return null;

    try {
      const contents = await this.getRepoContents(owner, repo, path);

      const structure: GitHubFile = {
        name: path || '/',
        path: path || '/',
        type: 'dir',
        children: []
      };

      for (const item of contents) {
        if (item.type === 'dir' && currentDepth < depth - 1) {
          const children = await this.buildDirectoryStructure(
            owner,
            repo,
            item.path,
            depth,
            currentDepth + 1
          );
          if (children) {
            structure.children!.push(children);
          }
        } else if (item.type === 'file') {
          structure.children!.push({
            name: item.name,
            path: item.path,
            type: 'file',
            size: item.size,
            sha: item.sha
          });
        }
      }

      return structure;
    } catch (error) {
      console.error('Error building directory structure:', error);
      return null;
    }
  }

  /**
   * Generate repository analysis
   */
  private generateAnalysis(
    repoDetails: any,
    packageJson: GitHubPackageJson | undefined,
    structure: GitHubFile | null
  ): GitHubAnalysisResult['analysis'] {
    const analysis = {
      framework: this.detectFramework(packageJson),
      architecture: this.analyzeArchitecture(structure),
      complexity: this.calculateComplexity(structure),
      recommendations: [] as string[]
    };

    // Generate recommendations based on analysis
    if (!packageJson?.scripts?.test) {
      analysis.recommendations.push('Consider adding test scripts');
    }

    if (!repoDetails.description) {
      analysis.recommendations.push('Add a repository description');
    }

    if (repoDetails.open_issues_count > 50) {
      analysis.recommendations.push('Consider addressing open issues');
    }

    return analysis;
  }

  /**
   * Detect framework from package.json
   */
  private detectFramework(packageJson: GitHubPackageJson | undefined): string {
    if (!packageJson) return 'Unknown';

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps['react']) return 'React';
    if (deps['vue']) return 'Vue.js';
    if (deps['angular']) return 'Angular';
    if (deps['express']) return 'Express.js';
    if (deps['next']) return 'Next.js';
    if (deps['nuxt']) return 'Nuxt.js';

    return 'Vanilla JavaScript/TypeScript';
  }

  /**
   * Analyze repository architecture
   */
  private analyzeArchitecture(structure: GitHubFile | null): string {
    if (!structure) return 'Unknown';

    const dirs = structure.children?.filter(child => child.type === 'dir') || [];
    const hasSrc = dirs.some(dir => dir.name === 'src');
    const hasLib = dirs.some(dir => dir.name === 'lib');
    const hasComponents = dirs.some(dir => dir.name === 'components');

    if (hasSrc && hasComponents) return 'Component-based';
    if (hasSrc && hasLib) return 'Library-based';
    if (hasSrc) return 'Standard src structure';

    return 'Basic structure';
  }

  /**
   * Calculate repository complexity
   */
  private calculateComplexity(structure: GitHubFile | null): 'Low' | 'Medium' | 'High' {
    if (!structure) return 'Low';

    let fileCount = 0;
    let dirCount = 0;

    const countItems = (node: GitHubFile) => {
      if (node.type === 'file') fileCount++;
      else if (node.type === 'dir') {
        dirCount++;
        node.children?.forEach(countItems);
      }
    };

    countItems(structure);

    if (fileCount > 100 || dirCount > 20) return 'High';
    if (fileCount > 50 || dirCount > 10) return 'Medium';
    return 'Low';
  }

  /**
   * Get package.json content
   */
  private async getPackageJson(owner: string, repo: string): Promise<GitHubPackageJson | undefined> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json'
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Could not parse package.json:', error);
    }
    return undefined;
  }

  /**
   * Get README content
   */
  private async getReadme(owner: string, repo: string, path: string): Promise<string | undefined> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
    } catch (error) {
      console.warn('Could not fetch README:', error);
    }
    return undefined;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryConfig.maxAttempts) {
          break;
        }

        // Don't retry certain errors
        if (error instanceof ValidationError ||
            (error instanceof NetworkError && error.statusCode === 401)) {
          throw error;
        }

        const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle GitHub API errors
   */
  private handleGitHubError(error: any, operation: string): GitHubError {
    console.error(`Error ${operation}:`, error);

    if (error.status === 401) {
      return new NetworkError('Invalid GitHub token. Please check your authentication.', 401);
    } else if (error.status === 403) {
      return new NetworkError('GitHub API rate limit exceeded. Please try again later.', 403);
    } else if (error.status === 404) {
      return new NetworkError('Repository not found or access denied.', 404);
    } else {
      return new NetworkError(
        `Failed to ${operation}. Please check your internet connection and token permissions.`,
        error.status
      );
    }
  }

  /**
   * Check rate limit and warn if low
   */
  private checkRateLimit(headers: Record<string, string>): void {
    const remaining = headers['x-ratelimit-remaining'];
    if (remaining && parseInt(remaining) < 10) {
      console.warn('GitHub API rate limit low:', remaining);
    }
  }

  /**
   * Parse rate limit from headers
   */
  private parseRateLimit(headers: Record<string, string>): GitHubRateLimit | undefined {
    const limit = headers['x-ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const used = headers['x-ratelimit-used'];
    const resource = headers['x-ratelimit-resource'];

    if (limit && remaining && reset && used) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        used: parseInt(used),
        resource: resource || 'core'
      };
    }

    return undefined;
  }

  /**
   * Cache management
   */
  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCacheData<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxAge: this.CACHE_TTL
    };
  }
}

export default GitHubService;
