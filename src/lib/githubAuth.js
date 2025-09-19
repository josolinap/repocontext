// GitHub OAuth Configuration
const GITHUB_CLIENT_ID = 'Ov23liGZOHsT9zLCyOJO';
const GITHUB_API_BASE = 'https://api.github.com';

// Generate OAuth URL for popup flow
export const getGitHubOAuthUrl = (callbackURIComponent) => {
  const state = generateState();
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: callbackURIComponent,
    scope: 'user repo',
    state: state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

// Generate random state for OAuth security
function generateState() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Start GitHub OAuth redirect flow
export const startGitHubOAuth = () => {
  const isProduction = window.location.hostname !== 'localhost';
  let redirectUri;

  if (isProduction) {
    // Production: Use the full app URL (include base path, no trailing slash)
    redirectUri = (window.location.origin + window.location.pathname).replace(/\/$/, '');
    console.log('🔄 Using Production OAuth URL:', redirectUri);
  } else {
    // Development: Use localhost
    redirectUri = 'http://localhost:5174';
    console.log('🔄 Using Development OAuth URL:', redirectUri);
  }

  const oauthUrl = getGitHubOAuthUrl(redirectUri);
  console.log('🚀 OAuth Flow Starting...', { redirectUri, oauthUrl });

  // Immediate redirect (no delay needed)
  window.location.href = oauthUrl;
};

// Parse OAuth callback URL
export const parseOAuthCallback = (callbackUrl) => {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  return { code, state };
};

// Get user's access token (in a real app, this should be done server-side)
export const exchangeCodeForToken = async (code) => {
  // Note: This should typically be done on your server to keep client secret secure
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      client_secret: '88b7c0706ec0022bc9dd16e26c5ccb934c5bfb3a',
      code: code,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
};

// Get user profile
export const getUserProfile = async (token) => {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

// Get user's repositories
export const getUserRepos = async (token, params = {}) => {
  const { type = 'owner', sort = 'updated', per_page = 100, page = 1 } = params;
  const response = await fetch(
    `${GITHUB_API_BASE}/user/repos?type=${type}&sort=${sort}&per_page=${per_page}&page=${page}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user repositories');
  }

  return response.json();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getStoredToken();
};

// Get stored token
export const getStoredToken = () => {
  return sessionStorage.getItem('github_token');
};

// Store token
export const storeToken = (token) => {
  sessionStorage.setItem('github_token', token);
};

// Remove stored token
export const removeToken = () => {
  sessionStorage.removeItem('github_token');
  sessionStorage.removeItem('github_user');
};

// Store user data
export const storeUser = (userData) => {
  sessionStorage.setItem('github_user', JSON.stringify(userData));
};

// Get stored user data
export const getStoredUser = () => {
  const userData = sessionStorage.getItem('github_user');
  return userData ? JSON.parse(userData) : null;
};
