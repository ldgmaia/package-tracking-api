import fastify from 'fastify'

import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
// import { sendCode } from './http/routes/auth/send-code'
// import { verifyCode } from './http/routes/auth/verify-code'
// import { seriesSearch } from './http/routes/series/search'
import { errorHandler } from './error-handler'
import { generateCredentials } from './http/routes/user/generate-credentials'
import { trackByCode } from './http/routes/tracking/track-by-code'

export const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Package Tracking API',
      description: 'Package Tracking backend service',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyCors)

app.register(generateCredentials)
app.register(trackByCode)
// app.register(seriesSearch)
