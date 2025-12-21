import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class ResendOtpReqDto {
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
}

export class ResendOtpResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OTP resent successfully' })
  msg: string;

  @ApiProperty({ example: 300, description: 'OTP expiry time in seconds' })
  expiresIn: number;
}

