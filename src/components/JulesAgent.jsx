import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Badge,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  SmartToy as AgentIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  RestartAlt as ResetIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  Difference as DiffIcon,
  CheckCircle as SuccessIcon,
  RadioButtonUnchecked as PendingIcon,
  HourglassEmpty as ProgressIcon,
  Psychology as ThoughtIcon,
  Build as ToolIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Storage as RepoIcon,
  Assignment as PlanIcon,
  FolderOpen as FolderIcon,
  InsertDriveFile as FileIcon,
  QuestionAnswer as ChatIcon,
  Verified as VerifyIcon,
  MenuBook as KnowledgeIcon,
  Memory as MemoryIcon,
  Construction as ToolsRegistryIcon,
  PlayCircleFilled as ApplyDiffIcon
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import {
  JULES_PORTED_TOOLS,
  JULES_KNOWLEDGEBASE,
  applyGitMergeDiff,
  queryKnowledgebase,
  JulesAgentSessionManager
} from '../lib/julesAgentEngine'

// Default mock files in repository for agent workspace exploration
const INITIAL_REPO_FILES = {
  'README.md': `# Repository Context Generator
AI-powered repository analysis and context generator for GitHub repositories.
Compatible with Jules Agent, Cursor, Claude Code, and Copilot.`,
  'package.json': `{
  "name": "repository-context-generator",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "build": "vite build"
  }
}`,
  'src/lib/agentRunner.ts': `// Jules Agent Task Engine
export interface AgentTask {
  id: string;
  instruction: string;
  status: 'planning' | 'executing' | 'verifying' | 'completed';
}

export function runAgent(task: AgentTask) {
  console.log("Jules running task:", task.instruction);
  return { success: true };
}`,
  'src/lib/securityAudit.ts': `export function auditSecurity() {
  return {
    score: 95,
    vulnerabilities: [],
    status: "secure"
  };
}`
}

const DEFAULT_PLAN = [
  { id: 1, title: 'Analyze repository context and configuration', status: 'pending', desc: 'Scan package.json, source modules, and dependency trees' },
  { id: 2, title: 'Perform security vulnerability and license compliance audit', status: 'pending', desc: 'Verify CVE status, evaluate npm dependencies, and check permissions' },
  { id: 3, title: 'Apply targeted optimizations and refactoring via git merge diffs', status: 'pending', desc: 'Optimize bundle size and improve error handling across services' },
  { id: 4, title: 'Execute verification tests and validate regressions', status: 'pending', desc: 'Run automated test suites and verify all checks pass cleanly' },
  { id: 5, title: 'Complete pre-commit checks and prepare submission review', status: 'pending', desc: 'Ensure proper testing, verification, review, and reflection are done' }
]

