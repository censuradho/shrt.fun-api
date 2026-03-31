import { CreateAnonymousShortUrl } from "@/application/useCases/CreateAnonymousShortUrl.useCase";
import { RedirectUrlUseCase } from "@/application/useCases/RedirectUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";
import { HTTP_REDIRECT_CODES, HTTP_STATUS_CODES } from "@/shered/httpStatusCodes";
import { FindManyLinksFiltersDto } from "../dtos/url/findManyLinksQueries.dto";
import { FindManyLinksPaginatedQuery } from "@/application/queries/findManyLinksPaginated.query";
import { FindUrlByIdQuery } from "@/application/queries/findUrlById.query";
import { CreateShortUrlUseCase } from "@/application/useCases/CreateShortUrl.useCase";
import { ToggleUrlActiveUseCase } from "@/application/useCases/ToggleUrlActive.useCase";
import { DeleteUrlUseCase } from "@/application/useCases/DeleteUrl.useCase";
import { PublicStatsQuery } from "@/application/queries/publicStats.query";
import { IEnvProvider } from "@/domain/services/EnvProvider";

export class UrlController {
  constructor (
    private readonly createAnonymousShortUrlUseCase: CreateAnonymousShortUrl,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findManyLinksPaginatedQuery: FindManyLinksPaginatedQuery,
    private readonly findUrlByIdQuery: FindUrlByIdQuery,
    private readonly createShortUrlUseCase: CreateShortUrlUseCase,
    private readonly toggleUrlActiveUseCase: ToggleUrlActiveUseCase,
    private readonly deleteUrlUseCase: DeleteUrlUseCase,
    private readonly publicStatsQuery: PublicStatsQuery,
    private readonly envProvider: IEnvProvider
  ) {}

  async create (request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const payload = request.body as CreateUrlDto
    const shortUrl = await this.createShortUrlUseCase.execute(userId, payload)


    return reply.status(201).send({ shortUrl });
  }

  async createAnonymous (request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as CreateUrlDto
    const shortUrl = await this.createAnonymousShortUrlUseCase.execute(payload)

    return reply.status(201).send({ shortUrl });
  }

  async redirect (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const data = await this.redirectUrlUseCase.execute(
      request.params.slug,
      request.ip,
      request.headers['user-agent'] || '',
      request.headers['referer'] || null
    );
    if (!data.isActive) 
      return reply
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .redirect(`${this.envProvider.get('DOMAIN_URL')}/static/not-found`, HTTP_REDIRECT_CODES.FOUND)

    return reply.redirect(data.originalUrl, HTTP_REDIRECT_CODES.FOUND)
  }

  async toggleActive (request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.toggleUrlActiveUseCase.execute(id, request.user.id);
    return reply.send(result);
  }

  async delete (request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.deleteUrlUseCase.execute(id, request.user.id);
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }

  async publicStats (_request: FastifyRequest, reply: FastifyReply) {
    const result = await this.publicStatsQuery.execute();
    return reply.send(result);
  }

  async findById (request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.findUrlByIdQuery.execute(id, request.user.id);
    return reply.send(result);
  }

  async findManyPaginated (request: FastifyRequest, reply: FastifyReply) {
    const queries = request.query as FindManyLinksFiltersDto

    const result = await this.findManyLinksPaginatedQuery.execute(request.user.id, queries)

    return reply.send(result);
  }
}