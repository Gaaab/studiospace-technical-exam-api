import { ServiceCategory } from './agency.config';

export interface AgencyLocation {
  country?: string;
  countryCode?: string;
}

export interface ServiceReportingGroup {
  id: number;
  name: string;
}

export interface ServiceGroup {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  serviceGroupId: number;
  serviceGroup: ServiceGroup;
  serviceReportingGroupId?: number;
  serviceReportingGroup?: ServiceReportingGroup;
}

export interface AgencyService {
  service: Service;
  serviceId: number;
  agencyId: string;
  isStarred: boolean;
}

export interface Agency {
  id: string;
  companyName: string;
  about?: string;
  agencySize?: string;
  visibility: boolean;
  industries?: any[];
  locations?: AgencyLocation[];
  agencyUsers?: any[];
  agencyService?: AgencyService[];
  agencyDocument?: any[];
  status: string;
  isArchived: boolean;
  agencyKeyword?: any[];
  createdAt: string;
  deletedAt: string | null;
  culture?: any[];
  isBackedByClients: boolean;
}

export type AgencyListResponse = [Agency[], number];

export interface RegionReport {
  AU: number;
  GB: number;
  US: number;
  Other: number;
}

export type ServiceReport = Record<ServiceCategory, RegionReport> & {
  summary: {
    totalAgencies: number;
    agenciesAnalyzed: number;
  };
};
