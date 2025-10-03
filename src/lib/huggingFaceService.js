/**
 * Client-side Hugging Face Inference API Service
 * For pure GitHub Pages deployment without backend
 */

class HuggingFaceService {
  constructor() {
    this.baseURL = 'https://api-inference.huggingface.co/models'
    // Using free models available on Hugging Face
    this.models = [
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill',
      'microsoft/DialoGPT-small'
    ]
    this.currentModelIndex = 0
  }

  getCurrentModel() {
    const model = this.models[this.currentModelIndex]
    this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length
    return model
  }

  async makeRequest(prompt, options = {}) {
    const model = options.model || this.getCurrentModel()
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Making request to Hugging Face (attempt ${attempt}/${maxRetries})`)
        console.log(`📝 Using model: ${model}`)

        const headers = {
          'Content-Type': 'application/json'
        }

        const response = await fetch(`${this.baseURL}/${model}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            inputs: `You are an expert code reviewer. Analyze this code and provide feedback in the specified format:

Code to review:
${prompt}

Please structure your response as:
🔍 ISSUES FOUND:
[List specific issues]

✅ RECOMMENDED FIXES:
[Provide corrected code]

💡 IMPROVEMENT SUGGESTIONS:
[General suggestions]

📊 CODE QUALITY SCORE:
[Score out of 100]`,
            parameters: {
              max_length: options.maxTokens || 500,
              temperature: options.temperature || 0.7,
              top_p: 0.9,
              do_sample: true,
              return_full_text: false
            },
            options: {
              wait_for_model: true,
              use_cache: true
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`)
        }

        const data = await response.json()

        // Handle different response formats
        if (Array.isArray(data) && data.length > 0) {
          return data[0].generated_text || data[0].response || 'Analysis completed'
        } else if (data.generated_text) {
          return data.generated_text
        } else if (data.response) {
          return data.response
        } else {
          return 'Code analysis completed using AI'
        }

      } catch (error) {
        console.error(`❌ Hugging Face request failed (attempt ${attempt}):`, error.message)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // Longer delay for rate limits
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts`)
  }
}

// Export singleton instance
export default new HuggingFaceService()
