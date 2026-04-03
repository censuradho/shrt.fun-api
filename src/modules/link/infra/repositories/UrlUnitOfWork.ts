import { IUnitOfWork } from "@/modules/link/domain/interfaces/IUnitOfWork";
import { IUrlRepository } from "@/modules/link/domain/repositories/IUrlRepository";
import { PrismaClient } from "@/generated/prisma/client";
import { UrlRepository } from "./UrlRepository.prisma";
import { IHitRepository } from "@/modules/link/domain/repositories/IHitRepository";
import { HitRepository } from "./HitRepository";

export interface IUrlUoWRepositories {
  url: IUrlRepository;
  hit: IHitRepository
}

export type IUrlUnitOfWork = IUnitOfWork<IUrlUoWRepositories>;

export class UrlUnitOfWork implements IUrlUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  run<T>(work: (repositories: IUrlUoWRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txClient = tx as unknown as PrismaClient;

      return work({ 
        url: new UrlRepository(txClient),
        hit: new HitRepository(txClient)
      });
    });
  }
}