import { FastifyInstance } from "fastify";
import { RegrasMunicipios } from "../controllers/RegrasMunicipios";

export async function municipiosRoutes(fastify: FastifyInstance) {
  fastify.get("/municipios", async (req, reply) => {
    try {
      return reply.send({ ok: true });

      const regras = new RegrasMunicipios();
      const data = await regras.getAll();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
