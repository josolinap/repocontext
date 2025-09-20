import { Octokit } from '@octokit/rest';

class GitHubService {
  constructor(token = null) {
    this.token = token;
    this.octokit = token ? new Octokit({ auth: token }) : new Octokit();
  }

  setToken(token) {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
  }

  async getUserRepos() {
    try {
      if (!this.token) {
        throw new Error('GitHub token is required');
      }

      const response = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        type: 'all'
      });

      // Check rate limit
      const rateLimit = response.headers?.['x-ratelimit-remaining'];
      if (rateLimit && parseInt(rateLimit) < 10) {
        console.warn('GitHub API rate limit low:', rateLimit);
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching user repos:', error);

      if (error.status === 401) {
        throw new Error('Invalid GitHub token. Please check your authentication.');
      } else if (error.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (error.status === 404) {
        throw new Error('Repository not found or access denied.');
      } else {
        throw new Error('Failed to fetch repositories. Please check your internet connection and token permissions.');
      }
    }
  }

  async getRepoDetails(owner, repo) {
    try {
      const [repoData, languages, contributors] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.repos.listLanguages({ owner, repo }),
        this.octokit.repos.listContributors({ owner, repo, per_page: 10 })
      ]);

      return {
        ...repoData.data,
        languages: languages.data,
        contributors: contributors.data
      };
    } catch (error) {
      console.error('Error fetching repo details:', error);
      throw new Error('Failed to fetch repository details.');
    }
  }

  async getRepoContents(owner, repo, path = '') {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: 'HEAD'
      });

      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          download_url: item.download_url,
          url: item.url
        }));
      } else {
        return [{
          name: response.data.name,
          path: response.data.path,
          type: response.data.type,
          size: response.data.size,
          content: response.data.content,
          encoding: response.data.encoding
        }];
      }
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      return [];
    }
  }

  async analyzeRepository(owner, repo) {
    try {
      const [repoDetails, rootContents] = await Promise.all([
        this.getRepoDetails(owner, repo),
        this.getRepoContents(owner, repo)
      ]);

      // Analyze package.json if it exists
      let packageJson = null;
      const packageFile = rootContents.find(file => file.name === 'package.json');
      if (packageFile) {
        try {
          const packageResponse = await this.octokit.repos.getContent({
            owner,
            repo,
            path: 'package.json'
          });
          // Use Buffer for Node.js compatibility, fallback to atob for browser
          const content = typeof Buffer !== 'undefined'
            ? Buffer.from(packageResponse.data.content, 'base64').toString('utf-8')
            : atob(packageResponse.data.content);
          packageJson = JSON.parse(content);
        } catch (error) {
          console.warn('Could not parse package.json:', error);
        }
      }

      // Analyze README
      let readme = null;
      const readmeFile = rootContents.find(file =>
        file.name.toLowerCase().includes('readme')
      );
      if (readmeFile) {
        try {
          const readmeResponse = await this.octokit.repos.getContent({
            owner,
            repo,
            path: readmeFile.path
          });
          // Use Buffer for Node.js compatibility, fallback to atob for browser
          readme = typeof Buffer !== 'undefined'
            ? Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8')
            : atob(readmeResponse.data.content);
        } catch (error) {
          console.warn('Could not fetch README:', error);
        }
      }

      // Get directory structure
      const structure = await this.buildDirectoryStructure(owner, repo, '', 2);

      return {
        basic: {
          name: repoDetails.name,
          description: repoDetails.description,
          language: repoDetails.language,
          stars: repoDetails.stargazers_count,
          forks: repoDetails.forks_count,
          issues: repoDetails.open_issues_count,
          created: repoDetails.created_at,
          updated: repoDetails.updated_at,
          size: repoDetails.size
        },
        languages: repoDetails.languages,
        contributors: repoDetails.contributors?.slice(0, 5) || [],
        packageJson,
        readme,
        structure,
        analysis: this.generateAnalysis(repoDetails, packageJson, structure)
      };
    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw new Error('Failed to analyze repository.');
    }
  }

  async buildDirectoryStructure(owner, repo, path = '', depth = 2, currentDepth = 0) {
    if (currentDepth >= depth) return null;

    try {
      const contents = await this.getRepoContents(owner, repo, path);

      const structure = {
        name: path || '/',
        type: 'directory',
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
            structure.children.push(children);
          }
        } else if (item.type === 'file') {
          structure.children.push({
            name: item.name,
            type: 'file',
            path: item.path,
            size: item.size
          });
        }
      }

      return structure;
    } catch (error) {
      console.error('Error building directory structure:', error);
      return null;
    }
  }

  generateAnalysis(repoDetails, packageJson, structure) {
    const analysis = {
      framework: this.detectFramework(packageJson),
      architecture: this.analyzeArchitecture(structure),
      complexity: this.calculateComplexity(structure),
      recommendations: []
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

  detectFramework(packageJson) {
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

  analyzeArchitecture(structure) {
    if (!structure) return 'Unknown';

    const dirs = structure.children.filter(child => child.type === 'directory');
    const hasSrc = dirs.some(dir => dir.name === 'src');
    const hasLib = dirs.some(dir => dir.name === 'lib');
    const hasComponents = dirs.some(dir => dir.name === 'components');

    if (hasSrc && hasComponents) return 'Component-based';
    if (hasSrc && hasLib) return 'Library-based';
    if (hasSrc) return 'Standard src structure';

    return 'Basic structure';
  }

  calculateComplexity(structure) {
    if (!structure) return 'Low';

    let fileCount = 0;
    let dirCount = 0;

    const countItems = (node) => {
      if (node.type === 'file') fileCount++;
      else if (node.type === 'directory') {
        dirCount++;
        node.children?.forEach(countItems);
      }
    };

    countItems(structure);

    if (fileCount > 100 || dirCount > 20) return 'High';
    if (fileCount > 50 || dirCount > 10) return 'Medium';
    return 'Low';
  }
}

export default GitHubService;
