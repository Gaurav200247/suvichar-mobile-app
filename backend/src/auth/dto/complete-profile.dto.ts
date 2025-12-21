import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';
import { UserProfileDto } from './verify-otp.dto';

export class CompleteProfileReqDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name for personal account or business name for business account',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,/9j/4AAQ...',
    description: 'Base64 encoded image or image URL (optional)',
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class CompleteProfileResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Profile completed successfully' })
  msg: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

