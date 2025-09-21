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
export declare class AIService {
    private apiKey;
    private model;
    private ai;
    constructor(config?: AIConfig);
    /**
     * Get default tools configuration for Google GenAI
     */
    private getDefaultTools;
    /**
     * Convert tools to Google GenAI function calling format
     */
    private convertToolsToGoogleGenAI;
    /**
     * Send a message to the AI with streaming and tool calling support
     */
    sendMessage(message: string, conversationHistory?: Message[], tools?: Tool[], options?: AIOptions): Promise<AIResponse>;
    /**
     * Generate content with the new Google GenAI configuration structure
     */
    generateContent(input: string, systemInstruction?: string, options?: AIOptions): Promise<AIResponse>;
    /**
     * Execute a Google GenAI function call
     */
    private executeGoogleGenAIToolCall;
    /**
     * Execute a tool call from the AI response
     */
    private executeToolCall;
}
export declare const aiService: AIService;
/**
 * Main function that demonstrates the new Google GenAI configuration
 * This matches the structure from the provided code example
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=ai.d.ts.map