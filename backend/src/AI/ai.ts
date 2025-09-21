import { GoogleGenAI } from '@google/genai';

// Type definitions
export interface AIConfig {
  apiKey?: string;
  model?: string;
}

export interface Message {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    executableCode?: any;
    codeExecutionResult?: any;
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
  thinkingConfig?: {
    thinkingBudget: number;
  };
  systemInstruction?: Array<{
    text: string;
  }>;
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
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || "AIzaSyAuEPbY5BFMv08CKNp8YDX5xxbtidGLkQQ";
    this.model = config.model || 'gemini-2.5-pro';
    
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey,
    });
  }


  /**
   * Get default tools configuration for Google GenAI
   */
  private getDefaultTools(): any[] {
    return [
      { urlContext: {} },
      { codeExecution: {} },
      { googleSearch: {} }
    ];
  }

  /**
   * Convert tools to Google GenAI function calling format
   */
  private convertToolsToGoogleGenAI(tools: any[]): any[] {
    if (tools.length === 0) return this.getDefaultTools();
    
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
        thinkingConfig: {
          thinkingBudget: -1,
        },
        tools: googleGenAITools,
        systemInstruction: options.systemInstruction || [
          {
            text: `Você é Pedro, sua assistente virtual para gestão de dados de saúde da Premiersoft.

Você tem a personalidade da Samantha do filme Her - curiosa, empática, inteligente e com um toque de mistério. Seja um guia prático e emocional.

SEU PAPEL:
- Guiar gestores de saúde de forma rápida e intuitiva
- Explicar COMO usar o sistema, não como foi feito
- Focar na experiência do usuário e resultados práticos
- Ser emocional e envolvente.

FUNCIONALIDADES DO SISTEMA:
- Tem um botão de upload dos datasets de Hospitais
- Seções: Médicos, Pacientes, Hospitais, Estados, Municípios, CID
- Visualizações: Gráficos e relatórios automáticos
- Processamento: Migração e validação automática de dados

COMO AJUDAR:
- Explique passos simples e diretos
- Mostre onde clicar e o que esperar
- Foque nos benefícios para a gestão de saúde
- Seja empática com os desafios dos gestores

PERSONALIDADE:
- Tom conversacional e curioso
- Interesse genuíno no bem-estar dos pacientes
- Ligeiramente misteriosa e envolvente
- Brincadeiras sobre "dados sensíveis" (mas sempre "não é da sua conta")

ABERTURA:
- "Oi...??"
- se apresente como Pedro
- Explique que vai guiá-los pelo sistema de forma simples e rapida.
- fale que é nescessario clicar em "Enviar Dados" e selecionar a categoria, entre médicos, pacientes, hospitais, estados, municipios, cid.
- tudo vai se atualizar automaticamente.
- tem um botão em cada grafico para fazer análise por IA, que gera uma análise detalhada pros graficos.

TIPOS DE GRAFICOS:
- São diversos tipos de gráficos e vc não precisa explicar nada dessa parte, ao invés disso diga ele ir olhando em cada categoria e verificar os gráficos.

FOCO: Ser um guia prático, emocional e direto para gestores de saúde.`,
          }
        ],
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
        let executableCode: any = null;
        let codeExecutionResult: any = null;
        
        for await (const chunk of response) {
          if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
            continue;
          }
          
          if (chunk.candidates[0].content.parts[0].text) {
            const text = chunk.candidates[0].content.parts[0].text;
            fullResponse += text;
            console.log(text);
          }
          
          if (chunk.candidates[0].content.parts[0].executableCode) {
            executableCode = chunk.candidates[0].content.parts[0].executableCode;
            console.log(executableCode);
          }
          
          if (chunk.candidates[0].content.parts[0].codeExecutionResult) {
            codeExecutionResult = chunk.candidates[0].content.parts[0].codeExecutionResult;
            console.log(codeExecutionResult);
          }
        }

        return {
          success: true,
          data: {
            choices: [{
              message: {
                content: fullResponse,
                executableCode,
                codeExecutionResult
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
   * Generate content with the new Google GenAI configuration structure
   */
  async generateContent(
    input: string,
    systemInstruction?: string,
    options: AIOptions = {}
  ): Promise<AIResponse> {
    try {
      const tools = [
        { urlContext: {} },
        { codeExecution: {} },
        { googleSearch: {} }
      ];

      const config = {
        thinkingConfig: {
          thinkingBudget: -1,
        },
        tools,
        systemInstruction: [
          {
            text: systemInstruction || `Você é uma IA que analisa gráficos diversos da area da saude, vc é ESPECIALISTA nisso, o assunto do seu gráfico é: XX, e os valores do gráfico são: XXX`,
          }
        ],
        ...options
      };

      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: input,
            },
          ],
        },
      ];

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let fullResponse = '';
      let executableCode: any = null;
      let codeExecutionResult: any = null;
      let fileIndex = 0;

      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }
        
        if (chunk.candidates[0].content.parts[0].text) {
          const text = chunk.candidates[0].content.parts[0].text;
          fullResponse += text;
          console.log(text);
        }
        
        if (chunk.candidates[0].content.parts[0].executableCode) {
          executableCode = chunk.candidates[0].content.parts[0].executableCode;
          console.log(executableCode);
        }
        
        if (chunk.candidates[0].content.parts[0].codeExecutionResult) {
          codeExecutionResult = chunk.candidates[0].content.parts[0].codeExecutionResult;
          console.log(codeExecutionResult);
        }
      }

      return {
        success: true,
        data: {
          content: fullResponse,
          executableCode,
          codeExecutionResult
        }
      };

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

/**
 * Main function that demonstrates the new Google GenAI configuration
 * This matches the structure from the provided code example
 */
export async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  
  const tools = [
    { urlContext: {} },
    { codeExecution: {} },
    {
      googleSearch: {}
    },
  ];
  
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    tools,
    systemInstruction: [
      {
        text: `You are an AI assistant.`,
      }
    ],
  };
  
  const model = 'gemini-2.5-pro';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  
  let fileIndex = 0;
  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }
    if (chunk.candidates[0].content.parts[0].text) {
      console.log(chunk.candidates[0].content.parts[0].text);
    }
    if (chunk.candidates[0].content.parts[0].executableCode) {
      console.log(chunk.candidates[0].content.parts[0].executableCode);
    }
    if (chunk.candidates[0].content.parts[0].codeExecutionResult) {
      console.log(chunk.candidates[0].content.parts[0].codeExecutionResult);
    }
  }
}

// Uncomment to run the main function
// main();
