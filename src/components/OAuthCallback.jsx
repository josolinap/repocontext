import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { toast } from 'react-hot-toast';
import {
  exchangeCodeForToken,
  getUserProfile,
  storeToken,
  storeUser
} from '../lib/githubAuth';

const OAuthCallback = () => {
  console.log('🎯 OAuthCallback component rendering...');

  useEffect(() => {
    console.log('🚀 OAuthCallback useEffect running...');

    const handleOAuthCallback = async () => {
      try {
        console.log('🔍 Getting URL parameters...');
        // Get authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('📋 URL parameters:', { code: !!code, state: !!state, error });

        if (error) {
          const errorMessage = `GitHub OAuth Error: ${error}`;
          console.error('❌ OAuth error from GitHub:', error);
          throw new Error(errorMessage);
        }

        if (!code) {
          console.error('❌ No authorization code received from GitHub');
          throw new Error('No authorization code received from GitHub');
        }

        // Verify state parameter for security
        const storedState = sessionStorage.getItem('oauth_state');
        console.log('🔐 State verification:', { storedState, receivedState: state });

        if (!storedState || state !== storedState) {
          console.error('❌ OAuth security check failed - state mismatch');
          throw new Error('OAuth security check failed - state mismatch');
        }

        console.log('🔑 Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);
        console.log('🔑 Token response received:', { hasAccessToken: !!tokenResponse.access_token });

        if (!tokenResponse.access_token) {
          console.error('❌ Failed to obtain access token from GitHub');
          throw new Error('Failed to obtain access token from GitHub');
        }

        console.log('✅ Access token obtained, fetching user profile...');

        // Store the access token
        storeToken(tokenResponse.access_token);

        // Get user profile
        const userProfile = await getUserProfile(tokenResponse.access_token);
        storeUser(userProfile);

        console.log('✅ User profile obtained:', userProfile.login);

        // Show success message
        toast.success(`Welcome ${userProfile.login}! Authentication successful.`);

        // Clean up URL parameters
        window.history.replaceState(null, null, window.location.pathname);

        // Force a page reload to update the authentication state
        setTimeout(() => {
          console.log('🔄 Reloading page to update authentication state...');
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('❌ OAuth callback failed:', error);

        toast.error(`Authentication failed: ${error.message}`);

        // Clean up URL parameters
        window.history.replaceState(null, null, window.location.pathname);

        // Redirect back to main app after showing error
        setTimeout(() => {
          console.log('🔄 Redirecting to main app after error...');
          window.location.href = '/';
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        py: 8,
        px: 4,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CircularProgress size={80} sx={{ mb: 4, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Completing Authentication
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Signing you in with GitHub...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please wait while we complete your authentication and redirect you back to the application.
        </Typography>

        <Alert severity="info" sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="body2">
            <strong>What happens next:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • GitHub token exchanged for access token
          </Typography>
          <Typography variant="body2">
            • User profile information retrieved
          </Typography>
          <Typography variant="body2">
            • Authentication state saved locally
          </Typography>
          <Typography variant="body2">
            • Automatic redirect to dashboard
          </Typography>
        </Alert>

        <Typography variant="caption" color="text.secondary">
          This process usually takes 5-10 seconds. If you're not redirected automatically,
          try refreshing the page or go back to the main application.
        </Typography>
      </Box>
    </Box>
  );
};

export default OAuthCallback;
