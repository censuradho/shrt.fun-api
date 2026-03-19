import { IUnitOfWork } from "@/domain/interfaces/IUnitOfWork";
import { IUrlRepository } from "@/domain/repositories/IUrlRepository";
import { PrismaClient } from "prisma/generated/client";
import { UrlRepository } from "./UrlRepository.prisma";

export interface IUrlUoWRepositories {
  url: IUrlRepository;
}

export type IUrlUnitOfWork = IUnitOfWork<IUrlUoWRepositories>;

export class UrlUnitOfWork implements IUrlUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  run<T>(work: (repositories: IUrlUoWRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txClient = tx as unknown as PrismaClient;

      return work({ 
        url: new UrlRepository(txClient) 
      });
    });
  }
}