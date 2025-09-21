import { FastifyInstance } from 'fastify';
import { RegrasEstados } from '../controllers/RegrasEstados';

export async function estadosRoutes(fastify: FastifyInstance) {
  fastify.get('/estados', async (req, reply) => {
    try {
      const regras = new RegrasEstados();
      const data = await regras.getAll();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}