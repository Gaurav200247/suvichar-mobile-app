import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../config';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string | null;
  profileImageUrl: string | null;
  accountType: 'personal' | 'business';
  isVerified: boolean;
  isDeleted: boolean;
}

export interface GetUserProfileResponse {
  error: boolean;
  statusCode: number;
  user: UserProfile;
}

export interface UpdateProfileRequest {
  name?: string;
  profileImage?: {
    uri: string;
    type: string;
    name: string;
  };
  accountType?: 'personal' | 'business';
}

export interface UpdateProfileResponse {
  error: boolean;
  statusCode: number;
  msg: string;
  user: UserProfile;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: createBaseQuery('/api'),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<GetUserProfileResponse, void>({
      query: () => '/profile',
      providesTags: ['UserProfile'],
    }),

    updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
      query: (data) => {
        const formData = new FormData();
        
        if (data.name) {
          formData.append('name', data.name);
        }
        
        if (data.accountType) {
          formData.append('accountType', data.accountType);
        }
        
        if (data.profileImage) {
          // React Native requires this specific format for file uploads
          // The 'as any' cast is needed because RN's FormData typing differs from web
          const fileUri = data.profileImage.uri;
          const fileType = data.profileImage.type || 'image/jpeg';
          const fileName = data.profileImage.name || 'profile.jpg';
          
          formData.append('profileImage', {
            uri: fileUri,
            type: fileType,
            name: fileName,
          } as any);
        }
        
        return {
          url: '/profile',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateProfileMutation,
} = userApi;

