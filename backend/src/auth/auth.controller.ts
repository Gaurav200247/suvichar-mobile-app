import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SendOtpReqDto,
  SendOtpResDto,
  VerifyOtpReqDto,
  VerifyOtpResDto,
  ResendOtpReqDto,
  ResendOtpResDto,
  LogoutResDto,
} from './dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ErrorResponse } from 'src/utils/responses';
import { AuthGuard } from 'src/middlewares';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== SEND OTP ====================
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResDto,
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponse,
    description: 'Bad Request',
  })
  @Post('send-otp')
  async sendOtp(@Body() sendOtpData: SendOtpReqDto): Promise<SendOtpResDto> {
    return this.authService.sendOtp(sendOtpData);
  }

  // ==================== RESEND OTP ====================
  @ApiOperation({ summary: 'Resend OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: ResendOtpResDto,
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponse,
    description: 'Bad Request',
  })
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpData: ResendOtpReqDto): Promise<ResendOtpResDto> {
    return this.authService.resendOtp(resendOtpData);
  }

  // ==================== VERIFY OTP ====================
  @ApiOperation({ summary: 'Verify OTP and get access token' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: VerifyOtpResDto,
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponse,
    description: 'Invalid or expired OTP',
  })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpData: VerifyOtpReqDto): Promise<VerifyOtpResDto> {
    return this.authService.verifyOtp(verifyOtpData);
  }

  // ==================== LOGOUT ====================
  @ApiOperation({ summary: 'Logout and invalidate access token' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: LogoutResDto,
  })
  @ApiResponse({
    status: 401,
    type: ErrorResponse,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() req: Request): Promise<LogoutResDto> {
    const authHeader = req.headers.authorization;
    return this.authService.logout(authHeader);
  }
}

