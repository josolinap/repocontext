/**
 * Enterprise Dashboard Component
 * Professional dashboard with analytics, real-time updates, and enterprise features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, CardHeader,
  Avatar, Chip, Button, IconButton, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  FormControl, InputLabel, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  Alert, Snackbar, Badge, Tooltip, Divider, List, ListItem,
  ListItemText, ListItemIcon, Collapse, Switch, FormControlLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Integration as IntegrationIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Cloud as CloudIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Shield as ShieldIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon
} from '@mui/icons-material';

const EnterpriseDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRepositories: 0,
      activeAnalyses: 0,
      securityScore: 0,
      complianceScore: 0,
      recentActivity: []
    },
    analytics: {
      repositoryHealth: [],
      teamPerformance: [],
      securityMetrics: [],
      integrationStatus: []
    },
    security: {
      alerts: [],
      compliance: [],
      auditLogs: [],
      userActivity: []
    },
    integrations: {
      connected: [],
      pending: [],
      failed: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [showRepositoryDialog, setShowRepositoryDialog] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // This would integrate with the backend APIs
      // For demo purposes, we'll simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDashboardData({
        overview: {
          totalRepositories: 47,
          activeAnalyses: 12,
          securityScore: 87,
          complianceScore: 92,
          recentActivity: [
            { type: 'analysis_completed', repository: 'user/repo1', time: '2 minutes ago' },
            { type: 'security_alert', repository: 'user/repo2', time: '5 minutes ago' },
            { type: 'integration_connected', service: 'Jira', time: '10 minutes ago' },
            { type: 'deployment_success', repository: 'user/repo3', time: '15 minutes ago' }
          ]
        },
        analytics: {
          repositoryHealth: [
            { name: 'Excellent', count: 23, color: '#4caf50' },
            { name: 'Good', count: 18, color: '#2196f3' },
            { name: 'Fair', count: 4, color: '#ff9800' },
            { name: 'Poor', count: 2, color: '#f44336' }
          ],
          teamPerformance: [
            { team: 'Frontend', score: 89, trend: 'up' },
            { team: 'Backend', score: 92, trend: 'up' },
            { team: 'DevOps', score: 95, trend: 'stable' },
            { team: 'QA', score: 87, trend: 'up' }
          ],
          securityMetrics: [
            { metric: 'Vulnerabilities', value: 23, status: 'low' },
            { metric: 'Code Quality', value: 87, status: 'good' },
            { metric: 'Dependencies', value: 156, status: 'medium' },
            { metric: 'Access Control', value: 94, status: 'excellent' }
          ],
          integrationStatus: [
            { service: 'GitHub', status: 'connected', lastSync: '2 minutes ago' },
            { service: 'Jira', status: 'connected', lastSync: '5 minutes ago' },
            { service: 'Slack', status: 'connected', lastSync: '1 hour ago' },
            { service: 'Linear', status: 'error', lastSync: '2 hours ago' }
          ]
        },
        security: {
          alerts: [
            { id: 1, type: 'high', title: 'Critical vulnerability detected', repository: 'user/repo1', time: '10 minutes ago' },
            { id: 2, type: 'medium', title: 'Outdated dependency', repository: 'user/repo2', time: '1 hour ago' },
            { id: 3, type: 'low', title: 'Code quality issue', repository: 'user/repo3', time: '2 hours ago' }
          ],
          compliance: [
            { standard: 'SOC2', score: 95, status: 'compliant' },
            { standard: 'GDPR', score: 88, status: 'minor_issues' },
            { standard: 'HIPAA', score: 92, status: 'compliant' },
            { standard: 'ISO27001', score: 90, status: 'compliant' }
          ],
          auditLogs: [
            { event: 'User login', user: 'admin', time: '5 minutes ago', ip: '192.168.1.100' },
            { event: 'Repository analysis', user: 'user1', time: '10 minutes ago', repository: 'user/repo1' },
            { event: 'Security scan', user: 'system', time: '15 minutes ago', repository: 'user/repo2' }
          ],
          userActivity: [
            { user: 'admin', actions: 45, lastActive: '2 minutes ago' },
            { user: 'user1', actions: 23, lastActive: '5 minutes ago' },
            { user: 'user2', actions: 12, lastActive: '1 hour ago' }
          ]
        },
        integrations: {
          connected: [
            { name: 'GitHub', type: 'Version Control', status: 'connected' },
            { name: 'Jira', type: 'Issue Tracking', status: 'connected' },
            { name: 'Slack', type: 'Communication', status: 'connected' },
            { name: 'GitHub Actions', type: 'CI/CD', status: 'connected' }
          ],
          pending: [
            { name: 'Linear', type: 'Issue Tracking', status: 'pending' },
            { name: 'Asana', type: 'Project Management', status: 'pending' }
          ],
          failed: [
            { name: 'Jenkins', type: 'CI/CD', status: 'error', error: 'Authentication failed' }
          ]
        }
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle repository dialog
  const handleRepositoryDialogOpen = () => {
    setShowRepositoryDialog(true);
  };

  const handleRepositoryDialogClose = () => {
    setShowRepositoryDialog(false);
  };

  // Handle card expansion
  const handleCardExpand = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Render overview cards
  const renderOverviewCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Repositories
                </Typography>
                <Typography variant="h3">
                  {dashboardData.overview.totalRepositories}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>
                <CodeIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Active Analyses
                </Typography>
                <Typography variant="h3">
                  {dashboardData.overview.activeAnalyses}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#388e3c', width: 56, height: 56 }}>
                <AssessmentIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Security Score
                </Typography>
                <Typography variant="h3">
                  {dashboardData.overview.securityScore}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f57c00', width: 56, height: 56 }}>
                <ShieldIcon />
              </Avatar>
            </Box>
            <LinearProgress
              variant="determinate"
              value={dashboardData.overview.securityScore}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Compliance Score
                </Typography>
                <Typography variant="h3">
                  {dashboardData.overview.complianceScore}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#7b1fa2', width: 56, height: 56 }}>
                <VpnKeyIcon />
              </Avatar>
            </Box>
            <LinearProgress
              variant="determinate"
              value={dashboardData.overview.complianceScore}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render analytics charts
  const renderAnalyticsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Repository Health Distribution"
            action={
              <IconButton onClick={() => handleCardExpand('health')}>
                {expandedCards.health ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
          />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              {dashboardData.analytics.repositoryHealth.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={2}>
                  <Box width={100}>
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                  <Box flex={1}>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / 47) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: item.color
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" width={40}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Team Performance" />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.analytics.teamPerformance.map((team, index) => (
                    <TableRow key={index}>
                      <TableCell>{team.team}</TableCell>
                      <TableCell align="right">{team.score}%</TableCell>
                      <TableCell align="right">
                        <TrendingUpIcon
                          color={team.trend === 'up' ? 'success' : 'action'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render security section
  const renderSecuritySection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Security Alerts" />
          <CardContent>
            <List>
              {dashboardData.security.alerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemIcon>
                    {alert.type === 'high' && <ErrorIcon color="error" />}
                    {alert.type === 'medium' && <WarningIcon color="warning" />}
                    {alert.type === 'low' && <InfoIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={`${alert.repository} • ${alert.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Compliance Status" />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Standard</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.security.compliance.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.standard}</TableCell>
                      <TableCell align="right">{item.score}%</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.status.replace('_', ' ')}
                          color={
                            item.status === 'compliant' ? 'success' :
                            item.status === 'minor_issues' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render integrations section
  const renderIntegrationsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Connected Services" />
          <CardContent>
            <List dense>
              {dashboardData.integrations.connected.map((service, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={service.name}
                    secondary={service.type}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Pending Setup" />
          <CardContent>
            <List dense>
              {dashboardData.integrations.pending.map((service, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={service.name}
                    secondary={service.type}
                  />
                  <Button size="small" variant="outlined">
                    Setup
                  </Button>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Failed Connections" />
          <CardContent>
            <List dense>
              {dashboardData.integrations.failed.map((service, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={service.name}
                    secondary={service.error}
                  />
                  <Button size="small" variant="outlined" color="error">
                    Retry
                  </Button>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render recent activity
  const renderRecentActivity = () => (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }
      />
      <CardContent>
        <List>
          {dashboardData.overview.recentActivity.map((activity, index) => (
            <ListItem key={index} divider>
              <ListItemIcon>
                {activity.type === 'analysis_completed' && <AssessmentIcon color="success" />}
                {activity.type === 'security_alert' && <WarningIcon color="warning" />}
                {activity.type === 'integration_connected' && <CheckCircleIcon color="success" />}
                {activity.type === 'deployment_success' && <CloudIcon color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  activity.type === 'analysis_completed' ? `Analysis completed for ${activity.repository}` :
                  activity.type === 'security_alert' ? `Security alert in ${activity.repository}` :
                  activity.type === 'integration_connected' ? `${activity.service} integration connected` :
                  `Deployment successful for ${activity.repository}`
                }
                secondary={activity.time}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading enterprise dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load dashboard: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Enterprise Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleRepositoryDialogOpen}
          >
            Add Repository
          </Button>
          <IconButton onClick={handleUserMenuOpen}>
            <AccountIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {renderOverviewCards()}
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {renderAnalyticsSection()}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderRecentActivity()}
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {activeTab === 1 && renderAnalyticsSection()}

      {activeTab === 2 && renderSecuritySection()}

      {activeTab === 3 && renderIntegrationsSection()}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Settings panel would be implemented here with user preferences,
            notification settings, integration configurations, etc.
          </Typography>
        </Box>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><AccountIcon /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><NotificationsIcon /></ListItemIcon>
          Notifications
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><SecurityIcon /></ListItemIcon>
          Security
        </MenuItem>
      </Menu>

      {/* Repository Dialog */}
      <Dialog open={showRepositoryDialog} onClose={handleRepositoryDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Repository</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Repository URL"
            placeholder="https://github.com/user/repo"
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Platform</InputLabel>
            <Select label="Platform">
              <MenuItem value="github">GitHub</MenuItem>
              <MenuItem value="gitlab">GitLab</MenuItem>
              <MenuItem value="bitbucket">Bitbucket</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch />}
            label="Enable real-time analysis"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRepositoryDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleRepositoryDialogClose}>
            Add Repository
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnterpriseDashboard;
