import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'models/user';
import { CommonModule } from 'src/common/common.module';
import { AccessToken, OTPToken } from 'models/auth';
import { JwtModule } from '@nestjs/jwt';
import { ThirdPartyModule } from 'src/third-party/third-party.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OTPToken, AccessToken]),
    JwtModule.register({}),
    CommonModule,
    ThirdPartyModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule, AuthService],
})
export class AuthModule {}
