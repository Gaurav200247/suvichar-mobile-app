import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class VerifyOtpReqDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Phone number with country code',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone number must be in international format (e.g., +919876543210)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: '+919876543210' })
  phoneNumber: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'https://cloudinary.com/image.jpg', nullable: true })
  profileImageUrl: string | null;

  @ApiProperty({ example: 'personal', enum: ['personal', 'business'] })
  accountType: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}

export class VerifyOtpResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OTP verified successfully' })
  msg: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzUxMiIsInR5...' })
  accessToken: string;

  @ApiProperty({ example: '2024-12-22T12:00:00.000Z' })
  expiry: Date;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ example: true, description: 'Whether user needs to complete profile setup' })
  requiresProfileSetup: boolean;
}

