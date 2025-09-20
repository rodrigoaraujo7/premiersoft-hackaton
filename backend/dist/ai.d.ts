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
export declare class AIService {
    private apiKey;
    private model;
    private ai;
    private mcpService;
    private mcpInitialized;
    constructor(config?: AIConfig);
    private initializeMCP;
    /**
     * Convert MCP tools to Google GenAI function calling format
     */
    private convertMCPToolsToGoogleGenAI;
    /**
     * Send a message to the AI with streaming and tool calling support
     */
    sendMessage(message: string, conversationHistory?: Message[], tools?: Tool[], options?: AIOptions): Promise<AIResponse>;
    /**
     * Execute a Google GenAI function call
     */
    private executeGoogleGenAIToolCall;
    /**
     * Execute a tool call from the AI response
     * Note: Google GenAI handles tool calling differently, but keeping this for MCP compatibility
     */
    private executeToolCall;
    /**
     * Get MCP server status
     */
    getMCPServerStatus(): Record<string, boolean>;
    /**
     * Restart MCP servers
     */
    restartMCPServers(): Promise<void>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.d.ts.map