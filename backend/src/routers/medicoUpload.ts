import { FastifyInstance } from 'fastify';
import { MedicoUploadService } from '../services/medicoUploadService';

export async function medicoUploadRoutes(fastify: FastifyInstance) {
  const medicoUploadService = new MedicoUploadService();

  fastify.post('/upload/medicos', async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    try {
      const result = await medicoUploadService.upload(data);
      return reply.send({ result });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
