import { FindManyLinksPaginatedQuery } from '@/modules/link/application/queries/findManyLinksPaginated.query';
import { FindUrlByIdQuery } from '@/modules/link/application/queries/findUrlById.query';
import { GenerateQRCodePreviewQuery } from '@/modules/link/application/queries/generateQRCodePreview.query';
import { GetLinkQRCodeQuery } from '@/modules/link/application/queries/getLinkQRCode.query';
import { PublicStatsQuery } from '@/modules/link/application/queries/publicStats.query';
import { CreateAnonymousShortUrl } from '@/modules/link/application/use-cases/CreateAnonymousShortUrl.useCase';
import { CreateShortUrlUseCase } from '@/modules/link/application/use-cases/CreateShortUrl.useCase';
import { DeleteUrlUseCase } from '@/modules/link/application/use-cases/DeleteUrl.useCase';
import { RedirectUrlUseCase } from '@/modules/link/application/use-cases/RedirectUrl.useCase';
import { ToggleUrlActiveUseCase } from '@/modules/link/application/use-cases/ToggleUrlActive.useCase';
import { UpdateQrCodeOptionsUseCase } from '@/modules/link/application/use-cases/UpdateQrCodeOptions.useCase';
import { CacheGateway } from '@/modules/link/domain/interfaces/CacheGateway';
import { UrlCacheService } from '@/modules/link/domain/services/UrlCacheService';
import { ShortUrlGenerateService } from '@/modules/link/domain/services/ShortUrlGenerateService';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { UaParserDeviceService } from '@/modules/link/infra/device/UaParserDeviceService';
import { GeoipLiteGeolocationService } from '@/modules/link/infra/geolocation/GeoipLiteGeolocationService';
import { QRCodeAdapter } from '@/modules/link/infra/qrcode/QrCodeAdapter';
import { HitRepository } from '@/modules/link/infra/repositories/HitRepository';
import { UrlRepository } from '@/modules/link/infra/repositories/UrlRepository.prisma';
import { UrlUnitOfWork } from '@/modules/link/infra/repositories/UrlUnitOfWork';
import { UrlController } from '@/modules/link/presentation/controllers/url.controller';
import { UserCacheService } from '@/modules/user/domain/services/UserCacheService';
import { UserService } from '@/modules/user/domain/services/UserService';
import { UserRepository } from '@/modules/user/infra/repositories/UserRepository.prisma';
import { RedisCacheGateway } from '@/infra/cache/RedisCacheGateway';
import { envProvider } from '@/infra/config/ProcessEnvProvider';
import { prisma } from '@/infra/database/prisma';
import { FastifyInstance } from 'fastify';

const urlRepository: IUrlRepository = new UrlRepository(prisma);
const userRepository = new UserRepository(prisma);
const hitRepository = new HitRepository(prisma);

const urlUnitOfWork = new UrlUnitOfWork(prisma);
const findManyLinksPaginatedQuery = new FindManyLinksPaginatedQuery(urlRepository);

export function makeCreateLinkController(app: FastifyInstance): UrlController {
  const cache: CacheGateway = new RedisCacheGateway(app.redis);
  const urlCacheService = new UrlCacheService(cache);
  const shortUrlGenerateService = new ShortUrlGenerateService(urlRepository, envProvider);

  const createAnonymousShortUrlUseCase = new CreateAnonymousShortUrl(
    urlRepository,
    urlCacheService,
    shortUrlGenerateService,
  );

  const qrCodeAdapter = new QRCodeAdapter();

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
    envProvider,
  );

  const toggleUrlActiveUseCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);
  const deleteUrlUseCase = new DeleteUrlUseCase(urlRepository, urlCacheService);
  const publicStatsQuery = new PublicStatsQuery(cache, urlRepository, hitRepository);

  const findUrlByIdQuery = new FindUrlByIdQuery(urlRepository);
  const getLinkQRCodeQuery = new GetLinkQRCodeQuery(urlRepository, qrCodeAdapter);
  const userCacheService = new UserCacheService(cache);
  const userService = new UserService(userRepository, userCacheService);
  const generateQRCodePreviewQuery = new GenerateQRCodePreviewQuery(qrCodeAdapter, userService, envProvider);
  const updateQrCodeOptionsUseCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

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
    getLinkQRCodeQuery,
    generateQRCodePreviewQuery,
    updateQrCodeOptionsUseCase,
  );
}

export const makeUrlController = makeCreateLinkController;
