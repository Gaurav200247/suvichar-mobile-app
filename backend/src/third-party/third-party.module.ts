import { Module } from '@nestjs/common';
import { TwilioService } from './twilio';
import { CloudinaryService } from './cloudinary';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TwilioService, CloudinaryService],
  exports: [TwilioService, CloudinaryService],
})
export class ThirdPartyModule {}
