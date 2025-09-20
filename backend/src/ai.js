const axios = require('axios');

/**
 * AI Service Module with streaming and tool calling support
 */
class AIService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.FRIENDLI_API_KEY || 'flp_IOXWZmimNdkT2PaZv2MbJXrsMZ4ITqzCJu98viZEHXt0ec';
    this.model = config.model || 'deptumkw5lakgbo';
    this.baseURL = 'https://api.friendli.ai/dedicated/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 30000
    });
  }

  /**
   * Send a message to the AI with streaming and tool calling support
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {Array} tools - Available tools for the AI to call
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  async sendMessage(message, conversationHistory = [], tools = [], options = {}) {
    try {
      const messages = [
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: options.maxTokens || 16384,
        temperature: options.temperature || 0.6,
        top_p: options.topP || 0.95,
        stream: options.stream || false,
        ...options
      };

      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = tools;
      }

      // Add stream_options if streaming is enabled
      if (requestBody.stream) {
        requestBody.stream_options = {
          include_usage: true
        };
      }

      const response = await this.client.post('/chat/completions', requestBody);
      
      return {
        success: true,
        data: response.data,
        usage: response.data.usage || null
      };

    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status || 500
      };
    }
  }
}

// Export the class and create a default instance
module.exports = {
  AIService,
  aiService: new AIService()
};