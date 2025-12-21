import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { User } from 'models/user';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ThirdPartyModule } from './third-party/third-party.module';
import { CommonModule } from './common/common.module';
import { BootstrapService } from './bootstrap.service';
import { NetworkService } from './utils/services/network.service';
import { AppController } from './app.controller';
import { APIUrlLoggerMiddleware } from './middlewares';
import { CustomConfigService } from './common/services';

@Module({
  imports: [
    TypeOrmModule.forRoot(CustomConfigService.PROPERTIES.postgresConfig),
    TypeOrmModule.forFeature([User]),
    MulterModule.register(),
    AuthModule,
    UserModule,
    ThirdPartyModule,
    CommonModule,
  ],
  providers: [BootstrapService, NetworkService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(APIUrlLoggerMiddleware).forRoutes('*');
  }
}
