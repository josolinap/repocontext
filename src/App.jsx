import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { Button, Box, Container, Typography, Paper, Avatar, Chip, Fab } from '@mui/material'
import { Analytics, Description, Menu, GitHub, Settings, Help, KeyboardArrowUp, Code, Science } from '@mui/icons-material'

// Components
import Dashboard from './components/Dashboard'
import RepositoryAnalyzer from './components/RepositoryAnalyzer'
import HelpComponent from './components/Help'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const theme = createTheme({
  palette: {
    mode: 'light',
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
    background: {
      default: '#e6e7ee',
      paper: '#f0f0f7',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.009em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 40% 120%, rgba(120, 219, 226, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f8fafc 75%, #f1f5f9 100%)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '400% 400%',
          animation: 'subtleGradientShift 20s ease-in-out infinite',
          // Enhanced text rendering for crisp display
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"kern" 1, "liga" 1',
          // Prevent text blur during selection
          '*::selection': {
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'inherit',
            textShadow: 'none',
          },
          '*::-moz-selection': {
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'inherit',
            textShadow: 'none',
          },
        },
        '@keyframes subtleGradientShift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        // Fix backdrop filter text blur
        '[style*="backdrop-filter"]': {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"kern" 1, "liga" 1',
        },
        // Ensure text stays crisp during animations
        '*': {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"kern" 1, "liga" 1',
          // Prevent text blur during transforms
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // Enhanced focus states
          '&:focus-visible': {
            outline: '2px solid #6366f1',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 16,
          padding: '12px 24px',
          boxShadow: `
            8px 8px 16px rgba(163, 177, 198, 0.6),
            -8px -8px 16px rgba(255, 255, 255, 0.8)
          `,
          border: 'none',
          background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)',
          transition: 'box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          // Prevent text blur during animations
          WebkitFontSmoothing: 'subpixel-antialiased',
          MozOsxFontSmoothing: 'auto',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          '&:hover': {
            boxShadow: `
              12px 12px 24px rgba(163, 177, 198, 0.8),
              -12px -12px 24px rgba(255, 255, 255, 0.9),
              inset 2px 2px 4px rgba(255, 255, 255, 0.2)
            `,
            // Remove transform to prevent text blur
            WebkitFontSmoothing: 'subpixel-antialiased',
            MozOsxFontSmoothing: 'auto',
          },
          '&:active': {
            boxShadow: `
              inset 4px 4px 8px rgba(163, 177, 198, 0.4),
              inset -4px -4px 8px rgba(255, 255, 255, 0.8)
            `,
            transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
            WebkitFontSmoothing: 'subpixel-antialiased',
            MozOsxFontSmoothing: 'auto',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: `
            8px 8px 16px rgba(99, 102, 241, 0.3),
            -8px -8px 16px rgba(139, 92, 246, 0.1),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2)
          `,
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: `
              12px 12px 24px rgba(99, 102, 241, 0.4),
              -12px -12px 24px rgba(139, 92, 246, 0.2),
              inset 2px 2px 4px rgba(255, 255, 255, 0.3)
            `,
            // Remove transform to prevent text blur
            WebkitFontSmoothing: 'subpixel-antialiased',
            MozOsxFontSmoothing: 'auto',
          },
          '&:active': {
            boxShadow: `
              inset 6px 6px 12px rgba(99, 102, 241, 0.3),
              inset -6px -6px 12px rgba(139, 92, 246, 0.1)
            `,
            transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
            WebkitFontSmoothing: 'subpixel-antialiased',
            MozOsxFontSmoothing: 'auto',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: `
            20px 20px 40px rgba(163, 177, 198, 0.4),
            -20px -20px 40px rgba(255, 255, 255, 0.9),
            inset 1px 1px 2px rgba(255, 255, 255, 0.3)
          `,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #f0f0f7 0%, #e8e9f0 100%)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: `
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.6)
          `,
          border: '1px solid rgba(255, 255, 255, 0.18)',
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(248, 250, 252, 0.8) 25%,
              rgba(241, 245, 249, 0.9) 50%,
              rgba(248, 250, 252, 0.8) 75%,
              rgba(255, 255, 255, 0.9) 100%
            )
          `,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          position: 'relative',
          transform: 'translateZ(0)',
          willChange: 'transform, box-shadow',
          cursor: 'pointer',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(135deg,
                rgba(99, 102, 241, 0.03) 0%,
                rgba(139, 92, 246, 0.02) 50%,
                rgba(16, 185, 129, 0.02) 100%
              )
            `,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none',
          },
          '&:hover': {
            boxShadow: `
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              0 0 0 1px rgba(99, 102, 241, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            '&::before': {
              opacity: 1,
            },
            '&::after': {
              left: '100%',
            },
            // Prevent text blur during hover
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          },
          '&:active': {
            transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            // Prevent text blur during active state
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(240, 240, 247, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 8px 16px rgba(163, 177, 198, 0.3),
            0 -8px 16px rgba(255, 255, 255, 0.8)
          `,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)',
            boxShadow: `
              inset 4px 4px 8px rgba(163, 177, 198, 0.2),
              inset -4px -4px 8px rgba(255, 255, 255, 0.8)
            `,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              boxShadow: `
                inset 6px 6px 12px rgba(163, 177, 198, 0.3),
                inset -6px -6px 12px rgba(255, 255, 255, 0.9)
              `,
            },
            '&.Mui-focused': {
              boxShadow: `
                inset 6px 6px 12px rgba(163, 177, 198, 0.4),
                inset -6px -6px 12px rgba(255, 255, 255, 0.9),
                0 0 0 2px rgba(99, 102, 241, 0.2)
              `,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)',
          boxShadow: `
            4px 4px 8px rgba(163, 177, 198, 0.3),
            -4px -4px 8px rgba(255, 255, 255, 0.8)
          `,
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)',
          boxShadow: `
            8px 8px 16px rgba(163, 177, 198, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.8)
          `,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
          willChange: 'transform, box-shadow',
          '&:hover': {
            boxShadow: `
              12px 12px 24px rgba(163, 177, 198, 0.5),
              -12px -12px 24px rgba(255, 255, 255, 0.9)
            `,
            transform: 'scale(1.15) translateZ(0)',
          },
          '&:active': {
            boxShadow: `
              inset 4px 4px 8px rgba(163, 177, 198, 0.3),
              inset -4px -4px 8px rgba(255, 255, 255, 0.8)
            `,
            transform: 'scale(1.05) translateZ(0)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'transparent',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.1) translateZ(0)',
            boxShadow: `
              4px 4px 8px rgba(163, 177, 198, 0.3),
              -4px -4px 8px rgba(255, 255, 255, 0.8)
            `,
          },
          '&:active': {
            transform: 'scale(0.95) translateZ(0)',
            transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 0',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateX(8px) translateZ(0)',
            boxShadow: `
              4px 4px 8px rgba(163, 177, 198, 0.2),
              -4px -4px 8px rgba(255, 255, 255, 0.8)
            `,
          },
          '&:active': {
            transform: 'translateX(4px) scale(0.98) translateZ(0)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
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
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

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
    { id: 'dashboard', label: 'Dashboard', icon: <Analytics />, description: 'Overview and statistics' },
    { id: 'analyzer', label: 'Repository Analyzer', icon: <Description />, description: 'Analyze GitHub repositories' },
  ]

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
        {/* App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(240, 240, 247, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 8px 16px rgba(163, 177, 198, 0.3),
              0 -8px 16px rgba(255, 255, 255, 0.8)
            `,
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
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: 3,
                px: 2,
                py: 1,
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)'
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      width: 36,
                      height: 36,
                      boxShadow: '0 4px 8px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Code sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Avatar
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      bgcolor: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      width: 20,
                      height: 20,
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Science sx={{ fontSize: 12 }} />
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}>
                    RepoContext
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    letterSpacing: '0.01em'
                  }}>
                    AI-Powered Analysis
                  </Typography>
                </Box>
              </Box>
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
              <Chip
                label="v1.0.0"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            <IconButton sx={{ color: 'text.secondary' }} onClick={() => setCurrentView('help')}>
              <Help />
            </IconButton>
              <IconButton sx={{ color: 'text.secondary' }}>
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
            background: `
              radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
              linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
            `,
            py: 4,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            position: 'relative',
            '&::before': {
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
              ) : (
                <RepositoryAnalyzer navigationParams={navigationParams} />
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
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHub sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Built with React & Material-UI
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  Privacy
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  Terms
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  Support
                </Typography>
              </Box>
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
