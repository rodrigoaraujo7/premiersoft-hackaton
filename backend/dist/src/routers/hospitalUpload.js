"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hospitalUploadRoutes = hospitalUploadRoutes;
const hospitalUploadService_1 = require("../services/upload/hospitalUploadService");
async function hospitalUploadRoutes(fastify) {
    const hospitalUploadService = new hospitalUploadService_1.HospitalUploadService();
    fastify.post('/upload/hospitais', async (req, reply) => {
        const data = await req.file();
        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }
        try {
            const result = await hospitalUploadService.upload(data);
            return reply.send({ result });
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    });
}
//# sourceMappingURL=hospitalUpload.js.map