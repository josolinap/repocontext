/**
 * Interactive Repository Dashboard
 * Visual interface for displaying repository analysis data with charts and metrics
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  GitHub as GitHubIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const COLORS = {
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  critical: '#9C27B0'
};

const RepositoryDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [gitAnalysis, setGitAnalysis] = useState(null);
  const [dependencyAnalysis, setDependencyAnalysis] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysisForm, setAnalysisForm] = useState({
    owner: '',
    repo: '',
    githubToken: ''
  });

  // Mock data for demonstration
  const mockGitData = {
    commit_history: {
      total_commits: 1247,
      time_range: {
        first_commit: '2023-01-15T10:30:00Z',
        last_commit: '2024-01-15T14:22:00Z',
        days_active: 365
      },
      authors: [
        { author: 'john-doe', commits: 450, productivity_score: 85 },
        { author: 'jane-smith', commits: 320, productivity_score: 92 },
        { author: 'bob-wilson', commits: 280, productivity_score: 78 },
        { author: 'alice-brown', commits: 197, productivity_score: 88 }
      ],
      hot_files: [
        { filename: 'src/main.js', changes: 45, impact: 'critical' },
        { filename: 'src/utils.js', changes: 32, impact: 'high' },
        { filename: 'src/api.js', changes: 28, impact: 'high' },
        { filename: 'package.json', changes: 15, impact: 'medium' }
      ],
      development_velocity: {
        avg_commits_per_day: 3.4,
        avg_lines_per_day: 127,
        active_contributors: 4,
        development_intensity: 'high'
      }
    },
    repository_health: {
      commit_frequency_score: 85,
      contributor_diversity_score: 90,
      code_churn_score: 75,
      branch_management_score: 88,
      overall_health: 'good'
    },
    recommendations: [
      'Consider increasing test coverage for frequently modified files',
      'Good contributor diversity - maintain current collaboration patterns',
      'Monitor hot files for potential refactoring opportunities'
    ]
  };

  const mockDependencyData = {
    dependencies: [
      { name: 'react', version: '18.2.0', type: 'runtime', required: true },
      { name: 'react-dom', version: '18.2.0', type: 'runtime', required: true },
      { name: 'typescript', version: '4.9.5', type: 'development', required: false },
      { name: 'eslint', version: '8.45.0', type: 'development', required: false }
    ],
    vulnerabilities: [
      {
        package: 'old-package',
        version: '1.2.3',
        severity: 'high',
        description: 'Known security vulnerability',
        fix: 'Upgrade to version 2.0.0',
        cvss: 7.8
      }
    ],
    licenses: [
      { package: 'react', license: 'MIT', compliance: 'good', restrictions: [] },
      { package: 'some-proprietary', license: 'Proprietary', compliance: 'warning', restrictions: ['Commercial use restricted'] }
    ],
    metadata: {
      total_dependencies: 24,
      vulnerable_packages: 1,
      license_issues: 1
    }
  };

  useEffect(() => {
    // Load mock data for demonstration
    setGitAnalysis(mockGitData);
    setDependencyAnalysis(mockDependencyData);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAnalyzeRepository = async () => {
    if (!analysisForm.owner || !analysisForm.repo) {
      toast.error('Please provide both owner and repository name');
      return;
    }

    setLoading(true);
    setDialogOpen(false);

    try {
      // In a real implementation, this would call the MCP server tools
      toast.success(`Starting analysis for ${analysisForm.owner}/${analysisForm.repo}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update with mock data (in real app, this would be actual analysis results)
      setAnalysisData({
        repository: `${analysisForm.owner}/${analysisForm.repo}`,
        lastAnalyzed: new Date().toISOString(),
        ...mockGitData,
        ...mockDependencyData
      });

      toast.success('Repository analysis completed successfully!');
    } catch (error) {
      toast.error('Failed to analyze repository: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthScore = (score, label) => {
    const getColor = (score) => {
      if (score >= 80) return COLORS.success;
      if (score >= 60) return COLORS.info;
      if (score >= 40) return COLORS.warning;
      return COLORS.error;
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ minWidth: 120 }}>
          {label}:
        </Typography>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColor(score)
              }
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ minWidth: 35 }}>
          {score}%
        </Typography>
      </Box>
    );
  };

  const renderGitAnalysis = () => (
    <Grid container spacing={3}>
      {/* Repository Health Overview */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Repository Health
            </Typography>
            {renderHealthScore(gitAnalysis.repository_health.commit_frequency_score, 'Commit Frequency')}
            {renderHealthScore(gitAnalysis.repository_health.contributor_diversity_score, 'Contributor Diversity')}
            {renderHealthScore(gitAnalysis.repository_health.code_churn_score, 'Code Churn')}
            {renderHealthScore(gitAnalysis.repository_health.branch_management_score, 'Branch Management')}

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Overall Health:
              </Typography>
              <Chip
                label={gitAnalysis.repository_health.overall_health.toUpperCase()}
                color={
                  gitAnalysis.repository_health.overall_health === 'excellent' ? 'success' :
                  gitAnalysis.repository_health.overall_health === 'good' ? 'info' :
                  gitAnalysis.repository_health.overall_health === 'fair' ? 'warning' : 'error'
                }
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Development Velocity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Development Velocity
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {gitAnalysis.commit_history.development_velocity.avg_commits_per_day}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average commits per day
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Lines of code per day: <strong>{gitAnalysis.commit_history.development_velocity.avg_lines_per_day}</strong>
              </Typography>
              <Typography variant="body2">
                Active contributors: <strong>{gitAnalysis.commit_history.development_velocity.active_contributors}</strong>
              </Typography>
              <Typography variant="body2">
                Development intensity: <strong>{gitAnalysis.commit_history.development_velocity.development_intensity}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Hot Files */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hot Files (Frequently Modified)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {gitAnalysis.commit_history.hot_files.slice(0, 5).map((file, index) => (
                <Chip
                  key={index}
                  label={`${file.filename} (${file.changes} changes)`}
                  color={
                    file.impact === 'critical' ? 'error' :
                    file.impact === 'high' ? 'warning' :
                    file.impact === 'medium' ? 'info' : 'default'
                  }
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Contributor Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Contributors
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gitAnalysis.commit_history.authors.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="author" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commits" fill={COLORS.primary} name="Commits" />
                <Bar dataKey="productivity_score" fill={COLORS.secondary} name="Productivity Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Commit Activity */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commit Activity
            </Typography>
            <Typography variant="h4" color="primary">
              {gitAnalysis.commit_history.total_commits}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total commits analyzed
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Active days: <strong>{gitAnalysis.commit_history.time_range.days_active}</strong>
              </Typography>
              <Typography variant="body2">
                First commit: <strong>{new Date(gitAnalysis.commit_history.time_range.first_commit).toLocaleDateString()}</strong>
              </Typography>
              <Typography variant="body2">
                Last commit: <strong>{new Date(gitAnalysis.commit_history.time_range.last_commit).toLocaleDateString()}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDependencyAnalysis = () => (
    <Grid container spacing={3}>
      {/* Dependency Overview */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dependency Overview
            </Typography>
            <Typography variant="h4" color="primary">
              {dependencyAnalysis.metadata.total_dependencies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total dependencies
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Runtime: <strong>{dependencyAnalysis.dependencies.filter(d => d.type === 'runtime').length}</strong>
              </Typography>
              <Typography variant="body2">
                Development: <strong>{dependencyAnalysis.dependencies.filter(d => d.type === 'development').length}</strong>
              </Typography>
              <Typography variant="body2">
                Vulnerabilities: <strong>{dependencyAnalysis.metadata.vulnerable_packages}</strong>
              </Typography>
              <Typography variant="body2">
                License Issues: <strong>{dependencyAnalysis.metadata.license_issues}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Security Status */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Security Status
            </Typography>

            {dependencyAnalysis.vulnerabilities.length > 0 ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dependencyAnalysis.vulnerabilities.length} vulnerabilities found
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                No vulnerabilities detected
              </Alert>
            )}

            {dependencyAnalysis.vulnerabilities.slice(0, 3).map((vuln, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {vuln.package} ({vuln.severity})
                </Typography>
                <Typography variant="body2">
                  {vuln.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fix: {vuln.fix}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* License Compliance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              License Compliance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Good', value: dependencyAnalysis.licenses.filter(l => l.compliance === 'good').length },
                    { name: 'Warning', value: dependencyAnalysis.licenses.filter(l => l.compliance === 'warning').length },
                    { name: 'Error', value: dependencyAnalysis.licenses.filter(l => l.compliance === 'error').length },
                    { name: 'Unknown', value: dependencyAnalysis.licenses.filter(l => l.compliance === 'unknown').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={COLORS.success} />
                  <Cell fill={COLORS.warning} />
                  <Cell fill={COLORS.error} />
                  <Cell fill="#9E9E9E" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Dependencies */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Dependencies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dependencyAnalysis.dependencies.slice(0, 10).map((dep, index) => (
                <Chip
                  key={index}
                  label={`${dep.name}@${dep.version}`}
                  color={dep.type === 'runtime' ? 'primary' : 'secondary'}
                  variant="outlined"
                  icon={dep.required ? <CheckCircleIcon /> : <InfoIcon />}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRecommendations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recommendations
            </Typography>

            {gitAnalysis.recommendations.map((rec, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {rec}
              </Alert>
            ))}

            {dependencyAnalysis.vulnerabilities.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Security vulnerabilities detected - please review and update vulnerable packages
              </Alert>
            )}

            {dependencyAnalysis.metadata.license_issues > 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                License compliance issues found - review package licenses for compatibility
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          <GitHubIcon sx={{ mr: 2, fontSize: 40, verticalAlign: 'middle' }} />
          Repository Analysis Dashboard
        </Typography>

        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          startIcon={<AssessmentIcon />}
        >
          Analyze Repository
        </Button>
      </Box>

      {loading && (
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Analyzing repository...
          </Typography>
        </Box>
      )}

      {analysisData && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Git Analysis" />
            <Tab label="Dependencies" />
            <Tab label="Recommendations" />
          </Tabs>
        </Box>
      )}

      {analysisData ? (
        <>
          {activeTab === 0 && renderGitAnalysis()}
          {activeTab === 1 && renderDependencyAnalysis()}
          {activeTab === 2 && renderRecommendations()}
        </>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <GitHubIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Repository Analyzed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Click "Analyze Repository" to start analyzing a GitHub repository and view detailed insights.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setDialogOpen(true)}
              startIcon={<AssessmentIcon />}
            >
              Analyze Repository
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Analyze GitHub Repository</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Repository Owner"
            fullWidth
            variant="outlined"
            value={analysisForm.owner}
            onChange={(e) => setAnalysisForm({ ...analysisForm, owner: e.target.value })}
            placeholder="e.g., facebook"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Repository Name"
            fullWidth
            variant="outlined"
            value={analysisForm.repo}
            onChange={(e) => setAnalysisForm({ ...analysisForm, repo: e.target.value })}
            placeholder="e.g., react"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="GitHub Token (Optional)"
            fullWidth
            variant="outlined"
            type="password"
            value={analysisForm.githubToken}
            onChange={(e) => setAnalysisForm({ ...analysisForm, githubToken: e.target.value })}
            placeholder="For private repositories"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAnalyzeRepository} variant="contained">
            Analyze
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RepositoryDashboard;
