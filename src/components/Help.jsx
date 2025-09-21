import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  GitHub as GitHubIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Web as WebIcon,
  Api as ApiIcon,
  Book as BookIcon
} from '@mui/icons-material'

const Help = () => {
  const [expanded, setExpanded] = useState('getting-started')

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const faqs = [
    {
      id: 'getting-started',
      question: 'How do I get started with RepoContext?',
      answer: 'First, you need a GitHub Personal Access Token. Click the "Create a Personal Access Token" link to go to GitHub and create one with "repo" scope. Then paste your token in the GitHub Configuration section and click "Load Repositories" to start analyzing your repositories.'
    },
    {
      id: 'templates',
      question: 'What are templates and how do I use them?',
      answer: 'Templates are predefined formats for generating context files. Each template focuses on different aspects of your repository. Choose a template that matches your needs, then click "Generate Context" to create a comprehensive context file that AI assistants can use to understand your project.'
    },
    {
      id: 'custom-templates',
      question: 'Can I create my own templates?',
      answer: 'Yes! Click "Manage Templates" to open the Template Manager. You can create custom templates by defining sections, choosing icons, and setting descriptions. Your custom templates are saved locally and will be available for all your future analyses.'
    },
    {
      id: 'job-history',
      question: 'How do I view my analysis history?',
      answer: 'Click on "Job History" from the Dashboard or use the "View History" button in the Repository Analyzer. You can see all your past analyses, re-analyze repositories, and export your history data.'
    },
    {
      id: 'token-security',
      question: 'Is my GitHub token secure?',
      answer: 'Your GitHub token is stored locally in your browser\'s localStorage and is never sent to any external servers. It\'s only used to make API calls directly to GitHub from your browser. You can clear it anytime by removing it from the GitHub Configuration section.'
    },
    {
      id: 'export-data',
      question: 'How do I export my data?',
      answer: 'You can export your job history as JSON, custom templates as JSON, and generated context files as Markdown. Look for the "Export" buttons in the respective sections.'
    }
  ]

  const templateGuide = [
    {
      icon: <DescriptionIcon sx={{ color: 'primary.main' }} />,
      name: 'Comprehensive Analysis',
      description: 'Complete repository overview with all details',
      useCase: 'Perfect for new team members or comprehensive project documentation'
    },
    {
      icon: <CodeIcon sx={{ color: 'secondary.main' }} />,
      name: 'Technical Specs',
      description: 'Focus on technical details and dependencies',
      useCase: 'Ideal for developers working on integration or maintenance'
    },
    {
      icon: <SecurityIcon sx={{ color: 'error.main' }} />,
      name: 'Security Analysis',
      description: 'Security vulnerabilities and best practices',
      useCase: 'Essential for security audits and compliance reviews'
    },
    {
      icon: <SpeedIcon sx={{ color: 'warning.main' }} />,
      name: 'Performance Guide',
      description: 'Performance optimization and monitoring',
      useCase: 'Great for performance tuning and optimization tasks'
    },
    {
      icon: <BugReportIcon sx={{ color: 'info.main' }} />,
      name: 'Testing Strategy',
      description: 'Testing frameworks and coverage guidelines',
      useCase: 'Perfect for QA teams and testing strategy planning'
    },
    {
      icon: <BuildIcon sx={{ color: 'success.main' }} />,
      name: 'Deployment Guide',
      description: 'CI/CD pipelines and deployment strategies',
      useCase: 'Essential for DevOps and deployment automation'
    },
    {
      icon: <WebIcon sx={{ color: 'primary.main' }} />,
      name: 'Mobile Development',
      description: 'Mobile-specific development guidelines',
      useCase: 'For mobile app development and cross-platform projects'
    },
    {
      icon: <ApiIcon sx={{ color: 'secondary.main' }} />,
      name: 'API Design',
      description: 'RESTful API design and documentation',
      useCase: 'Perfect for API development and integration work'
    }
  ]

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #0a0a0a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            ❓ Help & Documentation
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Everything you need to know about RepoContext
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Quick Start Guide */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Quick Start Guide</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      🚀 Getting Started in 3 Steps
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontSize: '1.5rem' }}>1️⃣</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Create GitHub Token"
                          secondary="Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token with 'repo' scope"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontSize: '1.5rem' }}>2️⃣</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Configure RepoContext"
                          secondary="Paste your token in the GitHub Configuration section and click 'Load Repositories'"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontSize: '1.5rem' }}>3️⃣</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Start Analyzing"
                          secondary="Select a repository, choose a template, and generate your context file"
                        />
                      </ListItem>
                    </List>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      🎯 Key Features
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GitHubIcon sx={{ color: 'primary.main' }} />
                          <Typography variant="body2">GitHub Integration</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon sx={{ color: 'secondary.main' }} />
                          <Typography variant="body2">Context Generation</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SettingsIcon sx={{ color: 'success.main' }} />
                          <Typography variant="body2">Custom Templates</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AnalyticsIcon sx={{ color: 'warning.main' }} />
                          <Typography variant="body2">Job History</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Template Guide */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Template Guide</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {templateGuide.map((template, index) => (
                    <Card
                      key={index}
                      sx={{
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'linear-gradient(135deg, #f0f0f7 0%, #e6e7ee 100%)'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {template.icon}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {template.description}
                            </Typography>
                            <Chip
                              label={template.useCase}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* FAQ Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Frequently Asked Questions</Typography>
                  </Box>
                }
              />
              <CardContent>
                {faqs.map((faq) => (
                  <Accordion
                    key={faq.id}
                    expanded={expanded === faq.id}
                    onChange={handleChange(faq.id)}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.05)'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Typography variant="body1" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Tips & Tricks */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>💡</Typography>
                    <Typography variant="h6">Tips & Best Practices</Typography>
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
                        🎯 Template Selection
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose templates based on your audience. Use 'Technical Specs' for developers, 'Security Analysis' for security teams, and 'Documentation Template' for end-users.
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
                        🔄 Regular Updates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Re-analyze repositories periodically to keep your AI assistants updated with the latest changes, new features, and architectural improvements.
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
                        📊 Data Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Export your job history and custom templates regularly. This ensures you don't lose your work and can migrate settings between devices.
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

export default Help
