import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';
import { ACCOUNT_TYPE } from 'models/user';
import { UserProfileDto } from './userProfile.dto';

export class UpdateProfileReqDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Name for personal account or business name for business account',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image file (max 5MB, jpg/jpeg/png)',
  })
  profileImage?: Express.Multer.File;

  @ApiPropertyOptional({
    example: 'personal',
    enum: ACCOUNT_TYPE,
    description: 'Account type: personal or business',
  })
  @IsOptional()
  @IsEnum(ACCOUNT_TYPE, { message: 'Account type must be personal or business' })
  accountType?: ACCOUNT_TYPE;
}

export class UpdateProfileResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Profile updated successfully' })
  msg: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

