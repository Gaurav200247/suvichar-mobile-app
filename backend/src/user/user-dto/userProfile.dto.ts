import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ACCOUNT_TYPE, User } from 'models/user';

export class UserProfileDto {
  @ApiProperty({
    example: 'uuid-here',
  })
  id: string;

  @ApiProperty({
    example: '+919876543210',
  })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'John Doe',
  })
  @IsString()
  name: string | null;

  @ApiPropertyOptional({
    example: 'https://cloudinary.com/image.jpg',
  })
  @IsString()
  profileImageUrl: string | null;

  @ApiProperty({
    example: 'personal',
    enum: ACCOUNT_TYPE,
  })
  @IsEnum(ACCOUNT_TYPE)
  accountType: ACCOUNT_TYPE;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isDeleted: boolean;

  static transform(object: User): UserProfileDto {
    const transformedObj: UserProfileDto = new UserProfileDto();

    transformedObj.id = object.id;
    transformedObj.phoneNumber = object.phoneNumber;
    transformedObj.name = object.name || null;
    transformedObj.profileImageUrl = object.profileImageUrl || null;
    transformedObj.accountType = object.accountType;
    transformedObj.isVerified = object.isVerified;
    transformedObj.isDeleted = object.isDeleted;

    return transformedObj;
  }
}
