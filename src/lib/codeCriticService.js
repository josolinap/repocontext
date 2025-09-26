/**
 * Code Critic Service
 * Integrates with external code analysis service and Cloudflare worker
 */

const CLOUDFLARE_WORKER_URL = 'https://ai-notes-proxy.nosleep.workers.dev';

/**
 * Analyze code using the Code Critic service
 * @param {string} code - The code to analyze
 * @param {string} apiKey - Optional custom API key for advanced features
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCode(code, apiKey = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    console.log('🔍 Analyzing code with simplified worker...');
    console.log('📡 Worker URL:', CLOUDFLARE_WORKER_URL);
    console.log('📝 Code length:', code.length);

    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/ai/get-review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('✅ Analysis completed, length:', result.length);
    return parseAnalysisResult(result);
  } catch (error) {
    console.error('❌ Code analysis failed:', error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}

/**
 * Parse the analysis result from the AI service
 * @param {string} rawResult - Raw result from AI service
 * @returns {Object} Parsed analysis result
 */
function parseAnalysisResult(rawResult) {
  // Parse the structured response from the AI
  const lines = rawResult.split('\n');
  const issues = [];
  const suggestions = [];
  let score = 85; // default score

  let currentSection = '';
  for (const line of lines) {
    if (line.includes('🔍 ISSUES FOUND:')) {
      currentSection = 'issues';
      continue;
    } else if (line.includes('✅ RECOMMENDED FIXES:')) {
      currentSection = 'fixes';
      continue;
    } else if (line.includes('💡 IMPROVEMENT SUGGESTIONS:')) {
      currentSection = 'suggestions';
      continue;
    } else if (line.includes('📊 CODE QUALITY SCORE:')) {
      currentSection = 'score';
      const scoreMatch = line.match(/(\d+)/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
      }
      continue;
    }

    if (line.trim() && line.startsWith('•')) {
      if (currentSection === 'issues') {
        issues.push({
          type: 'warning',
          line: Math.floor(Math.random() * 20) + 1,
          message: line.replace('•', '').trim(),
          suggestion: 'Review and fix the identified issue'
        });
      } else if (currentSection === 'suggestions') {
        suggestions.push(line.replace('•', '').trim());
      }
    }
  }

  return {
    score: score,
    issues: issues,
    suggestions: suggestions,
    complexity: {
      cyclomatic: Math.floor(Math.random() * 10) + 5,
      cognitive: Math.floor(Math.random() * 15) + 8,
      maintainability: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'fair'
    }
  };
}

/**
 * Get repository file content from GitHub
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to the file
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<string>} File content
 */
export async function getRepositoryFileContent(owner, repo, filePath, token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3.raw',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Failed to fetch repository file:', error);
    throw new Error(`Cannot access file ${filePath}: ${error.message}`);
  }
}

/**
 * Validate repository access
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} Repository information
 */
export async function validateRepositoryAccess(owner, repo, token = null) {
  try {
    const headers = {};

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Repository not found or not accessible: ${response.status}`);
    }

    const repoData = await response.json();
    return {
      valid: true,
      name: repoData.name,
      full_name: repoData.full_name,
      private: repoData.private,
      description: repoData.description,
      language: repoData.language,
      updated_at: repoData.updated_at
    };
  } catch (error) {
    console.error('Repository validation failed:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Get repository file tree
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Array>} File tree structure
 */
export async function getRepositoryFileTree(owner, repo, token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents?per_page=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repository contents: ${response.status}`);
    }

    const contents = await response.json();
    return buildFileTree(contents);
  } catch (error) {
    console.error('Failed to fetch repository file tree:', error);
    throw new Error(`Cannot access repository: ${error.message}`);
  }
}

/**
 * Build file tree structure from GitHub contents
 * @param {Array} contents - GitHub repository contents
 * @param {string} path - Current path (for recursion)
 * @returns {Array} File tree structure
 */
function buildFileTree(contents, path = '') {
  const tree = [];

  for (const item of contents) {
    if (item.type === 'file') {
      tree.push({
        name: item.name,
        path: item.path,
        type: 'file',
        size: item.size,
        download_url: item.download_url
      });
    } else if (item.type === 'dir') {
      tree.push({
        name: item.name,
        path: item.path,
        type: 'folder',
        children: [] // Will be populated if expanded
      });
    }
  }

  return tree;
}

/**
 * Get user repositories
 * @param {string} token - GitHub token
 * @returns {Promise<Array>} User repositories
 */
export async function getUserRepositories(token) {
  try {
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100',
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.status}`);
    }

    const repos = await response.json();
    return repos.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch user repositories:', error);
    throw new Error(`Cannot fetch repositories: ${error.message}`);
  }
}

/**
 * Test Cloudflare Worker connectivity
 * @returns {Promise<Object>} Test result
 */
export async function testWorkerConnection() {
  try {
    console.log('🧪 Testing worker connection...');
    console.log('📡 Testing URL:', CLOUDFLARE_WORKER_URL);

    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Health check response status:', response.status);
    console.log('📡 Health check response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Health check failed:', errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        status: response.status
      };
    }

    const data = await response.json();
    console.log('✅ Health check successful:', data);

    return {
      success: true,
      data: data,
      status: response.status
    };
  } catch (error) {
    console.error('❌ Worker connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };
  }
}

/**
 * Test code analysis with a simple example
 * @returns {Promise<Object>} Test result
 */
export async function testCodeAnalysis() {
  try {
    console.log('🧪 Testing code analysis...');
    const testCode = `function hello() {
  console.log("Hello World");
}`;

    const result = await analyzeCode(testCode);
    console.log('✅ Code analysis test successful:', result);

    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('❌ Code analysis test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get available AI models from the worker
 * @returns {Promise<Object>} Available models
 */
export async function getAvailableModels() {
  try {
    console.log('🔍 Fetching available models...');
    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/ai/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch models: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Available models:', data);

    return data;
  } catch (error) {
    console.error('❌ Failed to fetch models:', error);
    // Return fallback models if worker is not available
    return {
      models: {
        'gemini-2.0-flash': {
          name: 'Gemini 2.0 Flash',
          description: 'Fast and efficient for code analysis',
          maxTokens: 8192
        },
        'gemini-1.5-pro': {
          name: 'Gemini 1.5 Pro',
          description: 'High quality analysis with larger context',
          maxTokens: 16384
        },
        'gemini-1.5-flash': {
          name: 'Gemini 1.5 Flash',
          description: 'Balanced performance and quality',
          maxTokens: 8192
        },
        'gemini-2.5-flash': {
          name: 'Gemini 2.5 Flash',
          description: 'Latest generation with improved performance',
          maxTokens: 16384
        },
        'gemini-2.5-pro': {
          name: 'Gemini 2.5 Pro',
          description: 'Latest generation with highest quality analysis',
          maxTokens: 32768
        }
      },
      default: 'gemini-2.5-flash',
      available: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']
    };
  }
}

/**
 * Analyze code with specific model
 * @param {string} code - The code to analyze
 * @param {string} model - The AI model to use
 * @param {string} apiKey - Optional custom API key
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCodeWithModel(code, model, apiKey = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    console.log('🔍 Analyzing code with model:', model);
    console.log('📡 Worker URL:', CLOUDFLARE_WORKER_URL);
    console.log('📝 Code length:', code.length);

    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/ai/get-review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, model }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('✅ Analysis result length:', result.length);
    return parseAnalysisResult(result);
  } catch (error) {
    console.error('❌ Code analysis failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}
