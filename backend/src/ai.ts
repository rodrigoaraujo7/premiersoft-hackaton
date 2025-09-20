import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Type definitions
export interface AIConfig {
  apiKey?: string;
  model?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: any;
  statusCode?: number;
  usage?: any;
}

/**
 * AI Service Module with streaming and tool calling support
 */
export class AIService {
  private apiKey: string;
  private model: string;
  private baseURL: string;
  private client: AxiosInstance;

  constructor(config: AIConfig = {}) {
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
   */
  async sendMessage(
    message: string,
    conversationHistory: Message[] = [],
    tools: Tool[] = [],
    options: AIOptions = {}
  ): Promise<AIResponse> {
    try {
      const messages: Message[] = [
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      const requestBody: any = {
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

      const response: AxiosResponse = await this.client.post('/chat/completions', requestBody);
      
      return {
        success: true,
        data: response.data,
        usage: response.data.usage || null
      };

    } catch (error: any) {
      console.error('AI Service Error:', error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status || 500
      };
    }
  }
}

// Export default instance
export const aiService = new AIService();
