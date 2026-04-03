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
import { UpdateShortUrlUseCase } from '@/modules/link/application/use-cases/UpdateShortUrl.useCase';
import { QRCodeOptions } from '@/modules/link/domain/interfaces/QRCodePort';
import { IEnvProvider } from '@/domain/EnvProvider';
import { CreateUrlDto } from '@/modules/link/application/dtos/create-url.dto';
import { UpdateUrlDto } from '@/modules/link/application/dtos/update-url.dto';
import { FindManyLinksFiltersDto } from '@/modules/link/application/dtos/find-many-links-filters.dto';
import { HTTP_REDIRECT_CODES, HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';
import { FastifyReply, FastifyRequest } from 'fastify';

export class UrlController {
  constructor(
    private readonly createAnonymousShortUrlUseCase: CreateAnonymousShortUrl,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findManyLinksPaginatedQuery: FindManyLinksPaginatedQuery,
    private readonly findUrlByIdQuery: FindUrlByIdQuery,
    private readonly createShortUrlUseCase: CreateShortUrlUseCase,
    private readonly toggleUrlActiveUseCase: ToggleUrlActiveUseCase,
    private readonly deleteUrlUseCase: DeleteUrlUseCase,
    private readonly publicStatsQuery: PublicStatsQuery,
    private readonly envProvider: IEnvProvider,
    private readonly getLinkQRCodeQuery: GetLinkQRCodeQuery,
    private readonly generateQRCodePreviewQuery: GenerateQRCodePreviewQuery,
    private readonly updateQrCodeOptionsUseCase: UpdateQrCodeOptionsUseCase,
    private readonly updateShortUrlUseCase: UpdateShortUrlUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const payload = request.body as CreateUrlDto;
    const result = await this.createShortUrlUseCase.execute(userId, payload);

    return reply.status(201).send(result);
  }

  async createAnonymous(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as CreateUrlDto;
    const shortUrl = await this.createAnonymousShortUrlUseCase.execute(payload);

    return reply.status(201).send({ shortUrl });
  }

  async redirect(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const data = await this.redirectUrlUseCase.execute(
      request.params.slug,
      request.ip,
      request.headers['user-agent'] || '',
      request.headers.referer || null,
      'url',
    );

    if (!data.isActive) {
      return reply
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .redirect(`${this.envProvider.get('DOMAIN_URL')}/static/not-found`, HTTP_REDIRECT_CODES.FOUND);
    }

    return reply.redirect(data.originalUrl, HTTP_REDIRECT_CODES.FOUND);
  }

  async redirectQr(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const data = await this.redirectUrlUseCase.execute(
      request.params.slug,
      request.ip,
      request.headers['user-agent'] || '',
      request.headers.referer || null,
      'qr',
    );

    if (!data.isActive) {
      return reply
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .redirect(`${this.envProvider.get('DOMAIN_URL')}/static/not-found`, HTTP_REDIRECT_CODES.FOUND);
    }

    return reply.redirect(data.originalUrl, HTTP_REDIRECT_CODES.FOUND);
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.toggleUrlActiveUseCase.execute(id, request.user.id);
    return reply.send(result);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.deleteUrlUseCase.execute(id, request.user.id);
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }

  async publicStats(_request: FastifyRequest, reply: FastifyReply) {
    const result = await this.publicStatsQuery.execute();
    return reply.send(result);
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.findUrlByIdQuery.execute(id, request.user.id);
    return reply.send(result);
  }

  async findManyPaginated(request: FastifyRequest, reply: FastifyReply) {
    const queries = request.query as FindManyLinksFiltersDto;

    const result = await this.findManyLinksPaginatedQuery.execute(request.user.id, queries);

    return reply.send(result);
  }

  async getLinkQRCode(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.getLinkQRCodeQuery.execute(id, request.user.id);
    return reply.send(result);
  }

  async updateQrCodeOptions(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const options = request.body as QRCodeOptions;
    await this.updateQrCodeOptionsUseCase.execute(id, request.user.id, options);
    return reply.status(204).send();
  }

  async previewQrCode(request: FastifyRequest, reply: FastifyReply) {
    const options = request.body as QRCodeOptions;
    const qrCode = await this.generateQRCodePreviewQuery.execute(request.user.id, options);
    return reply.send({ qrCode });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const payload = request.body as UpdateUrlDto;
    await this.updateShortUrlUseCase.execute(id, request.user.id, payload);
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }
}
