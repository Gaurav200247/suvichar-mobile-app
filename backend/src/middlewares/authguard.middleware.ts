import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessToken } from 'models/auth';
import { User } from 'models/user';
import { Repository } from 'typeorm';
import { CustomLogger } from 'src/common/services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: CustomLogger,

    @InjectRepository(AccessToken)
    private accessTokenRepository: Repository<AccessToken>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.get('Authorization');
    const authorization = authHeader ? authHeader.split(' ')[1] : null;

    if (!authorization) {
      throw new UnauthorizedException('Login to access this route...');
    }

    try {
      const accessToken = await this.accessTokenRepository.findOne({
        where: { token: authorization, isExpired: false },
      });

      if (!accessToken) {
        throw new UnauthorizedException(
          'Authentication token is missing or invalid. Please log in again.',
        );
      }

      const now = new Date(Date.now());
      const oneHour = 60 * 60 * 1000;

      if (accessToken.expiry <= now || accessToken.isExpired) {
        await this.accessTokenRepository.update(
          { id: accessToken.id },
          { isExpired: true },
        );
        throw new UnauthorizedException('Session expired. Please log in again.');
      }

      // Extend access token expiry if within 1 hour of expiry
      const timeUntilExpiry = accessToken.expiry.getTime() - now.getTime();
      if (timeUntilExpiry < oneHour) {
        accessToken.expiry = new Date(now.getTime() + oneHour);
        await this.accessTokenRepository.save(accessToken);
      }

      const user = await this.userRepository.findOne({
        where: { id: accessToken.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException(
          'This account has been deactivated. Please contact support.',
        );
      }

      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Your account is not verified. Please verify your phone number first.',
        );
      }

      request['user'] = user;
      return true;
    } catch (error) {
      throw error;
    }
  }
}
