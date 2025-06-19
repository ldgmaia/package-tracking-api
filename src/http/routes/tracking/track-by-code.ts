import { prisma } from '@/lib/prisma'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { scryptSync } from 'crypto'
import { trackPackage } from '@/services/carriers/track'

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      username: string
      password: string
    }
  }
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const hashVerify = scryptSync(password, salt, 64).toString('hex')
  return hash === hashVerify
}

async function basicAuth(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers['authorization']
  if (!auth || !auth.startsWith('Basic ')) {
    return reply
      .code(401)
      .header('WWW-Authenticate', 'Basic')
      .send({ message: 'Missing Authorization header' })
  }
  const base64 = auth.replace('Basic ', '')
  const [username, password] = Buffer.from(base64, 'base64')
    .toString()
    .split(':')

  const user = await prisma.user.findUnique({ where: { username } })

  if (!user || !verifyPassword(password, user.password)) {
    return reply
      .code(401)
      .header('WWW-Authenticate', 'Basic')
      .send({ message: 'Invalid credentials' })
  }
  // Attach user to request in a type-safe way
  request.user = user
}

const trackBodySchema = z.object({
  carrier: z.string().min(1, 'Carrier is required'),
  trackingCode: z.string().min(1, 'Tracking code is required'),
})
type TrackBody = z.infer<typeof trackBodySchema>

export async function trackByCode(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .addHook('onRequest', basicAuth)
    .post(
      '/track-by-code',
      {
        schema: {
          tags: ['Tracking'],
          summary: 'Track package by code',
          body: trackBodySchema,
          response: {
            201: z.object({
              latestStatus: z.string(),
            }),
          },
        },
      },
      async (request: FastifyRequest<{ Body: TrackBody }>, reply) => {
        const { carrier, trackingCode } = request.body
        try {
          const trackingResult = await trackPackage(carrier, trackingCode)
          return reply.status(201).send({
            latestStatus: trackingResult.status,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Tracking failed'
          return reply.status(400).send({ error: message })
        }
      }
    )
}
