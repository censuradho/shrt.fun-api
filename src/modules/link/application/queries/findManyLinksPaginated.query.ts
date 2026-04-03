import { CursorPaginationParams } from "@/shared/types/Pagination";
import { IUrlRepository, UrlPaginationFilters } from "@/modules/link/domain/repositories/IUrlRepository";
import { FindManyLinksFiltersDto } from "@/modules/link/application/dtos/find-many-links-filters.dto";

export class FindManyLinksPaginatedQuery {
  constructor (
    private readonly urlRepository: IUrlRepository
  ) {}

  async execute (userId: string, queries: FindManyLinksFiltersDto) {
    const { 
      cursor, 
      limit, 
      isActive, 
      search,
      createdAfter,
      createdBefore,
      source
    } = queries;

    const filters: UrlPaginationFilters = {
      isActive,
      search,
      createdAfter,
      createdBefore,
      source
    }

    const pagination: CursorPaginationParams = {
      cursor,
      limit,
    }
    
    return this.urlRepository.findManyPaginated(userId, pagination, filters);
  }
}