import { CreateUrlUseCase } from "@/application/useCases/CreateUrl.useCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUrlDto } from "../dtos/url/createUrl.dto";

export class UrlController {
  constructor (
    private readonly createUrlUseCase: CreateUrlUseCase
  ) {}

  async create (request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as CreateUrlDto

    await this.createUrlUseCase.execute(payload)

    return reply.status(201).send()
  }
}