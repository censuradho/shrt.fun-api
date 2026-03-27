import { OffsetPaginationParams } from "@/domain/interfaces/Pagination";
import { IHitRepository } from "@/domain/repositories/IHitRepository";

export class FindCountryAnalyticsByUserQuery {
  constructor(private readonly hitRepository: IHitRepository) {}

  async execute(userId: string, pagination: OffsetPaginationParams) {
    return this.hitRepository.groupByCountryByUser(userId, pagination);
  }
}
