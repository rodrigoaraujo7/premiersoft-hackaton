import { FastifyInstance } from 'fastify';
import { HospitalUploadService } from '../services/upload/hospitalUploadService';
import { RegrasHospitais } from '../controllers/RegrasHospitais';

export async function hospitalUploadRoutes(fastify: FastifyInstance) {
  const hospitalUploadService = new HospitalUploadService();

  fastify.post('/upload/hospitais', async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    try {
      const result = await hospitalUploadService.upload(data);
      return reply.send({ result });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.get('/hospitais', async (req, reply) => {
    try {
      const regras = new RegrasHospitais();
      const data = await regras.getAll();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
