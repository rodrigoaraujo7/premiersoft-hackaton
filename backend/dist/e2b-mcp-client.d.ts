import { EventEmitter } from 'events';
export interface E2BTool {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
export declare class E2BMCPClient extends EventEmitter {
    private process;
    private isConnected;
    private tools;
    constructor();
    connect(): Promise<boolean>;
    private setupProcessHandlers;
    private handleResponse;
    private initializeTools;
    private getDefaultTools;
    callTool(toolName: string, arguments_: any): Promise<any>;
    getTools(): E2BTool[];
    isServerConnected(): boolean;
    disconnect(): void;
}
export declare const e2bClient: E2BMCPClient;
//# sourceMappingURL=e2b-mcp-client.d.ts.map