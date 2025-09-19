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
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          const errorMessage = `GitHub OAuth Error: ${error}`;
          throw new Error(errorMessage);
        }

        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        // Verify state parameter for security
        const storedState = sessionStorage.getItem('oauth_state');
        if (!storedState || state !== storedState) {
          throw new Error('OAuth security check failed - state mismatch');
        }

        console.log('🔑 Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);

        if (!tokenResponse.access_token) {
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

        // Redirect to main application
        const redirectTo = localStorage.getItem('oauth_redirect') || '/repocontext';
        localStorage.removeItem('oauth_redirect');

        // Clean up URL parameters
        window.history.replaceState(null, null, window.location.pathname);

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);

      } catch (error) {
        console.error('OAuth callback failed:', error);

        toast.error(`Authentication failed: ${error.message}`);

        // Clean up URL parameters
        window.history.replaceState(null, null, window.location.pathname);

        // Redirect back to main app after showing error
        setTimeout(() => {
          window.location.href = '/repocontext';
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
        minHeight: '70vh',
        py: 8,
        px: 4
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 500,
          width: '100%'
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
