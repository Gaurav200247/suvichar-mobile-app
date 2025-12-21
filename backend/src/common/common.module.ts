import { Module } from '@nestjs/common';
import {
  CustomConfigService,
  CustomLogger,
} from './services';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ThirdPartyModule, ConfigModule],
  providers: [CustomLogger, CustomConfigService],
  exports: [CustomLogger, CustomConfigService],
})
export class CommonModule {}
