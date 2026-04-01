import { CursorPaginationParams } from "@/domain/interfaces/Pagination";
import { IUrlRepository, UrlPaginationFilters } from "@/domain/repositories/IUrlRepository";
import { FindManyLinksFiltersDto } from "@/presentation/dtos/url/findManyLinksQueries.dto";

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
      createdBefore
    } = queries;

    const filters: UrlPaginationFilters = {
      isActive,
      search,
      createdAfter,
      createdBefore
    }

    const pagination: CursorPaginationParams = {
      cursor,
      limit,
    }
    
    return this.urlRepository.findManyPaginated(userId, pagination, filters);
  }
}