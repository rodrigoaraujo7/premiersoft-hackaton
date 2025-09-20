import { GoogleGenAI } from '@google/genai';
// Type definitions
export interface AIConfig {
  apiKey?: string;
  model?: string;
}

export interface Message {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
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
  private ai: GoogleGenAI;

  constructor(config: AIConfig = {}) {
    this.apiKey = "AIzaSyAuEPbY5BFMv08CKNp8YDX5xxbtidGLkQQ";
    this.model = config.model || 'gemini-2.5-pro';
    
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey,
    });

  }


  /**
   * Convert tools to Google GenAI function calling format
   */
  private convertToolsToGoogleGenAI(tools: any[]): any[] {
    if (tools.length === 0) return [];
    
    return [{
      functionDeclarations: tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }))
    }];
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
      // Convert tools to Google GenAI format
      const googleGenAITools = this.convertToolsToGoogleGenAI(tools);

      // Convert conversation history to Google GenAI format
      const contents: Message[] = [
        ...conversationHistory,
        {
          role: 'user',
          parts: [
            {
              text: message
            }
          ]
        }
      ];

      const config = {
        tools: googleGenAITools,
        ...options
      };

      if (options.stream) {
        // Handle streaming response
        const response = await this.ai.models.generateContentStream({
          model: this.model,
          config,
          contents,
        });

        let fullResponse = '';
        let toolCalls: any[] = [];
        
        for await (const chunk of response) {
          if (chunk.text) {
            fullResponse += chunk.text;
          }
          // Handle function calls if present
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            toolCalls.push(...chunk.functionCalls);
          }
        }

        // Execute tool calls if any
        if (toolCalls.length > 0) {
          const toolResults: Message[] = [];
          
          for (const toolCall of toolCalls) {
            const result = await this.executeGoogleGenAIToolCall(toolCall);
            toolResults.push({
              role: 'user',
              parts: [
                {
                  text: `Tool call result for ${toolCall.name}: ${JSON.stringify(result)}`
                }
              ]
            });
          }

          // Make another request with tool results
          const updatedContents = [
            ...contents,
            {
              role: 'model',
              parts: [
                {
                  text: fullResponse
                }
              ]
            },
            ...toolResults
          ];

          const followUpResponse = await this.ai.models.generateContentStream({
            model: this.model,
            config,
            contents: updatedContents,
          });

          let finalResponse = '';
          for await (const chunk of followUpResponse) {
            if (chunk.text) {
              finalResponse += chunk.text;
            }
          }

          return {
            success: true,
            data: {
              choices: [{
                message: {
                  content: finalResponse
                }
              }]
            }
          };
        }

        return {
          success: true,
          data: {
            choices: [{
              message: {
                content: fullResponse
              }
            }]
          }
        };
      } else {
        // Handle non-streaming response
        const response = await this.ai.models.generateContent({
          model: this.model,
          config,
          contents,
        });

        return {
          success: true,
          data: {
            choices: [{
              message: {
                content: response.text || ''
              }
            }]
          }
        };
      }

    } catch (error: any) {
      console.error('AI Service Error:', error.message);
      
      return {
        success: false,
        error: error.message || 'Unknown error',
        statusCode: 500
      };
    }
  }

  /**
   * Execute a Google GenAI function call
   */
  private async executeGoogleGenAIToolCall(toolCall: any): Promise<any> {
    try {
      const funcName = toolCall.name;
      const args = toolCall.args || {};

      // Handle tool calls here
      return {
        success: false,
        error: `Tool execution not implemented: ${funcName}`
      };

    } catch (error) {
      console.error('Error executing Google GenAI tool call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute a tool call from the AI response
   */
  private async executeToolCall(toolCall: ToolCall): Promise<any> {
    try {
      const func = toolCall.function;
      const args = JSON.parse(func.arguments);

      // Handle tool calls here
      return {
        success: false,
        error: `Tool execution not implemented: ${func.name}`
      };

    } catch (error) {
      console.error('Error executing tool call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

}

// Export default instance
export const aiService = new AIService();
