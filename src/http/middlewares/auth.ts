// import type { FastifyInstance } from 'fastify'
// import fastifyPlugin from 'fastify-plugin'

// import { UnauthorizedError } from '../_errors/unauthorized-error'

// export const auth = fastifyPlugin(async (app: FastifyInstance) => {
//   app.addHook('preHandler', async (request) => {
//     // await request.jwtVerify() // all routes must be authenticated
//     request.getCurrentUserId = async () => {
//       try {
//         const { sub } = await request.jwtVerify<{ sub: string }>()
//         return sub
//       } catch {
//         throw new UnauthorizedError('Invalid auth token')
//       }
//     }
//   })
// })
