import { FindLocationAnalyticsQuery } from '@/application/queries/findLocationAnalytics.query';
import { FastifyReply, FastifyRequest } from 'fastify';

export class AnalyticsController {
  constructor(
    private readonly findLocationAnalyticsQuery: FindLocationAnalyticsQuery
  ) {}

  async findLocations(request: FastifyRequest, reply: FastifyReply) {
    const { urlId } = request.params as { urlId: string };
    const result = await this.findLocationAnalyticsQuery.execute(urlId, request.user.id);
    return reply.send(result);
  }
}
