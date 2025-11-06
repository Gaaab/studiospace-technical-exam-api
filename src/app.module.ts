import { Module } from '@nestjs/common';
import { AgencyModule } from './agency/agency.module';

@Module({
  imports: [AgencyModule],
  providers: [],
})
export class AppModule {}
