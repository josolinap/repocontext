import { createTheme } from '@mui/material'

// Custom neumorphic/glassmorphism theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff'
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(255, 255, 255, 0.05)'
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#d1d5db'
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #6366f1, #4f46e5, #10b981)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#e5e7eb'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#d1d5db'
    }
  },
  components: {
    // Custom component overrides for neumorphic/glassmorphism
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          minHeight: '100vh',
          overflowX: 'hidden'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: `
            12px 12px 24px rgba(0, 0, 0, 0.3),
            -12px -12px 24px rgba(255, 255, 255, 0.05)
          `,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transition: 'left 0.5s'
          },
          '&:hover::before': {
            left: '100%'
          }
        },
        contained: {
          background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
          color: '#ffffff',
          boxShadow: `
            6px 6px 12px rgba(0, 0, 0, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.05),
            inset 2px 2px 4px rgba(255, 255, 255, 0.1)
          `,
          '&:hover': {
            background: 'linear-gradient(145deg, #4f46e5, #4338ca)',
            transform: 'translateY(-2px)',
            boxShadow: `
              8px 8px 16px rgba(0, 0, 0, 0.4),
              -8px -8px 16px rgba(255, 255, 255, 0.1),
              inset 2px 2px 4px rgba(255, 255, 255, 0.1)
            `
          }
        },
        outlined: {
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e5e7eb',
          backdropFilter: 'blur(10px)',
          boxShadow: `
            4px 4px 8px rgba(0, 0, 0, 0.3),
            -4px -4px 8px rgba(255, 255, 255, 0.05)
          `,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            color: '#e5e7eb',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `
              inset 4px 4px 8px rgba(0, 0, 0, 0.3),
              inset -4px -4px 8px rgba(255, 255, 255, 0.05)
            `,
            '& fieldset': {
              border: '1px solid rgba(255, 255, 255, 0.1)'
            },
            '&:hover fieldset': {
              border: '1px solid rgba(255, 255, 255, 0.2)'
            },
            '&.Mui-focused fieldset': {
              border: '2px solid #6366f1',
              boxShadow: `
                inset 6px 6px 12px rgba(0, 0, 0, 0.4),
                inset -6px -6px 12px rgba(255, 255, 255, 0.1),
                0 0 0 2px rgba(99, 102, 241, 0.3)
              `
            },
            '&.Mui-focused': {
              transform: 'scale(1.02)'
            }
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
            '&.Mui-focused': {
              color: '#6366f1'
            }
          },
          '& .MuiOutlinedInput-input': {
            '&::placeholder': {
              color: '#9ca3af',
              opacity: 1
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          color: '#e5e7eb',
          boxShadow: `
            inset 4px 4px 8px rgba(0, 0, 0, 0.3),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05)
          `,
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(255, 255, 255, 0.1)'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(255, 255, 255, 0.2)'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '2px solid #6366f1',
            boxShadow: `
              inset 6px 6px 12px rgba(0, 0, 0, 0.4),
              inset -6px -6px 12px rgba(255, 255, 255, 0.1),
              0 0 0 2px rgba(99, 102, 241, 0.3)
            `
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: `
            12px 12px 24px rgba(0, 0, 0, 0.3),
            -12px -12px 24px rgba(255, 255, 255, 0.05)
          `,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `
              16px 16px 32px rgba(0, 0, 0, 0.4),
              -16px -16px 32px rgba(255, 255, 255, 0.1)
          `
          }
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          '& .MuiCardHeader-title': {
            color: '#ffffff',
            fontWeight: 600
          },
          '& .MuiCardHeader-subheader': {
            color: '#d1d5db'
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&.MuiChip-colorPrimary': {
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: `
              2px 2px 4px rgba(0, 0, 0, 0.3),
              -2px -2px 4px rgba(99, 102, 241, 0.1)
            `
          },
          '&.MuiChip-colorSecondary': {
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: `
              2px 2px 4px rgba(0, 0, 0, 0.3),
              -2px -2px 4px rgba(16, 185, 129, 0.1)
            `
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          boxShadow: `
            inset 2px 2px 4px rgba(0, 0, 0, 0.3),
            inset -2px -2px 4px rgba(255, 255, 255, 0.05)
          `
        },
        bar: {
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          borderRadius: '8px',
          boxShadow: `
            2px 2px 4px rgba(0, 0, 0, 0.3),
            -2px -2px 4px rgba(255, 255, 255, 0.05)
          `
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6366f1'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: '#e5e7eb'
        },
        standardInfo: {
          background: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: '#3b82f6'
        },
        standardSuccess: {
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981'
        },
        standardWarning: {
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b'
        },
        standardError: {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444'
        }
      }
    }
  },
  shape: {
    borderRadius: 12
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  }
})

export default theme
