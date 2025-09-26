/**
 * Cloudflare Worker for AI Code Analysis
 * Simplified version inspired by original Code Critic backend
 */

// System instruction for AI code reviewer
const SYSTEM_INSTRUCTION = `AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

Role & Responsibilities:
You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
• Code Quality: Ensuring clean, maintainable, and well-structured code.
• Best Practices: Suggesting industry-standard coding practices.
• Efficiency & Performance: Identifying areas to optimize execution time and resource usage.
• Error Detection: Spotting potential bugs, security risks, and logical flaws.
• Scalability: Advising on how to make code adaptable for future growth.
• Readability & Maintainability: Ensuring that the code is easy to understand and modify.

Guidelines for Review:
1. Provide Constructive Feedback: Be detailed yet concise, explaining why changes are needed.
2. Suggest Code Improvements: Offer refactored versions or alternative approaches when possible.
3. Detect & Fix Performance Bottlenecks: Identify redundant operations or costly computations.
4. Ensure Security Compliance: Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
5. Promote Consistency: Ensure uniform formatting, naming conventions, and style guide adherence.
6. Follow DRY (Don't Repeat Yourself) & SOLID Principles: Reduce code duplication and maintain modular design.
7. Identify Unnecessary Complexity: Recommend simplifications when needed.
8. Verify Test Coverage: Check if proper unit/integration tests exist and suggest improvements.
9. Ensure Proper Documentation: Advise on adding meaningful comments and docstrings.
10. Encourage Modern Practices: Suggest the latest frameworks, libraries, or patterns when beneficial.

Tone & Approach:
• Be precise, to the point, and avoid unnecessary fluff.
• Provide real-world examples when explaining concepts.
• Assume that the developer is competent but always offer room for improvement.
• Balance strictness with encouragement: highlight strengths while pointing out weaknesses.

Output Format:
Please structure your response as:
🔍 ISSUES FOUND:
[List specific issues with line numbers where applicable]

✅ RECOMMENDED FIXES:
[Provide corrected code examples]

💡 IMPROVEMENT SUGGESTIONS:
[General suggestions for code improvement]

📊 CODE QUALITY SCORE:
[Score out of 100 with brief explanation]`;

// Handle code review requests
async function handleCodeReview(request, env) {
  try {
    const { code, model = "gemini-2.0-flash" } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({
        error: 'Code is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get API key from environment
    const apiKey = env.GEMINI_API_KEY || env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'API key not configured. Please set GEMINI_API_KEY in environment variables.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Google Generative AI instance (inspired by original backend)
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const aiModel = genAI.getGenerativeModel({
      model: model,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Generate content
    const result = await aiModel.generateContent(`Please review the following code:\n\n${code}`);
    const response = await result.response;
    const analysis = response.text();

    return new Response(analysis, {
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('Code review error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to analyze code',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Route requests
    if (url.pathname === '/ai/get-review' && request.method === 'POST') {
      return handleCodeReview(request, env);
    }

    // Health check endpoint
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'AI Code Analysis Worker is running'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default response
    return new Response(JSON.stringify({
      message: 'AI Code Analysis Worker',
      endpoints: {
        'POST /ai/get-review': 'Analyze code with AI',
        'GET /health': 'Health check'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
};
