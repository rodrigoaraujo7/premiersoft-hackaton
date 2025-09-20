"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpService = exports.MCPService = void 0;
const child_process_1 = require("child_process");
const e2b_mcp_client_1 = require("./e2b-mcp-client");
class MCPService {
    constructor() {
        this.servers = new Map();
        this.activeServers = new Map();
        this.tools = new Map();
        this.initializeDefaultServers();
    }
    initializeDefaultServers() {
        // E2B MCP Server configuration
        this.addServer('e2b-mcp-server', {
            name: 'e2b-mcp-server',
            command: 'uvx',
            args: ['e2b-mcp-server'],
            env: {
                E2B_API_KEY: 'e2b_bd87a8ef9e34199ee95b2abe96863cd2cf08a6e2'
            }
        });
    }
    addServer(name, config) {
        this.servers.set(name, config);
    }
    async startServer(name) {
        const config = this.servers.get(name);
        if (!config) {
            console.error(`MCP Server '${name}' not found`);
            return false;
        }
        if (this.activeServers.has(name)) {
            console.log(`MCP Server '${name}' already running`);
            return true;
        }
        try {
            console.log(`Starting MCP Server: ${name}`);
            if (name === 'e2b-mcp-server') {
                // Use the dedicated E2B client
                const success = await e2b_mcp_client_1.e2bClient.connect();
                if (success) {
                    this.activeServers.set(name, null); // Mark as active
                    this.tools.set(name, e2b_mcp_client_1.e2bClient.getTools());
                    return true;
                }
                return false;
            }
            // For other servers, use the original spawn method
            const serverProcess = (0, child_process_1.spawn)(config.command, config.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, ...config.env }
            });
            this.activeServers.set(name, serverProcess);
            // Handle server output
            serverProcess.stdout?.on('data', (data) => {
                console.log(`[${name}] ${data.toString()}`);
            });
            serverProcess.stderr?.on('data', (data) => {
                console.error(`[${name}] Error: ${data.toString()}`);
            });
            serverProcess.on('close', (code) => {
                console.log(`MCP Server '${name}' closed with code ${code}`);
                this.activeServers.delete(name);
                this.tools.delete(name);
            });
            serverProcess.on('error', (error) => {
                console.error(`Failed to start MCP Server '${name}':`, error);
                this.activeServers.delete(name);
                this.tools.delete(name);
            });
            // Wait a bit for the server to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Try to discover tools from this server
            await this.discoverTools(name);
            return true;
        }
        catch (error) {
            console.error(`Error starting MCP Server '${name}':`, error);
            return false;
        }
    }
    async discoverTools(serverName) {
        try {
            // For now, we'll define some basic tools that e2b typically provides
            // In a real implementation, you would communicate with the MCP server
            // to discover available tools dynamically
            const e2bTools = [
                {
                    name: 'create_sandbox',
                    description: 'Create a new E2B sandbox environment',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            template: {
                                type: 'string',
                                description: 'The template to use for the sandbox'
                            },
                            metadata: {
                                type: 'object',
                                description: 'Optional metadata for the sandbox'
                            }
                        },
                        required: ['template']
                    }
                },
                {
                    name: 'run_code',
                    description: 'Execute code in an E2B sandbox',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sandboxId: {
                                type: 'string',
                                description: 'The ID of the sandbox to run code in'
                            },
                            code: {
                                type: 'string',
                                description: 'The code to execute'
                            },
                            language: {
                                type: 'string',
                                description: 'The programming language (python, javascript, etc.)'
                            }
                        },
                        required: ['sandboxId', 'code']
                    }
                },
                {
                    name: 'list_files',
                    description: 'List files in an E2B sandbox',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sandboxId: {
                                type: 'string',
                                description: 'The ID of the sandbox'
                            },
                            path: {
                                type: 'string',
                                description: 'The path to list (defaults to root)'
                            }
                        },
                        required: ['sandboxId']
                    }
                },
                {
                    name: 'read_file',
                    description: 'Read a file from an E2B sandbox',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sandboxId: {
                                type: 'string',
                                description: 'The ID of the sandbox'
                            },
                            path: {
                                type: 'string',
                                description: 'The path to the file to read'
                            }
                        },
                        required: ['sandboxId', 'path']
                    }
                },
                {
                    name: 'write_file',
                    description: 'Write content to a file in an E2B sandbox',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sandboxId: {
                                type: 'string',
                                description: 'The ID of the sandbox'
                            },
                            path: {
                                type: 'string',
                                description: 'The path where to write the file'
                            },
                            content: {
                                type: 'string',
                                description: 'The content to write to the file'
                            }
                        },
                        required: ['sandboxId', 'path', 'content']
                    }
                }
            ];
            this.tools.set(serverName, e2bTools);
            return e2bTools;
        }
        catch (error) {
            console.error(`Error discovering tools for server '${serverName}':`, error);
            return [];
        }
    }
    async callTool(serverName, toolName, arguments_) {
        try {
            console.log(`Calling tool '${toolName}' on server '${serverName}' with args:`, arguments_);
            if (serverName === 'e2b-mcp-server') {
                // Use the E2B client for real tool calls
                return await e2b_mcp_client_1.e2bClient.callTool(toolName, arguments_);
            }
            // For other servers, simulate tool calls
            switch (toolName) {
                case 'create_sandbox':
                    return {
                        success: true,
                        sandboxId: `sandbox_${Date.now()}`,
                        message: 'Sandbox created successfully'
                    };
                case 'run_code':
                    return {
                        success: true,
                        output: 'Code executed successfully',
                        exitCode: 0
                    };
                case 'list_files':
                    return {
                        success: true,
                        files: ['main.py', 'requirements.txt', 'README.md']
                    };
                case 'read_file':
                    return {
                        success: true,
                        content: 'File content here...',
                        path: arguments_.path
                    };
                case 'write_file':
                    return {
                        success: true,
                        message: 'File written successfully',
                        path: arguments_.path
                    };
                default:
                    return {
                        success: false,
                        error: `Unknown tool: ${toolName}`
                    };
            }
        }
        catch (error) {
            console.error(`Error calling tool '${toolName}' on server '${serverName}':`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    getAvailableTools() {
        const allTools = [];
        for (const [serverName, tools] of this.tools.entries()) {
            for (const tool of tools) {
                allTools.push({
                    type: 'function',
                    function: {
                        name: `${serverName}_${tool.name}`,
                        description: tool.description,
                        parameters: tool.inputSchema
                    }
                });
            }
        }
        return allTools;
    }
    async startAllServers() {
        const serverPromises = Array.from(this.servers.keys()).map(name => this.startServer(name));
        await Promise.all(serverPromises);
    }
    stopServer(name) {
        if (name === 'e2b-mcp-server') {
            e2b_mcp_client_1.e2bClient.disconnect();
            this.activeServers.delete(name);
            this.tools.delete(name);
            return true;
        }
        const server = this.activeServers.get(name);
        if (server) {
            server.kill();
            this.activeServers.delete(name);
            this.tools.delete(name);
            return true;
        }
        return false;
    }
    stopAllServers() {
        for (const [name, server] of this.activeServers.entries()) {
            if (name === 'e2b-mcp-server') {
                e2b_mcp_client_1.e2bClient.disconnect();
            }
            else if (server) {
                server.kill();
            }
        }
        this.activeServers.clear();
        this.tools.clear();
    }
    isServerRunning(name) {
        return this.activeServers.has(name);
    }
    getServerStatus() {
        const status = {};
        for (const name of this.servers.keys()) {
            status[name] = this.isServerRunning(name);
        }
        return status;
    }
}
exports.MCPService = MCPService;
// Export default instance
exports.mcpService = new MCPService();
//# sourceMappingURL=mcp-server.js.map