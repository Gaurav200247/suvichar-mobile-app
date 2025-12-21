import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'models/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    AuthModule,
    ThirdPartyModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
