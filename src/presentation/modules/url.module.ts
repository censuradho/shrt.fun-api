import { UrlController } from '../controller/url.controller';
import { CreateUrlUseCase } from '@/application/useCases/CreateUrl.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { UrlRepository } from '@/infra/repositories/url/UrlRepository.prisma';
import { prisma } from '@/infra/database/prisma';
import { RedisCacheGateway } from '@/infra/cache/RedisCacheGateway';
import { FastifyInstance } from 'fastify';
import { UrlCacheService } from '@/application/services/UrlCacheService';
import { envProvider } from '@/infra/config/ProcessEnvProvider';

// Importe ou instancie as dependências reais conforme sua arquitetura
const urlRepository: IUrlRepository = new UrlRepository(
  prisma
) 


export function makeUrlController(app: FastifyInstance): UrlController {
  const cache: CacheGateway = new RedisCacheGateway(app.redis)
  const urlCacheService = new UrlCacheService(cache);

  const createUrlUseCase = new CreateUrlUseCase(
    urlRepository, 
    urlCacheService, 
    envProvider
  );

  return new UrlController(createUrlUseCase);
}
