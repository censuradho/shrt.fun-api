import { FindLocationAnalyticsQuery } from '@/application/queries/findLocationAnalytics.query';
import { FindCountryAnalyticsByUserQuery } from '@/application/queries/findCountryAnalyticsByUser.query';
import { FindCityAnalyticsByUserQuery } from '@/application/queries/findLocationAnalyticsByUser.query';
import { OffsetPaginationQueriesDto } from '@/presentation/dtos/paginationQueries.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IAnalyticsRepository } from '@/domain/repositories/IAnalyticsRepository';
import { TopMostAccessedUrlsQueryDto } from '../dtos/analytics.dto';

export class AnalyticsController {
  constructor(
    private readonly findLocationAnalyticsQuery: FindLocationAnalyticsQuery,
    private readonly findCountryAnalyticsByUserQuery: FindCountryAnalyticsByUserQuery,
    private readonly findCityAnalyticsByUserQuery: FindCityAnalyticsByUserQuery,
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async findLocations(request: FastifyRequest, reply: FastifyReply) {
    const { urlId } = request.params as { urlId: string };
    const result = await this.findLocationAnalyticsQuery.execute(urlId, request.user.id);
    return reply.send(result);
  }

  async findCountriesByUserId(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const { offset, limit } = request.query as OffsetPaginationQueriesDto;
    const data = await this.findCountryAnalyticsByUserQuery.execute(userId, { offset, limit });
    return reply.send(data);
  }

  async findCitiesByUserId(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const { offset, limit } = request.query as OffsetPaginationQueriesDto;
    const data = await this.findCityAnalyticsByUserQuery.execute(userId, { offset, limit });
    return reply.send(data);
  }

  async topMostAccessedUrls(request: FastifyRequest<{ Querystring: TopMostAccessedUrlsQueryDto }>, reply: FastifyReply) {
    const {
      isActive,
    } = request.query;

    const userId = request.user.id;

    const data = await this.analyticsRepository.topMostAccessedUrls(userId, {
      isActive,
      limit: 5,
    });
    return reply.send(data);
  }

  async referrerDistribution(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const data = await this.analyticsRepository.referrerDistribution(userId);
    return reply.send(data);
  }

  async topMostAccessedUrlsDetail(request: FastifyRequest<{ Querystring: TopMostAccessedUrlsQueryDto }>, reply: FastifyReply) {
    const {
      isActive,
    } = request.query;

    const userId = request.user.id;

    const data = await this.analyticsRepository.topMostAccessedUrlsByLocationDeviceAndOS(userId, {
      isActive,
      limit: 5,
    });
    return reply.send(data);
  }
}
