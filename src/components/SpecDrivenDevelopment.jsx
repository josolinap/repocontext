import React, { useState, useEffect } from 'react'
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
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize
} from '@mui/material'
import {
  Article as ArticleIcon,
  Build as BuildIcon,
  Checklist as ChecklistIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'

const SpecDrivenDevelopment = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [projectData, setProjectData] = useState({
    constitution: '',
    specifications: [],
    technicalPlan: '',
    tasks: [],
    implementationStatus: 'idle',
    projectName: '',
    aiAssistant: 'copilot',
    scriptType: 'sh'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSpec, setEditingSpec] = useState(null)

  const steps = [
    'Project Constitution',
    'Specifications',
    'Technical Plan',
    'Task Breakdown',
    'Implementation'
  ]

  const aiAssistants = [
    { value: 'copilot', label: 'GitHub Copilot' },
    { value: 'claude', label: 'Claude Code' },
    { value: 'gemini', label: 'Gemini CLI' },
    { value: 'cursor', label: 'Cursor' },
    { value: 'windsurf', label: 'Windsurf' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setActiveTab(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setActiveTab(currentStep - 1)
    }
  }

  const handleSaveProject = () => {
    if (!projectData.projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    const projectKey = `spec_project_${Date.now()}`
    localStorage.setItem(projectKey, JSON.stringify(projectData))
    toast.success('Project saved successfully!')
  }

  const handleLoadProject = () => {
    // Implementation for loading saved projects
    toast.info('Load project functionality coming soon!')
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ConstitutionBuilder data={projectData} onChange={setProjectData} />
      case 1:
        return <SpecificationBuilder
          data={projectData}
          onChange={setProjectData}
          onEditSpec={setEditingSpec}
          onDialogOpen={setDialogOpen}
        />
      case 2:
        return <TechnicalPlanBuilder data={projectData} onChange={setProjectData} />
      case 3:
        return <TaskManager data={projectData} onChange={setProjectData} />
      case 4:
        return <ImplementationExecutor
          data={projectData}
          onChange={setProjectData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 4, backgroundColor: 'background.default' }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            🚀 Spec-Driven Development
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Build high-quality software faster with AI-powered spec-driven development
          </Typography>
        </Box>

        {/* Project Configuration */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Project Configuration</Typography>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectData.projectName}
                  onChange={(e) => setProjectData({...projectData, projectName: e.target.value})}
                  placeholder="My Awesome Project"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>AI Assistant</InputLabel>
                  <Select
                    value={projectData.aiAssistant}
                    label="AI Assistant"
                    onChange={(e) => setProjectData({...projectData, aiAssistant: e.target.value})}
                  >
                    {aiAssistants.map((assistant) => (
                      <MenuItem key={assistant.value} value={assistant.value}>
                        {assistant.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Script Type</InputLabel>
                  <Select
                    value={projectData.scriptType}
                    label="Script Type"
                    onChange={(e) => setProjectData({...projectData, scriptType: e.target.value})}
                  >
                    <MenuItem value="sh">POSIX Shell (bash/zsh)</MenuItem>
                    <MenuItem value="ps">PowerShell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleLoadProject}>
                Load Project
              </Button>
              <Button variant="contained" onClick={handleSaveProject}>
                <SaveIcon sx={{ mr: 1 }} />
                Save Project
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  onClick={() => {
                    setCurrentStep(index)
                    setActiveTab(index)
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(currentStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={currentStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Specification Dialog */}
        <SpecificationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          spec={editingSpec}
          onSave={(spec) => {
            if (editingSpec) {
              // Update existing spec
              const updatedSpecs = projectData.specifications.map(s =>
                s.id === spec.id ? spec : s
              )
              setProjectData({...projectData, specifications: updatedSpecs})
            } else {
              // Add new spec
              const newSpec = {
                ...spec,
                id: Date.now(),
                createdAt: new Date().toISOString()
              }
              setProjectData({
                ...projectData,
                specifications: [...projectData.specifications, newSpec]
              })
            }
            setDialogOpen(false)
            setEditingSpec(null)
          }}
        />
      </Box>
    </Box>
  )
}

// Constitution Builder Component
const ConstitutionBuilder = ({ data, onChange }) => {
  const [constitution, setConstitution] = useState(data.constitution)

  const handleSave = () => {
    onChange({...data, constitution})
    toast.success('Constitution saved!')
  }

  const constitutionTemplates = [
    {
      name: 'Code Quality Focus',
      content: `Create principles focused on code quality, testing standards, user experience consistency, and performance requirements. Include governance for how these principles should guide technical decisions and implementation choices.`
    },
    {
      name: 'Enterprise Standards',
      content: `Establish enterprise-grade development principles with emphasis on security, scalability, maintainability, and compliance. Define standards for documentation, testing, and deployment practices.`
    },
    {
      name: 'Startup Agile',
      content: `Create agile development principles optimized for rapid iteration, MVP development, and quick feedback cycles. Focus on speed, simplicity, and user-centric design.`
    }
  ]

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        📜 Project Constitution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Establish your project's governing principles and development guidelines that will guide all subsequent development.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            multiline
            rows={12}
            label="Project Constitution"
            value={constitution}
            onChange={(e) => setConstitution(e.target.value)}
            placeholder="Describe your project's governing principles, coding standards, development practices, and quality requirements..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Templates" />
            <CardContent>
              {constitutionTemplates.map((template, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2, textAlign: 'left' }}
                  onClick={() => setConstitution(template.content)}
                >
                  {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Constitution
        </Button>
      </Box>
    </Box>
  )
}

// Specification Builder Component
const SpecificationBuilder = ({ data, onChange, onEditSpec, onDialogOpen }) => {
  const [specifications, setSpecifications] = useState(data.specifications)

  const handleAddSpec = () => {
    onDialogOpen(true)
    onEditSpec(null)
  }

  const handleEditSpec = (spec) => {
    onEditSpec(spec)
    onDialogOpen(true)
  }

  const handleDeleteSpec = (specId) => {
    const updatedSpecs = specifications.filter(s => s.id !== specId)
    setSpecifications(updatedSpecs)
    onChange({...data, specifications: updatedSpecs})
    toast.success('Specification deleted!')
  }

  const handleSaveSpecs = () => {
    onChange({...data, specifications})
    toast.success('Specifications saved!')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          📋 Project Specifications
        </Typography>
        <Button variant="contained" onClick={handleAddSpec}>
          <AddIcon sx={{ mr: 1 }} />
          Add Specification
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Define what you want to build. Focus on the "what" and "why", not the tech stack.
      </Typography>

      {specifications.length > 0 ? (
        <List>
          {specifications.map((spec) => (
            <ListItem
              key={spec.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                backgroundColor: 'background.paper'
              }}
            >
              <ListItemIcon>
                <ArticleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {spec.title || 'Untitled Specification'}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {spec.description?.substring(0, 150)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={spec.priority || 'Medium'} size="small" />
                      <Chip label={spec.status || 'Draft'} size="small" />
                    </Box>
                  </Box>
                }
              />
              <IconButton onClick={() => handleEditSpec(spec)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteSpec(spec.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          No specifications defined yet. Click "Add Specification" to get started.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSaveSpecs}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Specifications
        </Button>
      </Box>
    </Box>
  )
}

// Technical Plan Builder Component
const TechnicalPlanBuilder = ({ data, onChange }) => {
  const [technicalPlan, setTechnicalPlan] = useState(data.technicalPlan)

  const handleSave = () => {
    onChange({...data, technicalPlan})
    toast.success('Technical plan saved!')
  }

  const planTemplates = [
    {
      name: 'React + Node.js',
      content: `The application uses React with TypeScript for the frontend and Node.js with Express for the backend. Use modern React patterns with hooks and context for state management. Implement RESTful APIs with proper error handling and validation.`
    },
    {
      name: 'Next.js Full Stack',
      content: `The application uses Next.js with App Router for full-stack development. Use Server Components for better performance and API routes for backend functionality. Implement proper metadata for SEO optimization and loading states.`
    },
    {
      name: 'Vanilla JS + SQLite',
      content: `The application uses vanilla HTML, CSS, and JavaScript as much as possible. Use modern ES6+ features and modules. Store data in a local SQLite database with proper schema design and migrations.`
    }
  ]

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        🛠️ Technical Implementation Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Provide your tech stack and architecture choices. Be specific about frameworks, databases, and technical requirements.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            multiline
            rows={15}
            label="Technical Plan"
            value={technicalPlan}
            onChange={(e) => setTechnicalPlan(e.target.value)}
            placeholder="Describe your chosen tech stack, architecture patterns, database choices, deployment strategy, and any specific technical requirements..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Tech Stack Templates" />
            <CardContent>
              {planTemplates.map((template, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">{template.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {template.content}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setTechnicalPlan(template.content)}
                    >
                      Use Template
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Technical Plan
        </Button>
      </Box>
    </Box>
  )
}

// Task Manager Component
const TaskManager = ({ data, onChange }) => {
  const [tasks, setTasks] = useState(data.tasks)

  const handleSave = () => {
    onChange({...data, tasks})
    toast.success('Tasks saved!')
  }

  const generateTasks = async () => {
    // This would integrate with AI to generate tasks from the technical plan
    toast.info('AI task generation coming soon!')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          ✅ Task Breakdown
        </Typography>
        <Button variant="contained" onClick={generateTasks}>
          <RefreshIcon sx={{ mr: 1 }} />
          Generate Tasks
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Generate actionable task lists for implementation based on your technical plan.
      </Typography>

      {tasks.length > 0 ? (
        <List>
          {tasks.map((task, index) => (
            <ListItem
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                backgroundColor: 'background.paper'
              }}
            >
              <ListItemIcon>
                <ChecklistIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {task.title || `Task ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={task.status || 'Pending'} size="small" />
                      <Chip label={task.priority || 'Medium'} size="small" />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          No tasks generated yet. Click "Generate Tasks" to create a task breakdown from your technical plan.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Tasks
        </Button>
      </Box>
    </Box>
  )
}

// Implementation Executor Component
const ImplementationExecutor = ({ data, onChange, isLoading, setIsLoading }) => {
  const handleExecute = async () => {
    setIsLoading(true)
    try {
      // Execute the spec-kit workflow
      await executeSpecKitWorkflow(data)
      toast.success('Implementation completed!')
    } catch (error) {
      console.error('Implementation failed:', error)
      toast.error(`Implementation failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const executeSpecKitWorkflow = async (projectData) => {
    if (!projectData.projectName || !projectData.constitution || !projectData.specifications.length) {
      throw new Error('Project data is incomplete. Please fill in all required fields.')
    }

    // Step 1: Create project directory
    toast.info('Creating project directory...')
    await createProjectDirectory(projectData.projectName)

    // Step 2: Generate constitution file
    toast.info('Generating project constitution...')
    await generateConstitutionFile(projectData)

    // Step 3: Generate specifications
    toast.info('Generating specifications...')
    await generateSpecifications(projectData)

    // Step 4: Generate technical plan
    toast.info('Generating technical plan...')
    await generateTechnicalPlan(projectData)

    // Step 5: Execute implementation
    toast.info('Executing implementation...')
    await executeImplementation(projectData)

    toast.success('Spec-driven development workflow completed successfully!')
  }

  const createProjectDirectory = async (projectName) => {
    // This would create the actual project directory
    // For now, we'll simulate it
    console.log(`Creating project directory: ${projectName}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const generateConstitutionFile = async (projectData) => {
    const constitutionContent = `# Project Constitution
# Generated by Spec-Driven Development

## Project: ${projectData.projectName}
## Generated: ${new Date().toISOString()}

${projectData.constitution}

## AI Assistant: ${projectData.aiAssistant}
## Script Type: ${projectData.scriptType}
`

    // This would write the constitution to a file
    console.log('Generated constitution:', constitutionContent)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const generateSpecifications = async (projectData) => {
    const specsContent = `# Project Specifications
# Generated by Spec-Driven Development

${projectData.specifications.map(spec => `
## ${spec.title}
**Priority:** ${spec.priority}
**Status:** ${spec.status}
**Category:** ${spec.category}

${spec.description}
`).join('\n')}
`

    console.log('Generated specifications:', specsContent)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const generateTechnicalPlan = async (projectData) => {
    const planContent = `# Technical Implementation Plan
# Generated by Spec-Driven Development

## Project: ${projectData.projectName}

${projectData.technicalPlan}

## Implementation Notes:
- AI Assistant: ${projectData.aiAssistant}
- Script Type: ${projectData.scriptType}
- Generated: ${new Date().toISOString()}
`

    console.log('Generated technical plan:', planContent)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const executeImplementation = async (projectData) => {
    // This would execute the actual spec-kit workflow
    // For now, we'll simulate the execution
    console.log('Executing implementation with data:', projectData)

    // Simulate task execution
    for (const task of projectData.tasks || []) {
      console.log(`Executing task: ${task.title}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Generate final implementation files
    await generateImplementationFiles(projectData)
  }

  const generateImplementationFiles = async (projectData) => {
    // This would generate the actual implementation files
    // For demonstration, we'll create a simple project structure
    const files = [
      'README.md',
      'package.json',
      'src/index.js',
      'src/App.js',
      '.gitignore'
    ]

    console.log('Generated implementation files:', files)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        🚀 Implementation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Execute all tasks and build your feature according to the plan.
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <strong>Ready to implement?</strong> This will execute all planned tasks and generate the actual code.
        Make sure your constitution, specifications, and technical plan are complete.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Project Summary" />
            <CardContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Project:</strong> {data.projectName || 'Not set'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>AI Assistant:</strong> {data.aiAssistant || 'Not set'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Specifications:</strong> {data.specifications?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Tasks:</strong> {data.tasks?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Implementation Status" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {isLoading ? (
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                ) : (
                  <PlayIcon sx={{ mr: 2, color: 'success.main' }} />
                )}
                <Typography variant="body1">
                  {isLoading ? 'Running...' : 'Ready to execute'}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleExecute}
                disabled={isLoading || !data.projectName}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    Executing Implementation...
                  </>
                ) : (
                  <>
                    <PlayIcon sx={{ mr: 2 }} />
                    Execute Implementation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

// Specification Dialog Component
const SpecificationDialog = ({ open, onClose, spec, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Draft',
    category: 'Feature'
  })

  useEffect(() => {
    if (spec) {
      setFormData(spec)
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Draft',
        category: 'Feature'
      })
    }
  }, [spec])

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    onSave(formData)
    toast.success('Specification saved!')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {spec ? 'Edit Specification' : 'Add New Specification'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief, descriptive title for this specification"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Review">Review</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Implemented">Implemented</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what you want to build, focusing on the 'what' and 'why' rather than technical implementation details..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Specification
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SpecDrivenDevelopment
