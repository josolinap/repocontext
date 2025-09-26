# Code Critic Integration

## Overview

The Code Critic feature has been successfully integrated into your application. This feature allows users to analyze their code using AI-powered insights from Google's Gemini AI through a Cloudflare Worker.

## Features

- ✅ **Repository Selection**: Choose from user's GitHub repositories
- ✅ **Repository Validation**: Verify repository access and permissions
- ✅ **File Explorer**: Browse repository file structure
- ✅ **Code Analysis**: AI-powered code review with detailed feedback
- ✅ **API Key Management**: Optional custom API keys for advanced features
- ✅ **Real-time Analysis**: Instant code analysis results
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Cloudflare Worker Setup

1. **Create a Cloudflare Worker**:
   - Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)
   - Create a new Worker
   - Copy the contents of `cloudflare-worker.js` into your worker

2. **Configure Google Gemini API**:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Replace `YOUR_GOOGLE_GEMINI_API_KEY` in the worker with your actual API key
   - Set the API key as an environment variable in your Cloudflare Worker

3. **Deploy the Worker**:
   - Deploy your worker to get the URL (e.g., `https://your-worker-name.workers.dev`)
   - Update the `CLOUDFLARE_WORKER_URL` in `src/lib/codeCriticService.js` if different

### 2. Environment Variables

Update the following files with your actual values:

**cloudflare-worker.js**:
```javascript
const GOOGLE_GEMINI_API_KEY = 'your-actual-google-gemini-api-key';
```

**src/lib/codeCriticService.js**:
```javascript
const CLOUDFLARE_WORKER_URL = 'https://your-actual-worker-url.workers.dev';
```

### 3. GitHub Authentication

The application uses GitHub OAuth for repository access. Make sure:

1. **GitHub OAuth App**: Configure your GitHub OAuth application
2. **Token Storage**: GitHub tokens are stored in localStorage as `github_token`
3. **Repository Access**: Users need appropriate permissions to access private repositories

## Usage

### For Users

1. **Navigate to Code Critic**: Click the "Code Critic" tab in the main navigation
2. **Select Repository**: Choose a repository from the dropdown
3. **Validate Access**: Click "Validate Repository" to verify access
4. **Browse Files**: Use the file explorer to navigate repository structure
5. **Analyze Code**: Click on any file to analyze it with AI
6. **View Results**: See detailed analysis with issues, suggestions, and scores

### For Advanced Users

1. **Custom API Key**: Go to Settings to add your own API key for higher limits
2. **Private Repositories**: Access private repos with proper GitHub permissions
3. **Batch Analysis**: Analyze multiple files in a session

## API Endpoints

### Cloudflare Worker Endpoints

- `POST /ai/get-review` - Analyze code with AI
- `GET /health` - Health check endpoint
- `OPTIONS /` - CORS preflight handling

### Request Format

```javascript
POST /ai/get-review
Content-Type: application/json
Authorization: Bearer <api-key> (optional)

{
  "code": "function example() { console.log('Hello World'); }"
}
```

### Response Format

Returns AI analysis as plain text with detailed code review feedback.

## File Structure

```
src/
├── components/
│   └── CodeCritic.jsx          # Main Code Critic component
├── lib/
│   └── codeCriticService.js    # Service layer for API calls
└── cloudflare-worker.js        # Cloudflare Worker script

temp-code-critic/               # Cloned external Code Critic repo
├── Frontend/                   # Original frontend code
└── BackEnd/                    # Original backend code
```

## Dependencies

### Frontend Dependencies
- React 18+
- Material-UI (MUI) components
- React Hot Toast for notifications
- GitHub API integration

### Backend Dependencies (Cloudflare Worker)
- Google Generative AI SDK
- CORS handling
- JSON parsing

## Security Considerations

1. **API Keys**: Store API keys securely in environment variables
2. **GitHub Tokens**: Handle GitHub tokens securely, never expose in client-side code
3. **CORS**: Properly configured CORS headers for cross-origin requests
4. **Rate Limiting**: Consider implementing rate limiting for API calls
5. **Input Validation**: Validate all inputs before processing

## Troubleshooting

### Common Issues

1. **"Repository not found" Error**:
   - Check if the repository exists and is accessible
   - Verify GitHub token permissions
   - Ensure the repository name is correct

2. **"Failed to analyze code" Error**:
   - Check Cloudflare Worker deployment
   - Verify Google Gemini API key
   - Check network connectivity

3. **"CORS Error"**:
   - Verify CORS headers in Cloudflare Worker
   - Check if the worker URL is accessible

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages.

## Performance Optimization

1. **Caching**: Implement caching for frequently accessed repositories
2. **Lazy Loading**: Load file trees on demand
3. **Batch Processing**: Process multiple files efficiently
4. **Error Handling**: Graceful error handling with user feedback

## Future Enhancements

1. **Multiple AI Models**: Support for different AI models
2. **Batch Analysis**: Analyze entire repositories at once
3. **Code Metrics**: Additional code quality metrics
4. **Integration**: Integration with popular IDEs
5. **Collaboration**: Team collaboration features

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Cloudflare Worker logs
- Verify API key configurations
- Test with the health check endpoint

## License

This integration is part of your application and follows the same licensing terms.
