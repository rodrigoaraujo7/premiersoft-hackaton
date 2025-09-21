"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ai_1 = require("./AI/ai");
const services_1 = require("./routers/services");
const pacienteUpload_1 = require("./routers/pacienteUpload");
const medicoUpload_1 = require("./routers/medicoUpload");
const hospitalUpload_1 = require("./routers/hospitalUpload");
const multipart_1 = __importDefault(require("@fastify/multipart"));
// @ts-ignore
const cors_1 = __importDefault(require("@fastify/cors"));
const app = (0, fastify_1.default)({ logger: true });
// Basic health check
app.get("/", async (request, reply) => {
    return { message: "Hospital Dashboard API", status: "running" };
});
// Simple AI chat endpoint
app.post("/ai/chat", async (request, reply) => {
    const { message } = request.body;
    if (!message) {
        return reply.status(400).send({ error: "Message is required" });
    }
    const response = await ai_1.aiService.sendMessage(message);
    return reply.send(response);
});
// Run the server!
const start = async () => {
    try {
        // Register CORS
        await app.register(cors_1.default, {
            origin: "*",
            credentials: true,
        });
        // Register multipart for file uploads
        await app.register(multipart_1.default);
        // Register services routes
        await (0, services_1.servicesRoutes)(app);
        await app.register(pacienteUpload_1.patientUploadRoutes);
        await app.register(medicoUpload_1.medicoUploadRoutes);
        await app.register(hospitalUpload_1.hospitalUploadRoutes);
        await app.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Server is running on port 3000");
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map