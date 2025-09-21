import { FastifyInstance } from "fastify";
import { RegrasCID } from "../controllers/RegrasCID";

export async function cidRoutes(fastify: FastifyInstance) {
  fastify.get("/cid", async (req, reply) => {
    try {
      return reply.send({ ok: true });

      const regras = new RegrasCID();
      const data = await regras.getAll();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
