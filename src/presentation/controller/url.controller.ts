import { CreateAnonymousShortUrl } from "@/application/useCases/CreateAnonymousShortUrl.useCase";
import { RedirectUrlUseCase } from "@/application/useCases/RedirectUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";
import { HTTP_REDIRECT_CODES } from "@/shered/httpStatusCodes";
import { FindManyLinksFiltersDto } from "../dtos/url/findManyLinksQueries.dto";
import { FindManyLinksPaginatedQuery } from "@/application/queries/findManyLinksPaginated.query";
import { CreateShortUrlUseCase } from "@/application/useCases/CreateShortUrl.useCase";

export class UrlController {
  constructor (
    private readonly createAnonymousShortUrlUseCase: CreateAnonymousShortUrl,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findManyLinksPaginatedQuery: FindManyLinksPaginatedQuery,
    private readonly createShortUrlUseCase: CreateShortUrlUseCase
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
    const originalUrl = await this.redirectUrlUseCase.execute(
      request.params.slug,
      request.ip,
      request.headers['user-agent'] || ''
    );
    return reply.redirect(originalUrl, HTTP_REDIRECT_CODES.FOUND)
  }

  async findManyPaginated (request: FastifyRequest, reply: FastifyReply) {
    const queries = request.query as FindManyLinksFiltersDto

    const result = await this.findManyLinksPaginatedQuery.execute(request.user.id, queries)

    return reply.send(result);
  }
}