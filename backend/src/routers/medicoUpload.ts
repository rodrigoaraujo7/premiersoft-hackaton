import { FastifyInstance } from "fastify";
import { MedicoUploadService } from "../services/upload/medicoUploadService";
import { RegrasMedicos } from "../controllers/RegrasMedicos";

export async function medicoUploadRoutes(fastify: FastifyInstance) {
  const medicoUploadService = new MedicoUploadService();

  fastify.post("/upload/medicos", async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    try {
      const result = await medicoUploadService.upload(data);
      return reply.send({ result });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.get("/medicos", async (req, reply) => {
    try {
      return reply.send({ ok: true });

      const regras = new RegrasMedicos();
      const data = await regras.getAll();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
