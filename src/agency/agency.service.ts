import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Agency, AgencyListResponse, RegionReport, ServiceReport } from './agency.types';
import { SERVICE_CATEGORIES, TARGET_REGIONS, ServiceCategory, Region } from './agency.config';

@Injectable()
export class AgencyService {
  private readonly logger = new Logger(AgencyService.name);
  private readonly baseUrl = 'https://api.app.studiospace.com/listings/list-agencies';

  constructor(private readonly httpService: HttpService) {}

  async fetchAllAgencies(): Promise<Agency[]> {
    const allAgencies: Agency[] = [];
    let skip = 0;
    const limit = 12;
    let total = 0;

    do {
      const filename = `agencies_response_skip_${skip}.json`;
      const filePath = path.join(process.cwd(), 'data', filename);

      let data: AgencyListResponse;

      if (await this.fileExists(filePath)) {
        this.logger.log(`Using cached data from ${filename}`);
        const cached = await fs.readFile(filePath, 'utf-8');

        const parsed: unknown = JSON.parse(cached);
        if (!Array.isArray(parsed) || parsed.length !== 2) {
          throw new Error(`Invalid cached agency list response in ${filename}`);
        }
        data = parsed as AgencyListResponse;
      } else {
        this.logger.log(`Fetching agencies with skip=${skip}`);

        const response = await firstValueFrom(
          this.httpService.get<[Agency[], number]>(this.baseUrl, {
            params: { skip },
          }),
        );

        data = response.data;

        // Cache the response into file
        await this.saveRawResponse(data, skip);
      }

      const [agenciesBatch, totalCount] = data;

      allAgencies.push(...agenciesBatch);
      total = totalCount;
      skip += limit;

      this.logger.log(`Fetched ${allAgencies.length} of ${total} agencies`);
    } while (allAgencies.length < total);

    return allAgencies;
  }

  private async saveRawResponse(data: AgencyListResponse, skip: number): Promise<void> {
    try {
      const outputDir = path.join(process.cwd(), 'data');
      await fs.mkdir(outputDir, { recursive: true });

      const filename = `agencies_response_skip_${skip}.json`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
      this.logger.log(`Saved raw response to ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to save raw response: ${error?.message}`);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  generateReport(agencies: Agency[]): ServiceReport {
    // Build the data structure
    const report: ServiceReport = {
      ...this.initializeServiceCategories(),
      Other: this.initializeRegionReport(),
      summary: {
        totalAgencies: agencies.length,
        agenciesAnalyzed: 0,
      },
    };

    for (const agency of agencies) {
      const regions = this.getAgencyRegions(agency);
      const serviceCategory = this.categorizeAgency(agency);

      if (regions.length === 0) {
        // Add to Other if no regions found from category
        report[serviceCategory].Other++;
      } else {
        // Increment counts for each region
        for (const region of regions) {
          if (this.isTargetRegion(region)) {
            report[serviceCategory][region]++;
          }
        }
      }

      report.summary.agenciesAnalyzed++;
    }

    return report;
  }

  private initializeServiceCategories(): Record<ServiceCategory, RegionReport> {
    const categories: Record<ServiceCategory, RegionReport> = {} as Record<ServiceCategory, RegionReport>;

    for (const category of SERVICE_CATEGORIES) {
      categories[category] = this.initializeRegionReport();
    }

    return categories;
  }

  private initializeRegionReport(): RegionReport {
    return {
      AU: 0,
      GB: 0,
      US: 0,
      Other: 0,
    };
  }

  private isTargetRegion(region: string): region is Region {
    return TARGET_REGIONS.includes(region as any);
  }

  private getAgencyRegions(agency: Agency): string[] {
    const regions = new Set<string>();

    if (agency.locations) {
      for (const location of agency.locations) {
        if (location.countryCode) {
          regions.add(location.countryCode);
        }
      }
    }

    return Array.from(regions);
  }

  private categorizeAgency(agency: Agency): ServiceCategory {
    if (!agency.agencyService || agency.agencyService.length === 0) {
      return 'Other';
    }

    for (const category of SERVICE_CATEGORIES) {
      const hasCategory = agency.agencyService.some((as) => as.service?.serviceGroup?.name === category);

      // @TODO: Clarify for "Media" serviceReportingGroup

      if (hasCategory) {
        return category;
      }
    }

    return 'Other';
  }

  async getServiceReport(): Promise<ServiceReport> {
    const agencies = await this.fetchAllAgencies();
    return this.generateReport(agencies);
  }
}
