const fastify = require('fastify')({ logger: true })
const { aiService } = require('./ai')

// Basic health check
fastify.get('/', async (request, reply) => {
  return { message: 'Hospital Dashboard API', status: 'running' }
})

// Simple AI chat endpoint
fastify.post('/ai/chat', async (request, reply) => {
  const { message } = request.body
  
  if (!message) {
    return reply.status(400).send({ error: 'Message is required' })
  }

  const response = await aiService.sendMessage(message)
  return reply.send(response)
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()