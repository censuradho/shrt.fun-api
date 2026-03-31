import { TopMostAccessedUrlModel } from "../models/TopMostAccessedUrl.model";

export interface TopMostAccessedUrlsOptions {
  isActive?: boolean;
  limit: number;
}

export interface IAnalyticsRepository {
  topMostAccessedUrls(userId: string, options?: TopMostAccessedUrlsOptions): Promise<TopMostAccessedUrlModel[]>;
}
