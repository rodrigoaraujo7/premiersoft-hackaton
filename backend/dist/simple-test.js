"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("./ai");
async function simpleTest() {
    console.log('Starting simple MCP test...');
    try {
        // Wait for MCP initialization
        console.log('Waiting for MCP servers to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Check server status
        const status = ai_1.aiService.getMCPServerStatus();
        console.log('MCP Server Status:', status);
        // Test a simple message
        console.log('\nTesting simple AI message...');
        const response = await ai_1.aiService.sendMessage('Hello, can you help me with something?');
        console.log('Response success:', response.success);
        if (response.success && response.data?.choices?.[0]?.message?.content) {
            console.log('AI Response:', response.data.choices[0].message.content);
        }
        else {
            console.log('Response error:', response.error);
        }
    }
    catch (error) {
        console.error('Test error:', error);
    }
    console.log('\nTest completed');
}
simpleTest();
//# sourceMappingURL=simple-test.js.map