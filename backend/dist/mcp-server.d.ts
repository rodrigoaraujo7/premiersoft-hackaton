export interface MCPServerConfig {
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
export declare class MCPService {
    private servers;
    private activeServers;
    private tools;
    constructor();
    private initializeDefaultServers;
    addServer(name: string, config: MCPServerConfig): void;
    startServer(name: string): Promise<boolean>;
    discoverTools(serverName: string): Promise<MCPTool[]>;
    callTool(serverName: string, toolName: string, arguments_: any): Promise<any>;
    getAvailableTools(): any[];
    startAllServers(): Promise<void>;
    stopServer(name: string): boolean;
    stopAllServers(): void;
    isServerRunning(name: string): boolean;
    getServerStatus(): Record<string, boolean>;
}
export declare const mcpService: MCPService;
//# sourceMappingURL=mcp-server.d.ts.map