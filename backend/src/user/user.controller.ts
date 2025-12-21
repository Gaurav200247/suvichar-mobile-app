import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/responses';
import { UserService } from './user.service';
import { Request } from 'express';
import { GetUserProfileResDTO, UpdateProfileReqDto, UpdateProfileResDto } from './user-dto';
import { AuthGuard } from 'src/middlewares';
import { User } from 'models/user';
import { getMulterMediaOptions, AllowedImageExtensions } from 'src/utils/multer';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== GET PROFILE ====================
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user profile.',
    type: GetUserProfileResDTO,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponse,
  })
  @Get('/profile')
  async getUserProfile(@Req() req: Request) {
    const user = req['user'];

    return this.userService.getUserProfile(user);
  }

  // ==================== UPDATE PROFILE ====================
  @ApiOperation({ summary: 'Update user profile (name, photo, account type)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update profile with optional image upload',
    type: UpdateProfileReqDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UpdateProfileResDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponse,
  })
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      getMulterMediaOptions({
        fileSize: 5, // 5MB max
        fileExtensions: AllowedImageExtensions,
      }),
    ),
  )
  @Put('/profile')
  async updateProfile(
    @Body() updateProfileData: UpdateProfileReqDto,
    @UploadedFile() profileImage: Express.Multer.File,
    @Req() req: Request,
  ): Promise<UpdateProfileResDto> {
    const user = req['user'] as User;
    return this.userService.updateProfile(user, updateProfileData, profileImage);
  }
}
