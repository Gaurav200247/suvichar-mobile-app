import { HttpStatus, Injectable } from '@nestjs/common';
import {
  GetUserProfileResDTO,
  UserProfileDto,
  UpdateProfileReqDto,
  UpdateProfileResDto,
} from './user-dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'models/user';
import { CloudinaryService } from 'src/third-party/cloudinary';
import { CustomLogger } from 'src/common/services/logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext('UserService');
  }

  async getUserProfile(user: User): Promise<GetUserProfileResDTO> {
    const userResp = UserProfileDto.transform(user);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: userResp,
    };
  }

  async updateProfile(
    user: User,
    updateProfileData: UpdateProfileReqDto,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateProfileResDto> {
    const { name, accountType } = updateProfileData;

    try {
      const updateData: Partial<User> = {};

      // Update name if provided
      if (name !== undefined) {
        updateData.name = name;
      }

      // Update account type if provided
      if (accountType !== undefined) {
        updateData.accountType = accountType;
      }

      // Upload and update profile image if provided
      if (profileImage) {
        const uploadResult = await this.cloudinaryService.uploadImage(
          profileImage,
          'profile-images',
        );
        updateData.profileImageUrl = uploadResult.secure_url;
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        await this.userRepository.update({ id: user.id }, updateData);
      }

      // Fetch updated user
      const updatedUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'Profile updated successfully',
        user: UserProfileDto.transform(updatedUser),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
