import { OffsetPaginationParams } from "@/shared/types/Pagination";
import { IHitRepository } from "@/modules/link/domain/repositories/IHitRepository";

export class FindCityAnalyticsByUserQuery {
  constructor(private readonly hitRepository: IHitRepository) {}

  async execute(userId: string, pagination: OffsetPaginationParams) {
    return this.hitRepository.groupByCityByUser(userId, pagination);
  }
}