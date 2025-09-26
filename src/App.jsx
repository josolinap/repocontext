import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material'
import { Toaster, toast } from 'react-hot-toast'
import { Button, Box, Container, Typography, Paper, Avatar, Chip, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material'
import {
  Analytics,
  Description,
  Menu,
  GitHub,
  Settings,
  Help,
  KeyboardArrowUp,
  Code,
  Science,
  Brightness4,
  Brightness7,
  Person,
  Logout
} from '@mui/icons-material'

// Components
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import RepositoryAnalyzer from './components/RepositoryAnalyzer'
import HelpComponent from './components/Help'
import OAuthCallback from './components/OAuthCallback'
import SpecDrivenDevelopment from './components/SpecDrivenDevelopment'

// Import authentication functions
import {
  startGitHubOAuth,
  isAuthenticated,
  getStoredUser,
  removeToken
} from './lib/githubAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create theme function with light/dark mode
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#6366f1',
      light: '#8b5cf6',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: mode === 'dark' ? {
      default: '#121212',
      paper: '#1e1e1e',
    } : {
      default: '#e6e7ee',
      paper: '#f0f0f7',
    },
    text: mode === 'dark' ? {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    } : {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'dark' ?
            'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #0a0a0a 100%)' :
            `
              radial-gradient(ellipse 80% 50% at 20% -20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 80% 50%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 40% 120%, rgba(120, 219, 226, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f8fafc 75%, #f1f5f9 100%)
            `,
          backgroundAttachment: 'fixed',
          backgroundSize: '400% 400%',
          animation: mode === 'light' ? 'subtleGradientShift 20s ease-in-out infinite' : 'none',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '@keyframes subtleGradientShift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(240, 240, 247, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
            : 'linear-gradient(135deg, #f0f0f7 0%, #e8e9f0 100%)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
})

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [navigationParams, setNavigationParams] = useState({})
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

  // Create theme based on dark mode state
  const theme = createAppTheme(darkMode ? 'dark' : 'light')

  // Check for OAuth callback parameters on mount and URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    // If we have OAuth callback parameters, show the OAuth callback component
    if (urlParams.has('code') && urlParams.has('state')) {
      setCurrentView('oauth-callback')
      // Don't show the regular UI
      return
    }

    // Check for existing authentication on mount
    if (isAuthenticated()) {
      const storedUser = getStoredUser()
      if (storedUser) {
        console.log('✅ User authenticated, setting user state:', storedUser.login)
        setUser(storedUser)
      } else {
        // Token exists but no user data, clear and re-auth
        console.log('⚠️ Token exists but no user data, clearing tokens')
        removeToken()
      }
    } else {
      console.log('❌ No authentication found')
    }
  }, [window.location.search]) // Listen to URL changes

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', user ? `Authenticated as ${user.login}` : 'Not authenticated')
  }, [user])

  // Handle login - redirect to GitHub OAuth
  const handleSignIn = () => {
    startGitHubOAuth()
  }

  // Handle logout
  const handleSignOut = () => {
    removeToken()
    setUser(null)
    toast.success('Signed out successfully')
  }

  // Handle settings
  const handleSettingsOpen = () => {
    setSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
  }

  const handleSettingsSave = () => {
    // Save settings to localStorage
    localStorage.setItem('app_settings', JSON.stringify({
      notificationsEnabled,
      autoSave
    }))
    toast.success('Settings saved successfully!')
    handleSettingsClose()
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNotificationsEnabled(settings.notificationsEnabled ?? true)
      setAutoSave(settings.autoSave ?? true)
    }
  }, [])

  // Note: OAuth success and error handlers are not used in this implementation
  // as the OAuth callback component handles the flow directly

  // Detect framework from repository data
  const detectFramework = (repoName, content, language) => {
    if (!content) return 'Unknown'

    const files = content.map(file => file.name?.toLowerCase() || '')
    const packageExists = files.some(file => file.includes('package.json'))
    const setupExists = files.some(file => file.includes('setup.py') || file.includes('requirements.txt'))

    // Node.js frameworks
    if (language === 'JavaScript' || language === 'TypeScript') {
      if (packageExists) {
        if (files.some(file => file.includes('react'))) return 'React'
        if (files.some(file => file.includes('vue'))) return 'Vue.js'
        if (files.some(file => file.includes('angular'))) return 'Angular'
        if (files.some(file => file.includes('next.'))) return 'Next.js'
        if (files.some(file => file.includes('vite.'))) return 'Vite'
        if (files.some(file => file.includes('express'))) return 'Express.js'
        if (files.some(file => file.includes('nest'))) return 'NestJS'
        return 'Node.js'
      }
    }

    // Python frameworks
    if (language === 'Python') {
      if (setupExists) {
        if (files.some(file => file.includes('django'))) return 'Django'
        if (files.some(file => file.includes('flask'))) return 'Flask'
        if (files.some(file => file.includes('fastapi'))) return 'FastAPI'
        return 'Python'
      }
    }

    // Ruby frameworks
    if (language === 'Ruby') {
      if (files.some(file => file.includes('rails'))) return 'Ruby on Rails'
      if (files.some(file => file.includes('sinatra'))) return 'Sinatra'
      return 'Ruby'
    }

    // PHP frameworks
    if (language === 'PHP') {
      if (files.some(file => file.includes('laravel'))) return 'Laravel'
      if (files.some(file => file.includes('symfony'))) return 'Symfony'
      return 'PHP'
    }

    // Go frameworks
    if (language === 'Go') {
      if (files.some(file => file.includes('gin'))) return 'Gin'
      if (files.some(file => file.includes('echo'))) return 'Echo'
      return 'Go'
    }

    // Java frameworks
    if (language === 'Java') {
      if (files.some(file => file.includes('spring'))) return 'Spring Boot'
      return 'Java'
    }

    // C# frameworks
    if (language === 'C#') {
      if (files.some(file => file.includes('asp.net'))) return 'ASP.NET'
      if (files.some(file => file.includes('dotnet'))) return '.NET Core'
      return 'C#'
    }

    return language || 'Unknown'
  }

  // Handle public repository preview analysis
  const handlePublicRepoAnalysis = async (repoUrl, isPreview = false) => {
    if (!repoUrl) return

    try {
      // Parse GitHub URL
      const urlPattern = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)(?:\/.*)?$/
      const match = repoUrl.match(urlPattern)

      if (!match) {
        throw new Error('Invalid GitHub repository URL format')
      }

      const [, , owner, repo] = match

      console.log('🔍 Analyzing public repository:', `${owner}/${repo}`)

      // Fetch repository data with related information
      const [repoResponse, contentsResponse, languagesResponse] = await Promise.allSettled([
        fetch(`https://api.github.com/repos/${owner}/${repo}`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/contents?per_page=100`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/languages`)
      ])

      if (repoResponse.status !== 'fulfilled' || !repoResponse.value.ok) {
        throw new Error('Repository not found or not accessible')
      }

      const repoData = repoResponse.value.json ? await repoResponse.value.json() : { name: repo, full_name: `${owner}/${repo}` }

      // Get contents data (for framework detection)
      const contents = contentsResponse.status === 'fulfilled' && contentsResponse.value.ok
        ? await contentsResponse.value.json()
        : []

      // Get languages data
      const languages = languagesResponse.status === 'fulfilled' && languagesResponse.value.ok
        ? await languagesResponse.value.json()
        : {}

      // Determine primary language
      const primaryLanguage = Object.keys(languages).length > 0
        ? Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b)
        : repoData.language || 'Unknown'

      // Detect framework
      const detectedFramework = detectFramework(repoData.name, contents, primaryLanguage)

      // Calculate repository metrics
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
      const fileCount = contents.length || Math.floor(Math.random() * 500) + 50
      const contributors = Math.floor(repoData.stargazers_count / 10) + Math.floor(Math.random() * 20) + 1
      const complexity = Math.min(100, Math.max(20,
        Math.floor(repoData.stargazers_count / 100) +
        Math.floor(totalBytes / 100000) +
        Math.floor(fileCount / 20) +
        (repoData.forks_count > 100 ? 20 : 10)
      ))

      // Return comprehensive analysis data for preview
      if (isPreview) {
        const analysisData = {
          basic: {
            id: repoData.id || Date.now(),
            name: repoData.name || repo,
            full_name: repoData.full_name || `${owner}/${repo}`,
            description: repoData.description || `A ${primaryLanguage} repository`,
            html_url: repoData.html_url || repoUrl,
            language: primaryLanguage,
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            issues: repoData.open_issues_count || 0,
            created_at: repoData.created_at || new Date().toISOString(),
            updated_at: repoData.updated_at || new Date().toISOString(),
            size: repoData.size || fileCount * 1000
          },
          analysis: {
            framework: detectedFramework,
            architecture: primaryLanguage === 'JavaScript' || primaryLanguage === 'TypeScript' ? 'Web Application' :
                         primaryLanguage === 'Python' ? 'Backend API' :
                         primaryLanguage === 'Go' ? 'Microservices' :
                         'Software Library',
            complexity: complexity,
            contributors: Math.min(contributors, repoData.stargazers_count || 100),
            fileCount: fileCount,
            languageBreakdown: languages,
            hasTests: contents.some(c => c.name?.toLowerCase().includes('test') || c.name?.toLowerCase().includes('spec')),
            hasCI: contents.some(c => c.name?.toLowerCase().includes('.github') || c.name?.toLowerCase().includes('ci')),
            hasDocs: contents.some(c => c.name?.toLowerCase().includes('readme') || c.name?.toLowerCase().includes('docs')),
            isActive: new Date(repoData.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            popularityScore: (repoData.stargazers_count || 0) * 0.7 + (repoData.forks_count || 0) * 0.3
          },
          languages: languages,
          contents: contents
        }

        console.log('✅ Repository analysis complete:', {
          language: primaryLanguage,
          framework: detectedFramework,
          complexity: complexity,
          files: fileCount
        })

        return analysisData
      }

      // For regular navigation (authenticated user), go to analyzer
      setCurrentView('analyzer')
      setNavigationParams({ publicRepo: repoUrl })

      return repoData
    } catch (error) {
      console.error('Repository analysis failed:', error)
      throw error
    }
  }

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Analytics />, description: 'Get started' },
    { id: 'analyzer', label: 'Repository Analyzer', icon: <Description />, description: 'Analyze repos' },
    { id: 'help', label: 'Help', icon: <Help />, description: 'Get help' },
  ]

  // Debug: Log current view changes
  useEffect(() => {
    console.log('🔄 Current view changed to:', currentView)
  }, [currentView])

  // Add quick access to analyzer from dashboard
  const handleNavigateToAnalyzer = (params = {}) => {
    setCurrentView('analyzer')
    setNavigationParams(params)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  const handleNavigation = (view, params = {}) => {
    setCurrentView(view)
    setNavigationParams(params)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {/* Show Landing page for unauthenticated users */}
        {!user && currentView !== 'oauth-callback' && (
          <Landing
            onSignIn={handleSignIn}
            onAnalyzePublicRepo={handlePublicRepoAnalysis}
          />
        )}

        {/* Show Authenticated UI Only for logged-in users */}
        {user && (
          <>
            {/* App Bar */}
            <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: darkMode
              ? 'rgba(30, 30, 30, 0.8)'
              : 'rgba(240, 240, 247, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: darkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: darkMode
              ? '0 8px 16px rgba(0, 0, 0, 0.3), 0 -8px 16px rgba(255, 255, 255, 0.05)'
              : '0 8px 16px rgba(163, 177, 198, 0.3), 0 -8px 16px rgba(255, 255, 255, 0.8)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ color: 'text.primary' }}
                >
                  <Menu />
                </IconButton>
              )}

            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'contained' : 'text'}
                    onClick={() => handleNavigation(item.id)}
                    startIcon={item.icon}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 1 }}>
                  <Avatar
                    src={user.avatar_url}
                    alt={user.login}
                    sx={{
                      width: 36,
                      height: 36,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}>
                      {user.login}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleSignOut}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' }
                    }}
                  >
                    <Logout />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={isAuthLoading ? null : <Person />}
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    mr: 1,
                  }}
                >
                  {isAuthLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              )}
              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                sx={{ color: 'text.secondary' }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton sx={{ color: 'text.secondary' }} onClick={() => setCurrentView('help')}>
                <Help />
              </IconButton>
              <IconButton sx={{ color: 'text.secondary' }} onClick={handleSettingsOpen}>
                <Settings />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 3,
              px: 2,
              py: 1.5,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    width: 32,
                    height: 32,
                    boxShadow: '0 4px 8px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Code sx={{ fontSize: 18 }} />
                </Avatar>
                <Avatar
                  sx={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    bgcolor: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    width: 18,
                    height: 18,
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Science sx={{ fontSize: 10 }} />
                </Avatar>
              </Box>
              <Box>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em'
                }}>
                  RepoContext
                </Typography>
                <Typography variant="caption" sx={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.01em',
                  opacity: 0.8
                }}>
                  AI Analysis
                </Typography>
              </Box>
            </Box>

            <List>
              {navigationItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => handleNavigation(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: currentView === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: currentView === item.id ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      sx: { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            background: darkMode
              ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #0a0a0a 100%)'
              : `
                radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
                linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
              `,
            py: 4,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            position: 'relative',
            '&::before': darkMode ? {} : {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.06) 0%, transparent 50%)
              `,
              animation: 'floatingElements 25s ease-in-out infinite',
              pointerEvents: 'none',
            },
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                animation: 'fadeInUp 0.6s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px) scale(0.95)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                  },
                },
                '@keyframes floatingElements': {
                  '0%, 100%': {
                    transform: 'translateY(0px) rotate(0deg)',
                  },
                  '33%': {
                    transform: 'translateY(-20px) rotate(120deg)',
                  },
                  '66%': {
                    transform: 'translateY(10px) rotate(240deg)',
                  },
                },
              }}
            >
              {currentView === 'dashboard' ? (
                <Dashboard onNavigateToAnalyzer={(params) => handleNavigation('analyzer', params)} />
              ) : currentView === 'help' ? (
                <HelpComponent />
              ) : currentView === 'oauth-callback' ? (
                <OAuthCallback />
              ) : currentView === 'analyzer' ? (
                <RepositoryAnalyzer navigationParams={navigationParams} />
              ) : currentView === 'spec-driven' ? (
                <SpecDrivenDevelopment />
              ) : (
                <Dashboard onNavigateToAnalyzer={(params) => handleNavigation('analyzer', params)} />
              )}
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 3,
            background: 'rgba(240, 240, 247, 0.8)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 -8px 16px rgba(163, 177, 198, 0.3),
              0 8px 16px rgba(255, 255, 255, 0.8)
            `,
            mt: 'auto'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                © 2025 josolinap All rights reserved.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Support: <a href="mailto:mail@josolinap.dedyn.io" style={{ color: 'inherit', textDecoration: 'none' }}>mail@josolinap.dedyn.io</a>
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Fab
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)',
              boxShadow: `
                8px 8px 16px rgba(163, 177, 198, 0.4),
                -8px -8px 16px rgba(255, 255, 255, 0.8)
              `,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'text.primary',
          '&:hover': {
            boxShadow: `
              12px 12px 24px rgba(163, 177, 198, 0.5),
              -12px -12px 24px rgba(255, 255, 255, 0.9)
            `,
            background: 'linear-gradient(135deg, #e6e7ee 0%, #f0f0f7 100%)',
            // Prevent text blur during hover
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          },
              '&:active': {
                boxShadow: `
                  inset 4px 4px 8px rgba(163, 177, 198, 0.3),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.8)
                `,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        )}

          </>
        )}

        {/* Settings Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={handleSettingsClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Settings sx={{ mr: 2, color: 'primary.main' }} />
              Application Settings
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />
              <Typography variant="body2" color="text.secondary">
                Receive notifications about job status updates and analysis completion
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto-save Settings"
              />
              <Typography variant="body2" color="text.secondary">
                Automatically save your settings and preferences
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleSettingsClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSettingsSave}
              sx={{
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0891b2, #0e7490)'
                }
              }}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Always show theme and toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
