import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, ACCOUNT_TYPE } from 'models/user';
import { Repository, MoreThan } from 'typeorm';
import { AccessToken, OTPToken } from 'models/auth';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/third-party/twilio';
import { CustomLogger } from 'src/common/services/logger.service';
import {
  SendOtpReqDto,
  SendOtpResDto,
  VerifyOtpReqDto,
  VerifyOtpResDto,
  ResendOtpReqDto,
  ResendOtpResDto,
  LogoutResDto,
  UserProfileDto,
} from './dto';

const OTP_EXPIRY_MINUTES = 5;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AccessToken)
    private readonly accessTokenRepository: Repository<AccessToken>,

    @InjectRepository(OTPToken)
    private readonly otpRepository: Repository<OTPToken>,

    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext('AuthService');
  }

  // ==================== SEND OTP ====================
  async sendOtp(sendOtpData: SendOtpReqDto): Promise<SendOtpResDto> {
    const { phoneNumber } = sendOtpData;

    try {
      // Check if user exists
      let user = await this.userRepository.findOne({ where: { phoneNumber } });
      const isNewUser = !user;

      // Create user if doesn't exist
      if (!user) {
        user = this.userRepository.create({
          phoneNumber,
          name: '',
          accountType: ACCOUNT_TYPE.PERSONAL,
        });
        await this.userRepository.save(user);
      }

      // Check for deactivated account
      if (user.isDeleted) {
        throw new BadRequestException(
          'This account has been deactivated. Please contact support.',
        );
      }

      // Expire any existing OTPs for this user
      await this.otpRepository.update(
        { userId: user.id, isExpired: false },
        { isExpired: true },
      );

      // Generate and save new OTP
      const otp = this.twilioService.generateOTP();
      const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const otpToken = this.otpRepository.create({
        userId: user.id,
        otp,
        expiry,
      });
      await this.otpRepository.save(otpToken);

      // Send OTP via Twilio
      this.twilioService.sendOTP(phoneNumber, otp);

      console.log({otp});
      

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'OTP sent successfully',
        isNewUser,
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // ==================== RESEND OTP ====================
  async resendOtp(resendOtpData: ResendOtpReqDto): Promise<ResendOtpResDto> {
    const { phoneNumber } = resendOtpData;

    try {
      const user = await this.userRepository.findOne({ where: { phoneNumber } });

      if (!user) {
        throw new BadRequestException('User not found. Please sign up first.');
      }

      if (user.isDeleted) {
        throw new BadRequestException(
          'This account has been deactivated. Please contact support.',
        );
      }

      // Expire any existing OTPs
      await this.otpRepository.update(
        { userId: user.id, isExpired: false },
        { isExpired: true },
      );

      // Generate and save new OTP
      const otp = this.twilioService.generateOTP();
      const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const otpToken = this.otpRepository.create({
        userId: user.id,
        otp,
        expiry,
      });
      await this.otpRepository.save(otpToken);

      // Send OTP via Twilio
      await this.twilioService.sendOTP(phoneNumber, otp);

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'OTP resent successfully',
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // ==================== VERIFY OTP ====================
  async verifyOtp(verifyOtpData: VerifyOtpReqDto): Promise<VerifyOtpResDto> {
    const { phoneNumber, otp } = verifyOtpData;

    try {
      const user = await this.userRepository.findOne({ where: { phoneNumber } });

      if (!user) {
        throw new BadRequestException('User not found. Please sign up first.');
      }

      if (user.isDeleted) {
        throw new BadRequestException(
          'This account has been deactivated. Please contact support.',
        );
      }

      // Find valid OTP
      const otpToken = await this.otpRepository.findOne({
        where: {
          userId: user.id,
          otp,
          isExpired: false,
          expiry: MoreThan(new Date()),
        },
      });

      if (!otpToken) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Mark OTP as expired
      await this.otpRepository.update({ id: otpToken.id }, { isExpired: true });

      // Mark user as verified
      if (!user.isVerified) {
        await this.userRepository.update({ id: user.id }, { isVerified: true });
        user.isVerified = true;
      }

      // Invalidate existing tokens for single session
      await this.accessTokenRepository.update(
        { userId: user.id, isExpired: false },
        { isExpired: true },
      );

      // Generate access token
      const accessTokenData = await this.generateAccessToken(user);

      // Check if profile setup is needed
      const requiresProfileSetup = !user.name || user.name.trim() === '';

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'OTP verified successfully',
        accessToken: accessTokenData.token,
        expiry: accessTokenData.expiry,
        user: this.transformUserProfile(user),
        requiresProfileSetup,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // ==================== LOGOUT ====================
  async logout(authHeader: string): Promise<LogoutResDto> {
    try {
      const token = authHeader.split(' ')[1];

      const accessToken = await this.accessTokenRepository.findOne({
        where: { token },
      });

      if (!accessToken) {
        throw new UnauthorizedException('Invalid access token');
      }

      await this.accessTokenRepository.update(
        { id: accessToken.id },
        { isExpired: true, expiry: new Date() },
      );

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================
  private async generateAccessToken(
    user: User,
  ): Promise<{ token: string; expiry: Date }> {
    const payload = {
      phoneNumber: user.phoneNumber,
      user: {
        id: user.id,
        name: user.name,
      },
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_LIFETIME || '7d',
      subject: user.phoneNumber,
      algorithm: 'HS512',
      secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    });

    const expiry = new Date(
      Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRY || 604800000),
    );

    const accessToken = this.accessTokenRepository.create({
      token,
      expiry,
      userId: user.id,
    });

    await this.accessTokenRepository.save(accessToken);

    return { token, expiry };
  }

  private transformUserProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name || null,
      profileImageUrl: user.profileImageUrl || null,
      accountType: user.accountType,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
    };
  }
}

