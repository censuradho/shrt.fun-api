import { OffsetPaginationParams } from "@/domain/interfaces/Pagination";
import { IHitRepository } from "@/domain/repositories/IHitRepository";

export class FindCityAnalyticsByUserQuery {
  constructor(private readonly hitRepository: IHitRepository) {}

  async execute(userId: string, pagination: OffsetPaginationParams) {
    return this.hitRepository.groupByCityByUser(userId, pagination);
  }
}