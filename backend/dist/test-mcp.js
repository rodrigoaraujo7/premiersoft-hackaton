"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("./ai");
async function testMCPIntegration() {
    console.log('Testing MCP Integration...\n');
    try {
        // Wait a bit for MCP servers to initialize
        console.log('Waiting for MCP servers to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Check MCP server status
        const status = ai_1.aiService.getMCPServerStatus();
        console.log('MCP Server Status:', status);
        // Test a simple message without tools
        console.log('\n--- Testing simple message ---');
        const simpleResponse = await ai_1.aiService.sendMessage('Hello, how are you?');
        console.log('Simple Response:', simpleResponse.success ? 'Success' : 'Failed');
        if (simpleResponse.success && simpleResponse.data?.choices?.[0]?.message?.content) {
            console.log('AI Response:', simpleResponse.data.choices[0].message.content);
        }
        // Test a message that should trigger tool usage
        console.log('\n--- Testing message with E2B tools ---');
        const toolResponse = await ai_1.aiService.sendMessage('create an run a hello world python code in a sandbox using the mcp server');
        console.log('Tool Response Success:', toolResponse.success);
        if (toolResponse.success && toolResponse.data?.choices?.[0]?.message?.content) {
            console.log('AI Response with Tools:', toolResponse.data.choices[0].message.content);
        }
        // Test another tool-related query
        console.log('\n--- Testing file operations ---');
        const fileResponse = await ai_1.aiService.sendMessage('what is the result you got?');
        console.log('File Response Success:', fileResponse.success);
        if (fileResponse.success && fileResponse.data?.choices?.[0]?.message?.content) {
            console.log('AI Response for File Operations:', fileResponse.data.choices[0].message.content);
        }
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
// Run the test
testMCPIntegration().then(() => {
    console.log('\nTest completed');
    process.exit(0);
}).catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-mcp.js.map