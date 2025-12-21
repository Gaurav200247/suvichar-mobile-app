import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';

export class SendOtpReqDto {
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

export class SendOtpResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OTP sent successfully' })
  msg: string;

  @ApiProperty({ example: true })
  isNewUser: boolean;

  @ApiProperty({ example: 300, description: 'OTP expiry time in seconds' })
  expiresIn: number;
}

