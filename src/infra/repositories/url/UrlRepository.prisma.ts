import { CreateUrlEntityDto } from "@/domain/repositories/dtos/CreateUrlEntity.dto";
import { IUrlRepository } from "@/domain/repositories/IUrlRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "prisma/generated/client";

export class UrlRepository implements IUrlRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async getOriginalUrl(shortUrl: string): Promise<{ originalUrl: string; id: string } | null> {
    const data = await this.prisma.url.findUnique({
      where: {
        shortUrl
      },
      select: {
        originalUrl: true,
        id: true
      }
    })

    return data || null;
  }

  async create (payload: CreateUrlEntityDto): Promise<string> { 
    const data= await this.prisma.url.create({
      data: {
        id: nanoid(),
        originalUrl: payload.originalUrl,
        shortUrl: payload.shortUrl,
        description: payload.description,
        expireAt: payload.expireAt,
        tags: payload.tags,
      },
      select: { id: true }
    })

    return data.id
  }

  async getIdByShortUrl (url: string): Promise<string | null> {
    const data = await this.prisma.url.findUnique({
      where: {
        shortUrl: url
      },
      select: {
        id: true
      }
    })

    return data?.id || null
  }

  async incrementHitsCount (id: string): Promise<void> {
    await this.prisma.url.update({
      where: { id },
      data: { hitsCount: { increment: 1 } }
    })
  }

  async delete (id: string): Promise<void> {
    await this.prisma.url.delete({
      where: {
        id
      }
    })
  }
}