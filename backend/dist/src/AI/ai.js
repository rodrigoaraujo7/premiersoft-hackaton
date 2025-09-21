"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
exports.main = main;
const genai_1 = require("@google/genai");
/**
 * AI Service Module with streaming and tool calling support
 */
class AIService {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || "AIzaSyAuEPbY5BFMv08CKNp8YDX5xxbtidGLkQQ";
        this.model = config.model || 'gemini-2.5-pro';
        this.ai = new genai_1.GoogleGenAI({
            apiKey: this.apiKey,
        });
    }
    /**
     * Get default tools configuration for Google GenAI
     */
    getDefaultTools() {
        return [
            { urlContext: {} },
            { codeExecution: {} },
            { googleSearch: {} }
        ];
    }
    /**
     * Convert tools to Google GenAI function calling format
     */
    convertToolsToGoogleGenAI(tools) {
        if (tools.length === 0)
            return this.getDefaultTools();
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
    async sendMessage(message, conversationHistory = [], tools = [], options = {}) {
        try {
            // Convert tools to Google GenAI format
            const googleGenAITools = this.convertToolsToGoogleGenAI(tools);
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
                thinkingConfig: {
                    thinkingBudget: -1,
                },
                tools: googleGenAITools,
                systemInstruction: options.systemInstruction || [
                    {
                        text: `you are an AI that helps with healthcare data processing and analysis.`,
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
                let executableCode = null;
                let codeExecutionResult = null;
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
     * Generate content with the new Google GenAI configuration structure
     */
    async generateContent(input, systemInstruction, options = {}) {
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
                        text: systemInstruction || `you are an AI that helps with healthcare data processing and analysis.`,
                    }
                ],
                ...options
            };
            const contents = [
                {
                    role: 'user',
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
            let executableCode = null;
            let codeExecutionResult = null;
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
            // Handle tool calls here
            return {
                success: false,
                error: `Tool execution not implemented: ${funcName}`
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
     */
    async executeToolCall(toolCall) {
        try {
            const func = toolCall.function;
            const args = JSON.parse(func.arguments);
            // Handle tool calls here
            return {
                success: false,
                error: `Tool execution not implemented: ${func.name}`
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
}
exports.AIService = AIService;
// Export default instance
exports.aiService = new AIService();
/**
 * Main function that demonstrates the new Google GenAI configuration
 * This matches the structure from the provided code example
 */
async function main() {
    const ai = new genai_1.GoogleGenAI({
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
                text: `you are an AI that helps with healthcare data processing and analysis.`,
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
//# sourceMappingURL=ai.js.map