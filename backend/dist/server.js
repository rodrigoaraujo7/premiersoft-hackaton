"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ai_1 = require("./ai");
const app = (0, fastify_1.default)({ logger: true });
// Basic health check
app.get('/', async (request, reply) => {
    return { message: 'Hospital Dashboard API', status: 'running' };
});
// Simple AI chat endpoint
app.post('/ai/chat', async (request, reply) => {
    const { message } = request.body;
    if (!message) {
        return reply.status(400).send({ error: 'Message is required' });
    }
    const response = await ai_1.aiService.sendMessage(message);
    return reply.send(response);
});
// Run the server!
const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server is running on port 3000');
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map