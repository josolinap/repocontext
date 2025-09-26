/**
 * Code Critic Component
 * Integrates with external code analysis service for code review and critique
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
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

// Import enhanced code editor and markdown renderer (inspired by original)
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

// Import styles for syntax highlighting
import "prismjs/themes/prism-tomorrow.css";
import "highlight.js/styles/github-dark.css";

// Import the Code Critic service
import {
  analyzeCode,
  getRepositoryFileContent,
  validateRepositoryAccess,
  getRepositoryFileTree,
  getUserRepositories,
  testWorkerConnection,
  testCodeAnalysis,
  getAvailableModels,
  analyzeCodeWithModel
} from '../lib/codeCriticService';

const COLORS = {
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  critical: '#9C27B0'
};

const CodeCritic = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [userRepos, setUserRepos] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Enhanced code editor state (inspired by original Code Critic)
  const [directCode, setDirectCode] = useState(`// Type your code here...

function exampleFunction() {
  console.log("Hello, Code Critic!");

  // This is a sample function
  const result = "Code analysis will identify issues and suggestions";

  return result;
}`);
  const [directAnalysisResult, setDirectAnalysisResult] = useState('');
  const [analyzingDirectCode, setAnalyzingDirectCode] = useState(false);

  // Model selection state
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [availableModels] = useState({
    'gemini-2.0-flash': {
      name: 'Gemini 2.0 Flash',
      description: 'Fast and efficient for code analysis',
      maxTokens: 8192
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      description: 'High quality analysis with larger context',
      maxTokens: 16384
    },
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      description: 'Balanced performance and quality',
      maxTokens: 8192
    }
  });

  useEffect(() => {
    // Load user repositories from GitHub
    loadUserRepositories();
  }, []);

  const loadUserRepositories = async () => {
    try {
      // Get GitHub token from localStorage or authentication
      const githubToken = localStorage.getItem('github_token');
      if (githubToken) {
        const repos = await getUserRepositories(githubToken);
        setUserRepos(repos);
      } else {
        // Fallback to mock data if no token
        const mockUserRepos = [
          { name: 'my-react-app', full_name: 'user/my-react-app', private: false },
          { name: 'api-backend', full_name: 'user/api-backend', private: true },
          { name: 'data-processor', full_name: 'user/data-processor', private: false },
          { name: 'ml-models', full_name: 'user/ml-models', private: true }
        ];
        setUserRepos(mockUserRepos);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
      toast.error('Failed to load repositories');
    }
  };

  const handleRepoSelect = async (repoFullName) => {
    setSelectedRepo(repoFullName);
    setLoading(true);
    setValidationStatus(null);

    try {
      // Parse owner and repo from full name
      const [owner, repo] = repoFullName.split('/');

      // Validate repository access
      const githubToken = localStorage.getItem('github_token');
      const validation = await validateRepositoryAccess(owner, repo, githubToken);

      if (validation.valid) {
        setValidationStatus('valid');

        // Load file tree
        const fileTree = await getRepositoryFileTree(owner, repo, githubToken);
        setFileTree(fileTree);

        toast.success(`Repository ${repoFullName} validated successfully!`);
      } else {
        setValidationStatus('invalid');
        toast.error(`Failed to validate repository: ${validation.error}`);
      }
    } catch {
      setValidationStatus('invalid');
      toast.error('Failed to validate repository');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);

    try {
      // Parse owner and repo from selected repository
      const [owner, repo] = selectedRepo.split('/');

      // Get file content
      const githubToken = localStorage.getItem('github_token');
      const fileContent = await getRepositoryFileContent(owner, repo, file.path, githubToken);

      // Analyze the code
      const customApiKey = useCustomApiKey ? localStorage.getItem('codeCriticApiKey') : null;
      const analysisResult = await analyzeCode(fileContent, customApiKey);

      setAnalysisResult({
        ...analysisResult,
        file: file.path,
        fileName: file.name
      });

      toast.success(`Analysis completed for ${file.name}`);
    } catch (error) {
      console.error('Failed to analyze file:', error);
      toast.error(`Failed to analyze file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('codeCriticApiKey', apiKey);
      toast.success('API key saved successfully');
      setSettingsOpen(false);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const result = await testWorkerConnection();
      setTestResult(result);

      if (result.success) {
        toast.success('Worker connection successful!');
      } else {
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      setTestResult({
        success: false,
        error: error.message
      });
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestAnalysis = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const result = await testCodeAnalysis();
      setTestResult(result);

      if (result.success) {
        toast.success('Code analysis test successful!');
      } else {
        toast.error(`Analysis test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test analysis failed:', error);
      setTestResult({
        success: false,
        error: error.message
      });
      toast.error(`Analysis test failed: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  // Enhanced direct code analysis (inspired by original Code Critic)
  const handleDirectCodeAnalysis = async () => {
    if (!directCode.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }

    setAnalyzingDirectCode(true);
    setDirectAnalysisResult('');

    try {
      const customApiKey = useCustomApiKey ? localStorage.getItem('codeCriticApiKey') : null;
      const result = await analyzeCode(directCode, customApiKey);
      setDirectAnalysisResult(result.rawResponse || 'Analysis completed successfully');
      toast.success('Direct code analysis completed!');
    } catch (error) {
      console.error('Direct code analysis failed:', error);
      setDirectAnalysisResult(`❌ Analysis failed: ${error.message}`);
      toast.error(`Direct code analysis failed: ${error.message}`);
    } finally {
      setAnalyzingDirectCode(false);
    }
  };

  const handleCodeChange = (code) => {
    setDirectCode(code);
    // Re-run syntax highlighting
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        prism.highlightAll();
      }, 100);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item, index) => (
      <React.Fragment key={`${item.path}-${index}`}>
        <ListItem sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => item.type === 'file' ? handleFileSelect(item) : null}
            sx={{
              cursor: item.type === 'file' ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: item.type === 'file' ? 'action.hover' : 'transparent'
              }
            }}
          >
            <ListItemIcon>
              {item.type === 'folder' ? (
                <FolderIcon color="primary" />
              ) : (
                <FileIcon color="action" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              secondary={item.type === 'file' ? 'Click to analyze' : `${item.children?.length || 0} items`}
            />
            {item.type === 'file' && selectedFile?.path === item.path && (
              <CheckCircleIcon color="success" sx={{ ml: 1 }} />
            )}
          </ListItemButton>
        </ListItem>

        {item.children && item.children.length > 0 && (
          <List sx={{ pl: 2 }}>
            {renderFileTree(item.children, level + 1)}
          </List>
        )}
      </React.Fragment>
    ));
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const getIssueIcon = (type) => {
      switch (type) {
        case 'error': return <ErrorIcon color="error" />;
        case 'warning': return <WarningIcon color="warning" />;
        case 'info': return <InfoIcon color="info" />;
        default: return <InfoIcon />;
      }
    };

    const getIssueColor = (type) => {
      switch (type) {
        case 'error': return COLORS.error;
        case 'warning': return COLORS.warning;
        case 'info': return COLORS.info;
        default: return COLORS.info;
      }
    };

    return (
      <Grid container spacing={3}>
        {/* Analysis Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 80 }}>
                  Score:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={analysisResult.score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: analysisResult.score >= 80 ? COLORS.success :
                                       analysisResult.score >= 60 ? COLORS.info :
                                       analysisResult.score >= 40 ? COLORS.warning : COLORS.error
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {analysisResult.score}%
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                Issues Found: <strong>{analysisResult.issues.length}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Complexity: <strong>{analysisResult.complexity.maintainability}</strong>
              </Typography>
              <Typography variant="body2">
                Cyclomatic Complexity: <strong>{analysisResult.complexity.cyclomatic}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Issues */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues & Suggestions
              </Typography>

              {analysisResult.issues.map((issue, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {getIssueIcon(issue.type)}
                      <Typography sx={{ ml: 1, flex: 1 }}>
                        Line {issue.line}: {issue.message}
                      </Typography>
                      <Chip
                        label={issue.type}
                        size="small"
                        sx={{
                          backgroundColor: getIssueColor(issue.type),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {issue.message}
                    </Typography>
                    {issue.suggestion && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </Alert>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* General Suggestions */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                General Suggestions
              </Typography>
              {analysisResult.suggestions.map((suggestion, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {suggestion}
                </Alert>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderRepoSelector = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Select Repository for Code Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose a repository to analyze your code with AI-powered insights.
        </Typography>

        <FormControl fullWidth sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
          <InputLabel>Select Repository</InputLabel>
          <Select
            value={selectedRepo}
            onChange={(e) => handleRepoSelect(e.target.value)}
            label="Select Repository"
          >
            {userRepos.map((repo) => (
              <MenuItem key={repo.full_name} value={repo.full_name}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>{repo.name}</Typography>
                  {repo.private && (
                    <Chip label="Private" size="small" color="warning" />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {validationStatus && (
          <Alert
            severity={validationStatus === 'valid' ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {validationStatus === 'valid'
              ? 'Repository validated successfully!'
              : 'Failed to validate repository'
            }
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setSettingsOpen(true)}
            startIcon={<SettingsIcon />}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            onClick={() => handleRepoSelect(selectedRepo)}
            disabled={!selectedRepo || loading}
            startIcon={loading ? null : <PlayIcon />}
          >
            {loading ? 'Validating...' : 'Validate Repository'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          <CodeIcon sx={{ mr: 2, fontSize: 40, verticalAlign: 'middle' }} />
          Code Critic
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Advanced Settings">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload to Cloud">
            <IconButton>
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            {selectedFile ? 'Analyzing code...' : 'Validating repository...'}
          </Typography>
        </Box>
      )}

      {!selectedRepo ? (
        renderRepoSelector()
      ) : (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="File Explorer" />
            <Tab label="Direct Code Editor" icon={<EditIcon />} iconPosition="start" />
            <Tab label="Analysis Results" disabled={!analysisResult} />
          </Tabs>
        </Box>
      )}

      {selectedRepo && (
        <Grid container spacing={3}>
          {/* File Explorer */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Repository: {selectedRepo}
                </Typography>

                <List>
                  {renderFileTree(fileTree)}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Analysis Results */}
          <Grid item xs={12} md={8}>
            {activeTab === 0 && selectedFile && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Selected File: {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Path: {selectedFile.path}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleFileSelect(selectedFile)}
                    disabled={loading}
                    startIcon={<PlayIcon />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Code'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                {/* Direct Code Editor */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Direct Code Editor
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={handleDirectCodeAnalysis}
                          disabled={analyzingDirectCode || !directCode.trim()}
                          startIcon={analyzingDirectCode ? null : <PlayIcon />}
                          size="small"
                        >
                          {analyzingDirectCode ? 'Analyzing...' : 'Analyze'}
                        </Button>
                      </Box>

                      <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                        <Editor
                          value={directCode}
                          onValueChange={handleCodeChange}
                          highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                          padding={15}
                          style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            minHeight: '100%',
                            outline: 'none'
                          }}
                          placeholder="Type your code here..."
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Direct Analysis Results */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Analysis Results
                      </Typography>

                      <Box sx={{
                        flex: 1,
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        borderRadius: 1,
                        p: 2,
                        overflow: 'auto',
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: 14
                      }}>
                        {directAnalysisResult ? (
                          <Markdown rehypePlugins={[rehypeHighlight]}>
                            {directAnalysisResult}
                          </Markdown>
                        ) : (
                          <Typography color="text.secondary">
                            Click "Analyze" to review your code with AI-powered insights.
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && renderAnalysisResult()}
          </Grid>
        </Grid>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Code Critic Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomApiKey}
                onChange={(e) => setUseCustomApiKey(e.target.checked)}
              />
            }
            label="Use Custom API Key"
            sx={{ mb: 2 }}
          />

          {useCustomApiKey && (
            <TextField
              autoFocus
              margin="dense"
              label="API Key"
              fullWidth
              variant="outlined"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key for advanced features"
              sx={{ mb: 2 }}
            />
          )}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Default:</strong> Uses built-in API for basic analysis<br />
              <strong>Custom API Key:</strong> Enables advanced features and higher limits
            </Typography>
          </Alert>

          {/* Model Selection */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              AI Model Selection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the AI model for code analysis. Different models offer varying levels of quality and speed.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select AI Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                label="Select AI Model"
              >
                {Object.keys(availableModels).map((modelKey) => {
                  const model = availableModels[modelKey];
                  return (
                    <MenuItem key={modelKey} value={modelKey}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {model.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {model.description} • {model.maxTokens.toLocaleString()} tokens
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Current Model:</strong> {availableModels[selectedModel]?.name || 'Loading...'}<br />
                <strong>Context Limit:</strong> {availableModels[selectedModel]?.maxTokens.toLocaleString() || 'Unknown'} tokens<br />
                <strong>Best For:</strong> {availableModels[selectedModel]?.description || 'Code analysis'}
              </Typography>
            </Alert>
          </Box>

          {/* Test Connection Section */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Connection Test
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test your Cloudflare Worker connection and code analysis functionality.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testingConnection}
                size="small"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleTestAnalysis}
                disabled={testingConnection}
                size="small"
              >
                {testingConnection ? 'Testing...' : 'Test Analysis'}
              </Button>
            </Box>

            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  <strong>{testResult.success ? '✅ Success' : '❌ Failed'}:</strong>{' '}
                  {testResult.success
                    ? `Worker is responding correctly (${testResult.status})`
                    : `Error: ${testResult.error}`
                  }
                </Typography>
                {testResult.details && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                      Technical Details
                    </summary>
                    <pre style={{ fontSize: '0.75rem', marginTop: '8px', overflow: 'auto' }}>
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={handleApiKeySave} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodeCritic;
