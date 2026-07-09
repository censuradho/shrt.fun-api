import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export const swaggerPlugin = fp(async (app) => {
  await app.register(fastifySwagger, {
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: 'MV API',
        description: 'API do encurtador de URLs MV',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Cadastro, login e sessão do usuário' },
        { name: 'Links', description: 'Criação e gestão de links encurtados' },
        { name: 'Redirect', description: 'Redirecionamento público de links encurtados' },
        { name: 'Analytics', description: 'Métricas e estatísticas de acesso aos links' },
        { name: 'User', description: 'Gestão do perfil do usuário autenticado' },
        { name: 'Health', description: 'Status da aplicação' },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      defaultModelRendering: 'model',
    },
  });
});
