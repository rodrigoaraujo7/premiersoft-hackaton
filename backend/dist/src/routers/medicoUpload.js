"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicoUploadRoutes = medicoUploadRoutes;
const medicoUploadService_1 = require("../services/upload/medicoUploadService");
async function medicoUploadRoutes(fastify) {
    const medicoUploadService = new medicoUploadService_1.MedicoUploadService();
    fastify.post('/upload/medicos', async (req, reply) => {
        const data = await req.file();
        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }
        try {
            const result = await medicoUploadService.upload(data);
            return reply.send({ result });
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    });
}
//# sourceMappingURL=medicoUpload.js.map