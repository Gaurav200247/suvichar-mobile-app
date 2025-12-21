import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class LogoutResDto extends BaseResponse {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Logged out successfully' })
  msg: string;
}

