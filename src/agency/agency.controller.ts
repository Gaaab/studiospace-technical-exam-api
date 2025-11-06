import { Controller, Get, Logger } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { ServiceReport } from './agency.types';

@Controller('agencies')
export class AgencyController {
  private readonly logger = new Logger(AgencyController.name);

  constructor(private readonly agencyService: AgencyService) {}

  @Get('report')
  async getReport(): Promise<ServiceReport> {
    this.logger.log('Generating agency service report');
    return this.agencyService.getServiceReport();
  }
}
