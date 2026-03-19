import { CreateUrlUseCase } from "@/application/useCases/CreateUrl.useCase";
import { RedirectUrlUseCase } from "@/application/useCases/RedirectUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";
import { HTTP_REDIRECT_CODES } from "@/shered/httpStatusCodes";

export class UrlController {
  constructor (
    private readonly createUrlUseCase: CreateUrlUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase
  ) {}

  async create (request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as CreateUrlDto
    await this.createUrlUseCase.execute(payload)
    return reply.status(201).send()
  }

  async redirect (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const originalUrl = await this.redirectUrlUseCase.execute(
      request.params.slug,
      request.ip,
      request.headers['user-agent'] || ''
    );
    return reply.redirect(originalUrl, HTTP_REDIRECT_CODES.FOUND)
  }
}