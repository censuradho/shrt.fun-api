import { ReferrerDistributionModel } from './../models/ReferrerDistribution.model';
import { TopMostAccessedUrlModel } from "../models/TopMostAccessedUrl.model";
import { TopMostAccessedUrlByLocationDeviceAndOSModel } from "../models/TopMostAccessedUrlByLocationDeviceAndOS.model";

export interface TopMostAccessedUrlsOptions {
  isActive?: boolean;
  limit: number;
}

export interface IAnalyticsRepository {
  topMostAccessedUrls(userId: string, options?: TopMostAccessedUrlsOptions): Promise<TopMostAccessedUrlModel[]>;
  topMostAccessedUrlsByLocationDeviceAndOS(
    userId: string, 
    options?: TopMostAccessedUrlsOptions
  ): Promise<TopMostAccessedUrlByLocationDeviceAndOSModel[]>;
  referrerDistribution(userId: string): Promise<ReferrerDistributionModel[]>
}
