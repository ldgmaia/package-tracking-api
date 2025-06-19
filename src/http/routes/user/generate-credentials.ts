import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { randomBytes, scryptSync } from 'crypto'

function generateRandomString(length: number) {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function generateCredentials(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/generate-credentials',
    {
      schema: {
        tags: ['Credentials'],
        summary: 'Generate user credentials',
        response: {
          201: z.object({
            user: z.string(),
            password: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const user = generateRandomString(8)
      const password = generateRandomString(12)
      const hashedPassword = hashPassword(password)

      await prisma.user.create({
        data: { username: user, password: hashedPassword },
      })

      return reply.status(201).send({ user, password })
    }
  )
}
