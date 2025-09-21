import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Container,
  Paper
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  GitHub as GitHubIcon,
  Person,
  KeyboardArrowDown,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { storeTokenLocal, storeUserLocal } from '../lib/githubAuth'

const Landing = ({ onSignIn, onAnalyzePublicRepo }) => {
  const [publicRepoUrl, setPublicRepoUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [githubToken, setGithubToken] = useState('')
  const [tokenLoading, setTokenLoading] = useState(false)

  const demoRepoUrl = 'https://github.com/microsoft/vscode'

  const steps = [
    {
      number: 1,
      title: 'Sign In',
      description: 'Connect with GitHub for full access',
      color: '#6366f1',
      completed: false
    },
    {
      number: 2,
      title: 'Create Job',
      description: 'Select repository & choose template',
      color: '#8b5cf6',
      completed: false
    },
    {
      number: 3,
      title: 'AI Analysis',
      description: 'Advanced code analysis & insights',
      color: '#10b981',
      completed: false
    },
    {
      number: 4,
      title: 'Download Results',
      description: 'Get professional documentation',
      color: '#f59e0b',
      completed: false
    }
  ]

  const handleAnalyzeDemo = async () => {
    setAnalyzing(true)
    try {
      const result = await onAnalyzePublicRepo(demoRepoUrl, true) // true = preview mode
      setPreviewData(result)
      toast.success('Demo analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze demo repository')
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyzeCustomRepo = async () => {
    if (!publicRepoUrl.trim()) {
      toast.error('Please enter a public repository URL')
      return
    }
    setAnalyzing(true)
    try {
      const result = await onAnalyzePublicRepo(publicRepoUrl.trim(), true)
      setPreviewData(result)
      toast.success('Repository analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze repository')
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleTokenLogin = async () => {
    if (!githubToken.trim()) {
      toast.error('Please enter a GitHub token')
      return
    }

    setTokenLoading(true)
    try {
      // Basic token validation
      if (githubToken.trim().length < 20) {
        throw new Error('GitHub token appears to be too short. Please check your token.')
      }

      if (!githubToken.trim().startsWith('ghp_') && !githubToken.trim().startsWith('github_pat_')) {
        throw new Error('GitHub token should start with "ghp_" or "github_pat_". Please check your token.')
      }

      // Test the token by fetching user profile
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubToken.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid GitHub token. Please check your token and try again.')
        } else {
          throw new Error(`GitHub API error: ${response.status}`)
        }
      }

      const userData = await response.json()

      // Store token and user data using the new localStorage functions
      storeTokenLocal(githubToken.trim())
      storeUserLocal(userData)

      toast.success(`Welcome ${userData.login}! Authentication successful.`)

      // Force page reload to update authentication state
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Token authentication failed:', error)
      toast.error(`Authentication failed: ${error.message}`)
    } finally {
      setTokenLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 80% 50% at 20% -20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse 80% 50% at 80% 50%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 80% 50% at 40% 120%, rgba(120, 219, 226, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f8fafc 75%, #f1f5f9 100%)
      `,
      backgroundAttachment: 'fixed'
    }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', py: 8, px: { xs: 2, md: 4 } }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
            >
              📋 Detailer
            </Typography>
            <Typography
              sx={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0.1,
                fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
                fontWeight: 800,
                color: 'transparent',
                WebkitTextStroke: '1px currentColor'
              }}
            >
              Docs
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 600,
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Professional documentation in just a few simple steps
          </Typography>

          {/* Process Steps */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
              How It Works
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      border: `2px solid ${step.color}30`,
                      textAlign: 'center',
                      position: 'relative',
                      cursor: step.number === 1 ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:hover': step.number === 1 ? {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${step.color}30`
                      } : {}
                    }}
                    onClick={() => step.number === 1 && onSignIn()}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}bb)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        position: 'relative',
                        '&::after': step.number !== 4 ? {
                          content: '""',
                          position: 'absolute',
                          right: -15,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 15,
                          height: 2,
                          background: step.color,
                          display: { xs: 'none', sm: 'block' }
                        } : {}
                      }}
                    >
                      {step.number === 1 ? (
                        <Person sx={{ color: 'white' }} />
                      ) : step.number === 2 ? (
                        <CodeIcon sx={{ color: 'white' }} />
                      ) : step.number === 3 ? (
                        <AnalyticsIcon sx={{ color: 'white' }} />
                      ) : (
                        <GitHubIcon sx={{ color: 'white' }} />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: step.color, mb: 1 }}>
                      {step.number}. {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Sign In Button */}
          <Box sx={{ mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={onSignIn}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
              startIcon={<Person />}
            >
              Get Started - Sign In with GitHub
            </Button>
          </Box>

          {/* Alternative Token Login */}
          <Box sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              Or use your GitHub Personal Access Token
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="GitHub Personal Access Token"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    helperText="Token needs 'repo' scope for private repositories"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setGithubToken('')}
                    disabled={!githubToken.trim()}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Clear Token
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleTokenLogin}
                    disabled={!githubToken.trim() || tokenLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669, #047857)'
                      },
                      '&:disabled': {
                        background: 'grey.400'
                      },
                      textTransform: 'none'
                    }}
                    endIcon={tokenLoading ? <CircularProgress size={20} /> : null}
                  >
                    {tokenLoading ? 'Authenticating...' : 'Sign In with Token'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      How to get a GitHub Personal Access Token:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline' }}>GitHub Settings → Personal Access Tokens</a>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      2. Click "Generate new token (classic)"
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      3. Select scopes: <strong>repo</strong> (for private repositories) and <strong>user</strong> (for public info)
                    </Typography>
                    <Typography variant="body2">
                      4. Copy the generated token and paste it above
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>

        {/* Demo Preview Section */}
        <Box sx={{ py: 8, px: { xs: 2, md: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
              🚀 Try the Demo
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
              See Detailer in action with Microsoft's VS Code repository
            </Typography>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyzeDemo}
                disabled={analyzing}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  },
                  '&:disabled': {
                    background: 'grey.400'
                  }
                }}
                endIcon={analyzing ? <CircularProgress size={20} /> : null}
              >
                {analyzing ? 'Analyzing...' : `Demo: Analyze ${demoRepoUrl}`}
              </Button>
            </Box>

            {/* Analysis Preview */}
            {previewData && (
              <Box sx={{ mt: 6 }}>
                <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✨ Preview Mode - Sign in for full analysis and documentation download
                  </Typography>
                </Alert>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                        📋 Repository Overview
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {previewData.basic?.full_name || demoRepoUrl.replace('https://github.com/', '')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {previewData.basic?.description || 'A code editor redefined and optimized for building and debugging modern web and cloud applications.'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                            Language
                          </Typography>
                          <Chip label={previewData.basic?.language || 'TypeScript'} size="small" color="primary" />
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                            Stars
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'warning.main' }}>
                            ⭐ {previewData.basic?.stars?.toLocaleString() || '146k'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                            Forks
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                            🍴 {previewData.basic?.forks?.toLocaleString() || '29k'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                            Issues
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'error.main' }}>
                            🐛 {previewData.basic?.issues?.toLocaleString() || '12k'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'secondary.main' }}>
                        🤖 AI Analysis Preview
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            🏗️ Framework Detection: {previewData.analysis?.framework || 'Detecting...'}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.05)', borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            📊 Language: {previewData.basic?.language || 'Analyzing...'}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            📁 Repository Size: {(previewData.basic?.size / 1000)?.toFixed(1) || '0'} MB
                          </Typography>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            🔧 Code Complexity: {previewData.analysis?.complexity ? `${previewData.analysis.complexity}/100` : 'Calculating...'}
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={onSignIn}
                        sx={{
                          mt: 3,
                          py: 2,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            background: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        🚀 Sign In for Full Analysis & Documentation
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Custom Repository Input */}
            <Box sx={{ mt: 6, p: 4, bgcolor: 'rgba(255, 255, 255, 0.5)', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Try Your Own Public Repository
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Public Repository URL"
                    placeholder="https://github.com/owner/repository"
                    value={publicRepoUrl}
                    onChange={(e) => setPublicRepoUrl(e.target.value)}
                    helperText="Enter any GitHub public repository URL for instant analysis"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAnalyzeCustomRepo}
                    disabled={analyzing || !publicRepoUrl.trim()}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5, #3730a3)'
                      }
                    }}
                  >
                    Analyze Repository
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        {/* MCP Integration Section */}
        <Box sx={{ py: 8, px: { xs: 2, md: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🚀 Seamless IDE Integration
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Use Detailer directly in your favorite IDE with our Model Context Protocol (MCP) integration
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 2 }}>🖱️</Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Cursor IDE
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Native integration for the AI-powered IDE
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 2 }}>⚡</Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Real-time Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate docs instantly as you develop
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 2 }}>🤖</Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Contextual AI Assistance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI understands your codebase context
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ✨ Coming Soon - MCP integration will be available in the next release
              </Typography>
            </Alert>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default Landing
