"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const genai_1 = require("@google/genai");
const mcp_server_1 = require("./mcp-server");
/**
 * AI Service Module with streaming and tool calling support
 */
class AIService {
    constructor(config = {}) {
        this.mcpInitialized = false;
        this.apiKey = "AIzaSyAuEPbY5BFMv08CKNp8YDX5xxbtidGLkQQ";
        this.model = config.model || 'gemini-2.5-pro';
        this.mcpService = mcp_server_1.mcpService;
        this.ai = new genai_1.GoogleGenAI({
            apiKey: this.apiKey,
        });
        // Initialize MCP servers
        this.initializeMCP();
    }
    async initializeMCP() {
        try {
            console.log('Initializing MCP servers...');
            await this.mcpService.startAllServers();
            this.mcpInitialized = true;
            console.log('MCP servers initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize MCP servers:', error);
            this.mcpInitialized = false;
        }
    }
    /**
     * Convert MCP tools to Google GenAI function calling format
     */
    convertMCPToolsToGoogleGenAI(mcpTools) {
        if (mcpTools.length === 0)
            return [];
        return [{
                functionDeclarations: mcpTools.map(tool => ({
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters
                }))
            }];
    }
    /**
     * Send a message to the AI with streaming and tool calling support
     */
    async sendMessage(message, conversationHistory = [], tools = [], options = {}) {
        try {
            // Get MCP tools if available
            const mcpTools = this.mcpInitialized ? this.mcpService.getAvailableTools() : [];
            const allTools = [...tools, ...mcpTools];
            // Convert tools to Google GenAI format
            const googleGenAITools = this.convertMCPToolsToGoogleGenAI(allTools);
            // Convert conversation history to Google GenAI format
            const contents = [
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
                let toolCalls = [];
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
                    const toolResults = [];
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
            }
            else {
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
        }
        catch (error) {
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
    async executeGoogleGenAIToolCall(toolCall) {
        try {
            const funcName = toolCall.name;
            const args = toolCall.args || {};
            // Check if this is an MCP tool (format: serverName_toolName)
            if (funcName.includes('_')) {
                const [serverName, toolName] = funcName.split('_', 2);
                if (this.mcpService.isServerRunning(serverName)) {
                    return await this.mcpService.callTool(serverName, toolName, args);
                }
            }
            // Handle other tool calls here if needed
            return {
                success: false,
                error: `Unknown tool: ${funcName}`
            };
        }
        catch (error) {
            console.error('Error executing Google GenAI tool call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Execute a tool call from the AI response
     * Note: Google GenAI handles tool calling differently, but keeping this for MCP compatibility
     */
    async executeToolCall(toolCall) {
        try {
            const func = toolCall.function;
            const args = JSON.parse(func.arguments);
            // Check if this is an MCP tool (format: serverName_toolName)
            if (func.name.includes('_')) {
                const [serverName, toolName] = func.name.split('_', 2);
                if (this.mcpService.isServerRunning(serverName)) {
                    return await this.mcpService.callTool(serverName, toolName, args);
                }
            }
            // Handle other tool calls here if needed
            return {
                success: false,
                error: `Unknown tool: ${func.name}`
            };
        }
        catch (error) {
            console.error('Error executing tool call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Get MCP server status
     */
    getMCPServerStatus() {
        return this.mcpService.getServerStatus();
    }
    /**
     * Restart MCP servers
     */
    async restartMCPServers() {
        this.mcpService.stopAllServers();
        await this.initializeMCP();
    }
}
exports.AIService = AIService;
// Export default instance
exports.aiService = new AIService();
//# sourceMappingURL=ai.js.map