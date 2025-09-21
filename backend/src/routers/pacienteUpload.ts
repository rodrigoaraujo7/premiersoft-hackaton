import { FastifyInstance } from 'fastify';
import { PatientUploadService } from '../services/pacienteUploadService';

export async function patientUploadRoutes(fastify: FastifyInstance) {
  const patientUploadService = new PatientUploadService();

  fastify.post('/upload/pacientes', async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    try {
      const result = await patientUploadService.upload(data);
      return reply.send({ result });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
