import { UrlCacheService } from '@/application/services/UrlCacheService';
import { QRCodeAdapter } from '@/infra/qrcode/QrCodeAdapter';
import { CreateAnonymousShortUrl } from '@/application/useCases/CreateAnonymousShortUrl.useCase';
import { RedirectUrlUseCase } from '@/application/useCases/RedirectUrl.useCase';
import { ToggleUrlActiveUseCase } from '@/application/useCases/ToggleUrlActive.useCase';
import { DeleteUrlUseCase } from '@/application/useCases/DeleteUrl.useCase';
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
import { FindUrlByIdQuery } from '@/application/queries/findUrlById.query';
import { ShortUrlGenerateService } from '@/application/services/ShortUrlGenerateService';
import { CreateShortUrlUseCase } from '@/application/useCases/CreateShortUrl.useCase';
import { GeoipLiteGeolocationService } from '@/infra/geolocation/GeoipLiteGeolocationService';
import { UaParserDeviceService } from '@/infra/device/UaParserDeviceService';
import { UserRepository } from '@/infra/repositories/user/UserRepository.prisma';
import { HitRepository } from '@/infra/repositories/hit/HitRepository';
import { PublicStatsQuery } from '@/application/queries/publicStats.query';
import { GetLinkQRCodeQuery } from '@/application/queries/getLinkQRCode.query';

const urlRepository: IUrlRepository = new UrlRepository(prisma);
const userRepository = new UserRepository(prisma);
const hitRepository = new HitRepository(prisma);

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

  const qrCodeAdapter = new QRCodeAdapter()

  const createShortUrlUseCase = new CreateShortUrlUseCase(
    urlRepository,
    urlCacheService,
    shortUrlGenerateService,
    userRepository,
    qrCodeAdapter,
  );

  const redirectUrlUseCase = new RedirectUrlUseCase(
    urlCacheService,
    urlUnitOfWork,
    new GeoipLiteGeolocationService(),
    new UaParserDeviceService(),
    envProvider
  );

  const toggleUrlActiveUseCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);
  const deleteUrlUseCase = new DeleteUrlUseCase(urlRepository, urlCacheService);
  const publicStatsQuery = new PublicStatsQuery(cache, urlRepository, hitRepository);

  const findUrlByIdQuery = new FindUrlByIdQuery(urlRepository);
  const getLinkQRCodeQuery = new GetLinkQRCodeQuery(urlRepository, qrCodeAdapter);

  return new UrlController(
    createAnonymousShortUrlUseCase,
    redirectUrlUseCase,
    findManyLinksPaginatedQuery,
    findUrlByIdQuery,
    createShortUrlUseCase,
    toggleUrlActiveUseCase,
    deleteUrlUseCase,
    publicStatsQuery,
    envProvider,
    qrCodeAdapter,
    getLinkQRCodeQuery,
  );
}
