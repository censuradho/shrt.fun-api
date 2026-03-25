import { CreateAnonymousUrlUseCase } from "@/application/useCases/CreateAnonymous.useCase";
import { RedirectUrlUseCase } from "@/application/useCases/RedirectUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";
import { HTTP_REDIRECT_CODES } from "@/shered/httpStatusCodes";
import { FindManyLinksFiltersDto } from "../dtos/url/findManyLinksQueries.dto";
import { FindManyLinksPaginatedQuery } from "@/application/queries/findManyLinksPaginated.query";

export class UrlController {
  constructor (
    private readonly CreateAnonymousUrlUseCase: CreateAnonymousUrlUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findManyLinksPaginatedQuery: FindManyLinksPaginatedQuery
  ) {}

  async create (request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as CreateUrlDto
    const shortUrl = await this.CreateAnonymousUrlUseCase.execute(payload)

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