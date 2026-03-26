import { CreateAnonymousShortUrl } from "@/application/useCases/CreateAnonymousShortUrl.useCase";
import { RedirectUrlUseCase } from "@/application/useCases/RedirectUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";
import { HTTP_REDIRECT_CODES, HTTP_STATUS_CODES } from "@/shered/httpStatusCodes";
import { FindManyLinksFiltersDto } from "../dtos/url/findManyLinksQueries.dto";
import { FindManyLinksPaginatedQuery } from "@/application/queries/findManyLinksPaginated.query";
import { CreateShortUrlUseCase } from "@/application/useCases/CreateShortUrl.useCase";
import { IEnvProvider } from "@/domain/services/EnvProvider";

export class UrlController {
  constructor (
    private readonly createAnonymousShortUrlUseCase: CreateAnonymousShortUrl,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findManyLinksPaginatedQuery: FindManyLinksPaginatedQuery,
    private readonly createShortUrlUseCase: CreateShortUrlUseCase,
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
      request.headers['user-agent'] || ''
    );
    if (!data.isActive) 
      return reply
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .redirect(`${this.envProvider.get('DOMAIN_URL')}/static/not-found`, HTTP_REDIRECT_CODES.FOUND)

    return reply.redirect(data.originalUrl, HTTP_REDIRECT_CODES.FOUND)
  }

  async findManyPaginated (request: FastifyRequest, reply: FastifyReply) {
    const queries = request.query as FindManyLinksFiltersDto

    const result = await this.findManyLinksPaginatedQuery.execute(request.user.id, queries)

    return reply.send(result);
  }
}