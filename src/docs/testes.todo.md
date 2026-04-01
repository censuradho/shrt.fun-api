## Use Cases

| Caso de teste | Arquivo |
|---|---|
| should soft delete url and return shortUrl | DeleteUrl.useCase.ts |
| should throw if url not found | DeleteUrl.useCase.ts |
| should create user with email and password | SignUpWithEmailAndPassword.useCase.ts |
| should throw if auth gateway fails | SignUpWithEmailAndPassword.useCase.ts |

## Services

| Caso de teste | Arquivo |
|---|---|
| should set url in cache and return it | UrlCacheService.ts |
| should return null if url not in cache | UrlCacheService.ts |
| should increment hits | UrlCacheService.ts |

## Queries

| Caso de teste | Arquivo |
|---|---|
| should return paginated links for user | findManyLinksPaginated.query.ts |
| should return url by id | findUrlById.query.ts |
| should return null if url not found | findUrlById.query.ts |
| should return public stats | publicStats.query.ts |
| should return country analytics for user | findCountryAnalyticsByUser.query.ts |
| should return location analytics for user | findLocationAnalyticsByUser.query.ts |
| should return location analytics | findLocationAnalytics.query.ts |

## Repositories

| Caso de teste | Arquivo |
|---|---|
| should return referrer distribution grouped by referrer | AnalyticsRepository.prisma.ts |
| should group others when rows exceed limit | AnalyticsRepository.prisma.ts |
| should find user by supabase id | UserRepository.prisma.ts |
| should return null if user not found | UserRepository.prisma.ts |
| should find plan by name | PlanRepository.prisma.ts |
| should commit transaction | UrlUnitOfWork.ts |
| should rollback transaction on failure | UrlUnitOfWork.ts |

## Infra

| Caso de teste | Arquivo |
|---|---|
| should map supabase auth error to AppError | SupabaseErrorMapper.ts |
| should set and get url from cache | RedisCacheGateway.ts |
| should parse device from user agent | UaParserDeviceService.ts |
| should return geolocation from ip | GeoipLiteGeolocationService.ts |

## Utilities

| Caso de teste | Arquivo |
|---|---|
| should return true for valid url | validations.ts |
| should return false for invalid url | validations.ts |
| should sanitize string correctly | sanitizeString.ts |
| should generate consistent hash | generateHash.ts |
| should extract domain from url | getDomain.ts |
| should build cache key correctly | CacheKeyBuilder.ts |
