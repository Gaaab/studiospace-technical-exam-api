import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AgencyService } from './agency.service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('AgencyService', () => {
  let service: AgencyService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgencyService>(AgencyService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();
  });

  describe('getServiceReport', () => {
    it('should return correct report structure', async () => {
      // Mock file exists (using cache)
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([[], 0]));

      const report = await service.getServiceReport();

      expect(report).toHaveProperty('Advertising, Brand & Creative');
      expect(report).toHaveProperty('Media');
      expect(report).toHaveProperty('Other');
      expect(report).toHaveProperty('summary');

      expect(report['Advertising, Brand & Creative']).toHaveProperty('AU');
      expect(report['Advertising, Brand & Creative']).toHaveProperty('GB');
      expect(report['Advertising, Brand & Creative']).toHaveProperty('US');
      expect(report['Advertising, Brand & Creative']).toHaveProperty('Other');

      expect(report.summary).toHaveProperty('totalAgencies');
      expect(report.summary).toHaveProperty('agenciesAnalyzed');
    });
  });
});
