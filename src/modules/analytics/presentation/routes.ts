import { makeAnalyticsController } from './factories/makeAnalyticsController';
import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { offsetPaginationQueriesDto } from '@/shared/types/pagination-queries.dto';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { topMostAccessedUrlsQueryDto, TopMostAccessedUrlsQueryDto } from './schemas/analytics.schema';
import {
  locationAnalyticsResponseDto,
  locationClicksOffsetPaginatedResponseDto,
  referrerDistributionResponseDto,
  topMostAccessedUrlsDetailResponseDto,
  topMostAccessedUrlsResponseDto,
} from '../application/dtos/analytics-response.dto';

const urlParamsDto = z.object({ urlId: z.string() });

export async function registerAnalyticsRoutes(app: FastifyInstance) {
  const analyticsController = makeAnalyticsController();

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Ranking dos links mais acessados do usuário',
        security: [{ bearerAuth: [] }],
        querystring: topMostAccessedUrlsQueryDto,
        response: { 200: topMostAccessedUrlsResponseDto },
      },
    },
    analyticsController.topMostAccessedUrls.bind(analyticsController),
  );

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking/details',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Detalhes do ranking dos links mais acessados do usuário',
        security: [{ bearerAuth: [] }],
        querystring: topMostAccessedUrlsQueryDto,
        response: { 200: topMostAccessedUrlsDetailResponseDto },
      },
    },
    analyticsController.topMostAccessedUrlsDetail.bind(analyticsController),
  );

  app.get(
    '/url/referrer-distribution',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Distribuição de acessos por referrer',
        security: [{ bearerAuth: [] }],
        response: { 200: referrerDistributionResponseDto },
      },
    },
    analyticsController.referrerDistribution.bind(analyticsController),
  );

  app.get(
    '/locations/hits/url/:urlId/',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Localizações dos acessos de um link específico',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        response: { 200: locationAnalyticsResponseDto },
      },
    },
    analyticsController.findLocations.bind(analyticsController),
  );

  app.get(
    '/locations/hits/countries',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Acessos agrupados por país',
        security: [{ bearerAuth: [] }],
        querystring: offsetPaginationQueriesDto,
        response: { 200: locationClicksOffsetPaginatedResponseDto },
      },
    },
    analyticsController.findCountriesByUserId.bind(analyticsController),
  );

  app.get(
    '/locations/hits/cities',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Analytics'],
        summary: 'Acessos agrupados por cidade',
        security: [{ bearerAuth: [] }],
        querystring: offsetPaginationQueriesDto,
        response: { 200: locationClicksOffsetPaginatedResponseDto },
      },
    },
    analyticsController.findCitiesByUserId.bind(analyticsController),
  );
}
