import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material'
import GitHubService from '../lib/github'

const Dashboard = ({ onNavigateToAnalyzer = () => {} }) => {
  console.log('🏠 Dashboard component rendering...')

  const [githubToken, setGithubToken] = useState('')
  const [recentJobs, setRecentJobs] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalRepos: 0,
    totalDownloads: 0,
    avgComplexity: 'Medium'
  })

  const githubService = new GitHubService()

  console.log('📊 Dashboard state:', { githubToken: !!githubToken, recentJobsCount: recentJobs.length, stats })

  // Load data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('github_token')
    const jobs = JSON.parse(localStorage.getItem('recent_jobs') || '[]')
    const dashboardStats = JSON.parse(localStorage.getItem('dashboard_stats') || '{}')

    if (token) {
      setGithubToken(token)
      githubService.setToken(token)
    }

    setRecentJobs(jobs)
    setStats({ ...stats, ...dashboardStats })
  }, [])

  // Fetch user profile
  const { data: userProfileData } = useQuery({
    queryKey: ['user-profile', githubToken],
    queryFn: async () => {
      if (!githubToken) return null
      try {
        githubService.setToken(githubToken)
        const profile = await githubService.getUserProfile()
        return profile
      } catch (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
    },
    enabled: !!githubToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch user repositories for stats
  const { data: repositories } = useQuery({
    queryKey: ['user-repos', githubToken],
    queryFn: async () => {
      if (!githubToken) return []
      try {
        githubService.setToken(githubToken)
        const repos = await githubService.getUserRepos()
        return repos || []
      } catch (error) {
        console.error('Error fetching user repositories:', error)
        return []
      }
    },
    enabled: !!githubToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const handleTokenSave = () => {
    if (githubToken.trim()) {
      // Basic validation for GitHub token format
      if (githubToken.trim().length < 20) {
        toast.error('GitHub token appears to be too short. Please check your token.')
        return
      }
      if (!githubToken.trim().startsWith('ghp_') && !githubToken.trim().startsWith('github_pat_')) {
        toast.error('GitHub token should start with "ghp_" or "github_pat_". Please check your token.')
        return
      }
      localStorage.setItem('github_token', githubToken.trim())
      githubService.setToken(githubToken.trim())
      toast.success('GitHub token saved successfully!')
    } else {
      toast.error('Please enter a GitHub token.')
    }
  }

  const clearRecentJobs = () => {
    setRecentJobs([])
    localStorage.removeItem('recent_jobs')
    toast.success('Recent jobs cleared!')
  }

  const exportJobHistory = () => {
    const dataStr = JSON.stringify(recentJobs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'job-history.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Job history exported!')
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 4, backgroundColor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            🏠 Dashboard
          </Typography>
          {userProfileData && (
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 500
              }}
            >
              Welcome back, {userProfileData.name || userProfileData.login}!
            </Typography>
          )}
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Manage your repository analysis jobs and view insights
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04)
                  `,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }
              }}
              onClick={() => onNavigateToAnalyzer && onNavigateToAnalyzer()}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AnalyticsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Analyze Repository
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate context files for AI assistants
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 500
                  }}
                >
                  Get started →
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04)
                  `,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }
              }}
              onClick={() => onNavigateToAnalyzer && onNavigateToAnalyzer({ templates: true })}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 40, mr: 2 }}>📝</Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Manage Templates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create and customize analysis templates
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 500
                  }}
                >
                  Open Template Manager →
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04)
                  `,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }
              }}
              onClick={() => onNavigateToAnalyzer && onNavigateToAnalyzer({ history: true })}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 40, mr: 2 }}>📋</Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Job History
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage past analyses
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 500
                  }}
                >
                  View History →
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04)
                  `,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }
              }}
              onClick={() => onNavigateToAnalyzer && onNavigateToAnalyzer({ insights: true })}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 40, mr: 2 }}>🔍</Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Code Insights
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI-powered code analysis & recommendations
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 500
                  }}
                >
                  Analyze Code →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AnalyticsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {stats.totalJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jobs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FolderIcon sx={{ fontSize: 32, mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {repositories?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Repositories
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DownloadIcon sx={{ fontSize: 32, mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {stats.totalDownloads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Downloads
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 32, mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {stats.avgComplexity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Complexity
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* GitHub Configuration */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>🔐</Typography>
                    <Typography variant="h6">GitHub Configuration</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Personal Access Token"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    helperText="Token needs 'repo' scope for private repositories"
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleTokenSave}
                    disabled={!githubToken.trim()}
                    size="large"
                  >
                    Save Token
                  </Button>

                  {!githubToken && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <strong>GitHub token required:</strong> Set up your Personal Access Token to start analyzing repositories.
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '4px', textDecoration: 'underline' }}
                      >
                        Create token →
                      </a>
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>📋</Typography>
                      <Typography variant="h6">Recent Jobs</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={exportJobHistory}
                        disabled={recentJobs.length === 0}
                        sx={{ color: 'primary.main' }}
                      >
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={clearRecentJobs}
                        disabled={recentJobs.length === 0}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                }
              />
              <CardContent>
                {recentJobs.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentJobs.slice(0, 5).map((job, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {job.repository}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.template} • {new Date(job.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={job.status}
                            color={job.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                          {job.downloaded && (
                            <Typography>📥</Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>📭</Typography>
                    <Typography variant="h6" color="text.secondary">
                      No recent jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Start by analyzing a repository to see your job history here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Tips */}
        <Grid container spacing={3} sx={{ mt: 6 }}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>💡</Typography>
                    <Typography variant="h6">Quick Tips</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        height: '100%'
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 500
                        }}
                      >
                        🎯 Choose the Right Template
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use 'Comprehensive' for complex projects, 'Minimal' for quick overviews, and 'Technical' for detailed specs.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        height: '100%'
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 500
                        }}
                      >
                        🔄 Regular Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Re-analyze repositories periodically to keep your AI assistants updated with the latest changes.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        height: '100%'
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 500
                        }}
                      >
                        📊 Track Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use the dashboard to monitor your analysis activity and download statistics over time.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard
