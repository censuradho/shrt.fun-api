import { UrlCacheService } from '@/application/services/UrlCacheService';
import { CreateAnonymousShortUrl, CreateAnonymousUrlUseCase } from '@/application/useCases/CreateAnonymousShortUrl.useCase';
import { RedirectUrlUseCase } from '@/application/useCases/RedirectUrl.useCase';
import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { RedisCacheGateway } from '@/infra/cache/RedisCacheGateway';
import { envProvider } from '@/infra/config/ProcessEnvProvider';
import { prisma } from '@/infra/database/prisma';
import { UrlRepository } from '@/infra/repositories/url/UrlRepository.prisma';
import { UrlUnitOfWork } from '@/infra/repositories/url/UrlUnitOfWork';
import { FastifyInstance } from 'fastify';
import { UrlController } from '../controller/url.controller';
import { FindManyLinksPaginatedQuery } from '@/application/queries/findManyLinksPaginated.query';
import { ShortUrlGenerateService } from '@/application/services/ShortUrlGenerateService';
import { CreateShortUrlUseCase } from '@/application/useCases/CreateShortUrl.useCase';

const urlRepository: IUrlRepository = new UrlRepository(prisma);

const urlUnitOfWork = new UrlUnitOfWork(prisma);
const findManyLinksPaginatedQuery = new FindManyLinksPaginatedQuery(urlRepository);
  
export function makeUrlController(app: FastifyInstance): UrlController {
  const cache: CacheGateway = new RedisCacheGateway(app.redis);
  const urlCacheService = new UrlCacheService(cache);
  const shortUrlGenerateService = new ShortUrlGenerateService(urlRepository, envProvider);
  
  const createAnonymousShortUrlUseCase = new CreateAnonymousShortUrl(
    urlRepository, 
    urlCacheService, 
    shortUrlGenerateService
  );

  const createShortUrlUseCase = new CreateShortUrlUseCase(
    urlRepository, 
    urlCacheService, 
    shortUrlGenerateService
  );

  const redirectUrlUseCase = new RedirectUrlUseCase(
    urlCacheService, 
    urlUnitOfWork
  );

  return new UrlController(
    createAnonymousShortUrlUseCase, 
    redirectUrlUseCase, 
    findManyLinksPaginatedQuery,
    createShortUrlUseCase,
    envProvider
  );
}