export default function JulesAgent() {
  const [taskPrompt, setTaskPrompt] = useState(
    'Audit repository security, generate dependency graph, and propose optimization refactors with verification tests.'
  )
  const [status, setStatus] = useState('idle') // idle, running, awaiting_input, completed
  const [currentPlanStep, setCurrentPlanStep] = useState(0)
  const [plan, setPlan] = useState(DEFAULT_PLAN)
  const [activities, setActivities] = useState([])
  const [workspaceTab, setWorkspaceTab] = useState(0) // 0: Terminal, 1: Files, 2: Diffs, 3: Tools, 4: Knowledge & Memory
  const [repoFiles, setRepoFiles] = useState(INITIAL_REPO_FILES)
  const [selectedFile, setSelectedFile] = useState('src/lib/agentRunner.ts')
  const [terminalLogs, setTerminalLogs] = useState([
    '$ git status',
    'On branch jules-agent-workspace',
    'nothing to commit, working tree clean',
    '$ node -v',
    'v22.22.1'
  ])
  const [commandInput, setCommandInput] = useState('')
  const [mergeDiff, setMergeDiff] = useState(`<<<<<<< SEARCH
export function runAgent(task: AgentTask) {
  console.log("Jules running task:", task.instruction);
  return { success: true };
}
=======
export function runAgent(task: AgentTask) {
  console.log("Jules running task:", task.instruction);
  // Enhanced telemetry and verification checks
  const startTime = Date.now();
  return {
    success: true,
    durationMs: Date.now() - startTime,
    verified: true
  };
}
>>>>>>> REPLACE`)
  const [userFeedbackInput, setUserFeedbackInput] = useState('')
  const [userInputPrompt, setUserInputPrompt] = useState(null)

  // Knowledge & Memory state
  const [sessionManager] = useState(() => new JulesAgentSessionManager())
  const [memories, setMemories] = useState(sessionManager.getMemories())
  const [kbQuery, setKbQuery] = useState('')
  const [newMemoryKey, setNewMemoryKey] = useState('')
  const [newMemoryValue, setNewMemoryValue] = useState('')

  const activityEndRef = useRef(null)
  const terminalEndRef = useRef(null)

  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activities])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLogs])

  const handleRunCommand = (e) => {
    if (e) e.preventDefault()
    if (!commandInput.trim()) return

    const cmd = commandInput.trim()
    setCommandInput('')
    setTerminalLogs((prev) => [...prev, `$ ${cmd}`])

    setTimeout(() => {
      if (cmd.startsWith('npm test') || cmd.startsWith('jest')) {
        setTerminalLogs((prev) => [
          ...prev,
          'PASS src/lib/__tests__/advancedGitAnalyzer.test.ts',
          'PASS src/lib/__tests__/julesAgent.test.ts',
          'PASS src/lib/__tests__/julesAgentEngine.test.ts',
          'Test Suites: 3 passed, 3 total',
          'Tests:       53 passed, 53 total',
          'Snapshots:   0 total',
          'Time:        2.31 s'
        ])
      } else if (cmd.startsWith('git status')) {
        setTerminalLogs((prev) => [
          ...prev,
          'On branch jules-agent-workspace',
          'Changes to be committed:',
          '  modified:   src/lib/agentRunner.ts',
          '  modified:   src/lib/securityAudit.ts'
        ])
      } else if (cmd.startsWith('ls')) {
        setTerminalLogs((prev) => [
          ...prev,
          'README.md  package.json  src/  scripts/  dist/'
        ])
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          `[bash_session]: executed '${cmd}' successfully (exit code 0)`
        ])
      }
    }, 400)
  }

  // Interactive Live Diff Application
  const handleApplyDiff = () => {
    const current = repoFiles[selectedFile] || ''
    const patchResult = applyGitMergeDiff(current, mergeDiff)
    if (!patchResult.success) {
      toast.error(patchResult.error || 'Failed to apply diff')
      return
    }

    setRepoFiles((prev) => ({
      ...prev,
      [selectedFile]: patchResult.result
    }))
    toast.success(`Successfully applied git merge diff to ${selectedFile}!`)
    setTerminalLogs((prev) => [
      ...prev,
      `[git_merge_diff]: patched ${selectedFile} successfully`,
      '1 replacement applied with 0 conflicts'
    ])
  }

  const handleAddMemory = () => {
    if (!newMemoryKey.trim() || !newMemoryValue.trim()) return
    sessionManager.recordMemory(newMemoryKey.trim(), newMemoryValue.trim(), 'custom')
    setMemories(sessionManager.getMemories())
    setNewMemoryKey('')
    setNewMemoryValue('')
    toast.success('Recorded memory into Jules session')
  }

  // Simulator for full autonomous task cycle
  const startAgentExecution = () => {
    if (status === 'running') return
    setStatus('running')
    setActivities([])
    setPlan(DEFAULT_PLAN.map((p) => ({ ...p, status: 'pending' })))
    setCurrentPlanStep(0)

    toast.success('Jules agent initialized session!')

    const script = [
      {
        delay: 500,
        action: () => {
          setActivities((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'thought',
              title: 'Formulating Autonomous Strategy',
              content:
                'I will analyze the repository structure, review dependency manifests, audit security health, apply performance enhancements, and run verification test suites.'
            }
          ])
        }
      },
      {
        delay: 1500,
        action: () => {
          setActivities((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'tool_call',
              tool: 'run_in_bash_session',
              args: { command: 'git status && npm list --depth=0' },
              content: 'Inspecting git tree and verified package manager dependencies.'
            }
          ])
          setTerminalLogs((prev) => [
            ...prev,
            '$ git status && npm list --depth=0',
            'On branch jules-agent-workspace',
            'repository-context-generator@1.0.0 /app',
            'All dependencies installed and verified.'
          ])
          setPlan((prev) =>
            prev.map((step, idx) => (idx === 0 ? { ...step, status: 'in_progress' } : step))
          )
          setCurrentPlanStep(0)
        }
      },
      {
        delay: 3000,
        action: () => {
          setPlan((prev) =>
            prev.map((step, idx) =>
              idx === 0 ? { ...step, status: 'completed' } : idx === 1 ? { ...step, status: 'in_progress' } : step
            )
          )
          setCurrentPlanStep(1)
          setActivities((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'tool_call',
              tool: 'read_file',
              args: { filepath: 'src/lib/securityAudit.ts' },
              content: 'Loaded securityAudit.ts. Running vulnerability scans on all dependencies.'
            }
          ])
        }
      },
      {
        delay: 4500,
        action: () => {
          setPlan((prev) =>
            prev.map((step, idx) =>
              idx === 1 ? { ...step, status: 'completed' } : idx === 2 ? { ...step, status: 'in_progress' } : step
            )
          )
          setCurrentPlanStep(2)
          setActivities((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'tool_call',
              tool: 'replace_with_git_merge_diff',
              args: { filepath: 'src/lib/agentRunner.ts' },
              content: 'Applied git merge diff optimization to agentRunner.ts.'
            }
          ])
          handleApplyDiff()
          setWorkspaceTab(2) // Switch to diff view
          setTerminalLogs((prev) => [
            ...prev,
            '$ git diff src/lib/agentRunner.ts',
            'diff --git a/src/lib/agentRunner.ts b/src/lib/agentRunner.ts',
            '+ verified: true, durationMs'
          ])
        }
      },
      {
        delay: 6000,
        action: () => {
          setStatus('awaiting_input')
          setUserInputPrompt(
            'Optimization diff ready for approval. Would you like to proceed with automated verification tests and pre-commit checks?'
          )
          setActivities((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'user_prompt',
              title: 'Request User Approval',
              content:
                'Optimization diff ready for approval. Would you like to proceed with automated verification tests and pre-commit checks?'
            }
          ])
        }
      }
    ]

    let totalDelay = 0
    script.forEach((item) => {
      totalDelay = item.delay
      setTimeout(item.action, totalDelay)
    })
  }

  const handleUserApproval = (approved) => {
    setUserInputPrompt(null)
    setStatus('running')

    if (!approved) {
      toast.error('Task cancelled by user.')
      setStatus('idle')
      return
    }

    toast.success('Approved! Proceeding with verification...')
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user_response',
        title: 'User Approved',
        content: userFeedbackInput || 'Approval confirmed. Proceed with verification tests and commit.'
      }
    ])
    setUserFeedbackInput('')

    // Finish step 3, run step 4 & 5
    setTimeout(() => {
      setPlan((prev) =>
        prev.map((step, idx) =>
          idx === 2 ? { ...step, status: 'completed' } : idx === 3 ? { ...step, status: 'in_progress' } : step
        )
      )
      setCurrentPlanStep(3)
      setWorkspaceTab(0)
      setTerminalLogs((prev) => [
        ...prev,
        '$ npm test',
        'PASS src/lib/__tests__/advancedGitAnalyzer.test.ts (23 passed)',
        'PASS src/lib/__tests__/julesAgent.test.ts (9 passed)',
        'PASS src/lib/__tests__/julesAgentEngine.test.ts (21 passed)',
        'Test Suites: 3 passed, 3 total',
        'Tests:       53 passed, 53 total',
        'All verification tests passed successfully!'
      ])
      setActivities((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'tool_call',
          tool: 'run_in_bash_session',
          args: { command: 'npm test' },
          content: 'Ran verification test suites. 53 tests passed cleanly.'
        }
      ])
    }, 1200)

    setTimeout(() => {
      setPlan((prev) =>
        prev.map((step, idx) =>
          idx === 3 ? { ...step, status: 'completed' } : idx === 4 ? { ...step, status: 'completed' } : step
        )
      )
      setCurrentPlanStep(4)
      setStatus('completed')
      setActivities((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'completion',
          title: 'Task Successfully Completed',
          content: 'Autonomous task executed with 100% verification, passing tests, and generated commit diff.'
        }
      ])
      toast.success('Jules completed all steps successfully!')
    }, 2800)
  }

  const resetSession = () => {
    setStatus('idle')
    setPlan(DEFAULT_PLAN.map((p) => ({ ...p, status: 'pending' })))
    setActivities([])
    setCurrentPlanStep(0)
    setUserInputPrompt(null)
    setRepoFiles(INITIAL_REPO_FILES)
    toast.success('Session reset.')
  }

  const filteredKnowledge = queryKnowledgebase(kbQuery)

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* Header Banner */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.35)'
              }}
            >
              <AgentIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Jules Autonomous Engineering Agent
                </Typography>
                <Chip
                  label={
                    status === 'running'
                      ? 'Executing Task'
                      : status === 'awaiting_input'
                      ? 'Needs Approval'
                      : status === 'completed'
                      ? 'Task Completed'
                      : 'Ready'
                  }
                  color={
                    status === 'running'
                      ? 'primary'
                      : status === 'awaiting_input'
                      ? 'warning'
                      : status === 'completed'
                      ? 'success'
                      : 'default'
                  }
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Autonomous multi-step coding agent: planning, bash execution, targeted git merge diffs, verification & review.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={resetSession}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Reset Session
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Task Input, Plan, and Activity Stream */}
        <Grid item xs={12} lg={5}>
          {/* Task Prompt Card */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              mb: 3
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Agent Task Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="What would you like Jules to accomplish in this repository?"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={status === 'running' ? <CircularProgress size={18} color="inherit" /> : <RunIcon />}
                disabled={status === 'running'}
                onClick={startAgentExecution}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
              >
                {status === 'running' ? 'Executing Task...' : 'Execute Task'}
              </Button>
            </Box>
          </Card>

          {/* Execution Plan Card */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlanIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                Execution Plan
              </Typography>
              <Chip
                label={`${plan.filter((p) => p.status === 'completed').length} / ${plan.length} Steps Complete`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={(plan.filter((p) => p.status === 'completed').length / plan.length) * 100}
              sx={{ height: 6, borderRadius: 3, mb: 2 }}
            />
            <List dense disablePadding>
              {plan.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    px: 1.5,
                    py: 1,
                    mb: 1,
                    borderRadius: 2,
                    background:
                      item.status === 'in_progress'
                        ? 'rgba(99, 102, 241, 0.1)'
                        : item.status === 'completed'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      item.status === 'in_progress'
                        ? '1px solid rgba(99, 102, 241, 0.4)'
                        : item.status === 'completed'
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.status === 'completed' ? (
                      <SuccessIcon sx={{ color: 'success.main', fontSize: 18 }} />
                    ) : item.status === 'in_progress' ? (
                      <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                    ) : (
                      <PendingIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: item.status === 'in_progress' ? 700 : 500,
                          color: item.status === 'completed' ? 'text.secondary' : 'text.primary',
                          textDecoration: item.status === 'completed' ? 'line-through' : 'none'
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={item.desc}
                  />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Activity Timeline Stream */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              maxHeight: 450,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThoughtIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
              Agent Thought & Activity Stream
            </Typography>
            <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {activities.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No active execution yet. Click "Execute Task" to begin.</Typography>
                </Box>
              ) : (
                activities.map((act) => (
                  <Paper
                    key={act.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background:
                        act.type === 'thought'
                          ? 'rgba(139, 92, 246, 0.08)'
                          : act.type === 'tool_call'
                          ? 'rgba(6, 182, 212, 0.08)'
                          : act.type === 'user_prompt'
                          ? 'rgba(245, 158, 11, 0.12)'
                          : act.type === 'completion'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                      border:
                        act.type === 'user_prompt'
                          ? '1px solid rgba(245, 158, 11, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {act.type === 'thought' && <ThoughtIcon sx={{ fontSize: 16, color: '#a855f7' }} />}
                      {act.type === 'tool_call' && <ToolIcon sx={{ fontSize: 16, color: '#06b6d4' }} />}
                      {act.type === 'user_prompt' && <ChatIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                      {act.type === 'completion' && <VerifyIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {act.tool ? `tool: ${act.tool}` : act.title || act.type}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {act.content}
                    </Typography>
                    {act.args && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.25)',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem'
                        }}
                      >
                        {JSON.stringify(act.args)}
                      </Box>
                    )}
                  </Paper>
                ))
              )}
              <div ref={activityEndRef} />
            </Box>

            {/* User Input Prompt Action */}
            {userInputPrompt && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'warning.light' }}>
                  {userInputPrompt}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Optional review feedback..."
                  value={userFeedbackInput}
                  onChange={(e) => setUserFeedbackInput(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={() => handleUserApproval(false)}
                    sx={{ textTransform: 'none' }}
                  >
                    Reject / Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => handleUserApproval(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Approve & Continue
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column: Workspace Tabs (Terminal, Files, Diffs, Ported Tools, Knowledge & Memory) */}
        <Grid item xs={12} lg={7}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              minHeight: 650,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Tabs
              value={workspaceTab}
              onChange={(e, val) => setWorkspaceTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Terminal" />
              <Tab icon={<CodeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Files" />
              <Tab icon={<DiffIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Merge Diffs" />
              <Tab icon={<ToolsRegistryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Ported Tools" />
              <Tab icon={<KnowledgeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Knowledge & Memory" />
            </Tabs>

            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Tab 0: Terminal */}
              {workspaceTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box
                    sx={{
                      flexGrow: 1,
                      minHeight: 480,
                      maxHeight: 520,
                      overflowY: 'auto',
                      bgcolor: '#0f172a',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                      mb: 1.5
                    }}
                  >
                    {terminalLogs.map((log, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: log.startsWith('$') ? '#38bdf8' : log.includes('PASS') ? '#4ade80' : '#cbd5e1',
                          whiteSpace: 'pre-wrap',
                          mb: 0.5
                        }}
                      >
                        {log}
                      </Typography>
                    ))}
                    <div ref={terminalEndRef} />
                  </Box>
                  <Box
                    component="form"
                    onSubmit={handleRunCommand}
                    sx={{ display: 'flex', gap: 1 }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      placeholder="Run command (e.g. npm test, git status)..."
                      sx={{ fontFamily: 'monospace' }}
                    />
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ textTransform: 'none', px: 2.5 }}
                    >
                      Run
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Tab 1: Files */}
              {workspaceTab === 1 && (
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Explorer
                    </Typography>
                    <List dense sx={{ mt: 1 }}>
                      {Object.keys(repoFiles).map((path) => (
                        <ListItem
                          key={path}
                          button
                          selected={selectedFile === path}
                          onClick={() => setSelectedFile(path)}
                          sx={{
                            borderRadius: 1.5,
                            mb: 0.5,
                            bgcolor: selectedFile === path ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <FileIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={path}
                            primaryTypographyProps={{
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              fontWeight: selectedFile === path ? 700 : 400
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={8}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#0f172a',
                        height: 520,
                        overflowY: 'auto'
                      }}
                    >
                      <Typography
                        component="pre"
                        sx={{
                          color: '#e2e8f0',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {repoFiles[selectedFile] || ''}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Tab 2: Diffs */}
              {workspaceTab === 2 && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Targeted Git Merge Diff ({selectedFile})
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<ApplyDiffIcon />}
                      onClick={handleApplyDiff}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Apply Merge Diff
                    </Button>
                  </Box>
                  <TextField
                    multiline
                    rows={18}
                    value={mergeDiff}
                    onChange={(e) => setMergeDiff(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: '#090d16',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: '#94a3b8'
                      }
                    }}
                  />
                </Box>
              )}

              {/* Tab 3: Ported Tools Registry */}
              {workspaceTab === 3 && (
                <Box sx={{ height: 530, overflowY: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Ported Jules Tools & Execution Interfaces ({JULES_PORTED_TOOLS.length} Tools)
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Tool Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {JULES_PORTED_TOOLS.map((tool) => (
                          <TableRow key={tool.name}>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.light' }}>
                              {tool.name}
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={tool.category} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              {tool.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Tab 4: Knowledge & Memory */}
              {workspaceTab === 4 && (
                <Grid container spacing={2} sx={{ height: 530, overflowY: 'auto' }}>
                  {/* Knowledge Base */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KnowledgeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        Jules Knowledgebase Lookup
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search guidance, rules, testing best practices..."
                        value={kbQuery}
                        onChange={(e) => setKbQuery(e.target.value)}
                        sx={{ mb: 1.5 }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {filteredKnowledge.map((item, idx) => (
                          <Paper key={idx} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                              {item.topic}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                              {item.snippet}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {item.tags.map((t) => (
                                <Chip key={t} size="small" label={`#${t}`} sx={{ fontSize: '0.65rem', height: 20 }} />
                              ))}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Session Memory */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MemoryIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                      Session Memory & Context Store
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <TextField
                        size="small"
                        placeholder="Key"
                        value={newMemoryKey}
                        onChange={(e) => setNewMemoryKey(e.target.value)}
                        sx={{ width: '40%' }}
                      />
                      <TextField
                        size="small"
                        placeholder="Memory content..."
                        value={newMemoryValue}
                        onChange={(e) => setNewMemoryValue(e.target.value)}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button variant="outlined" size="small" onClick={handleAddMemory} sx={{ textTransform: 'none' }}>
                        Record
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {memories.map((mem) => (
                        <Paper key={mem.id} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.light', fontFamily: 'monospace' }}>
                              [{mem.category}] {mem.key}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                              {new Date(mem.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {mem.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
