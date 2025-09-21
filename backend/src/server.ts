import fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { aiService } from "./AI/ai";
import { servicesRoutes } from "./routers/services";
import { patientUploadRoutes } from "./routers/pacienteUpload";
import { medicoUploadRoutes } from "./routers/medicoUpload";
import { hospitalUploadRoutes } from "./routers/hospitalUpload";
import multipart from "@fastify/multipart";
// @ts-ignore
import cors from "@fastify/cors";

// Type definitions
interface ChatRequest {
  message: string;
  conversationHistory?: any[];
  tools?: any[];
  options?: any;
}

const app: FastifyInstance = fastify({ logger: true });

// Basic health check
app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Hospital Dashboard API", status: "running" };
});

// Simple AI chat endpoint
app.post(
  "/ai/chat",
  async (
    request: FastifyRequest<{ Body: ChatRequest }>,
    reply: FastifyReply
  ) => {
    const { message } = request.body;

    if (!message) {
      return reply.status(400).send({ error: "Message is required" });
    }

    const response = await aiService.sendMessage(message);
    return reply.send(response);
  }
);

// Run the server!
const start = async (): Promise<void> => {
  try {
    // Register CORS
    await app.register(cors, {
      origin: "*",
      credentials: true,
    });

    // Register multipart for file uploads
    await app.register(multipart);

    // Register services routes
    await servicesRoutes(app);
    await app.register(patientUploadRoutes);
    await app.register(medicoUploadRoutes);
    await app.register(hospitalUploadRoutes);

    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server is running on port 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
