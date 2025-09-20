import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { readAllFiles } from '../services/fileReader';
import { MigrateToTable } from '../services/MigrateToTable';

export async function servicesRoutes(app: FastifyInstance) {
  // File Reader Service Routes
  app.get('/services/fileReader/readAllFiles', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await readAllFiles();
      return reply.send({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      app.log.error(`Error reading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return reply.status(500).send({
        success: false,
        error: 'Failed to read files',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Migration Service Routes
  app.get('/services/migrate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const migrateService = new MigrateToTable();
      await migrateService.migrate();

      return reply.send({
        success: true,
        message: 'Migration completed successfully'
      });
    } catch (error) {
      app.log.error(`Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return reply.status(500).send({
        success: false,
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for services
  app.get('/services/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      services: {
        fileReader: {
          available: true,
          methods: ['readAllFiles']
        },
        migrateToTable: {
          available: true,
          methods: ['migrate']
        }
      }
    });
  });
}