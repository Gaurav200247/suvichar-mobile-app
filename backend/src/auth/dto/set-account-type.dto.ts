import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseResponse } from 'src/utils/responses';
import { ACCOUNT_TYPE } from 'models/user';

export class SetAccountTypeReqDto {
  @ApiProperty({
    example: 'personal',
    enum: ACCOUNT_TYPE,
    description: 'Account type: personal or business',
  })
  @IsNotEmpty({ message: 'Account type is required' })
  @IsEnum(ACCOUNT_TYPE, { message: 'Account type must be personal or business' })
  accountType: ACCOUNT_TYPE;
}

export class SetAccountTypeResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Account type set successfully' })
  msg: string;

  @ApiProperty({ example: 'personal', enum: ['personal', 'business'] })
  accountType: string;
}

