export interface IShortUrlGenerateService {
  generate(slug?: string): Promise<string>
}