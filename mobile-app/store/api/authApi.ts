import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../config';

// Types based on backend DTOs
export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string | null;
  profileImageUrl: string | null;
  accountType: 'personal' | 'business';
  isVerified: boolean;
  isDeleted: boolean;
}

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  error: boolean;
  statusCode: number;
  msg: string;
  isNewUser: boolean;
  expiresIn: number;
}

export interface ResendOtpRequest {
  phoneNumber: string;
}

export interface ResendOtpResponse {
  error: boolean;
  statusCode: number;
  msg: string;
  expiresIn: number;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  error: boolean;
  statusCode: number;
  msg: string;
  accessToken: string;
  expiry: string;
  user: UserProfile;
  requiresProfileSetup: boolean;
}

export interface LogoutResponse {
  error: boolean;
  statusCode: number;
  msg: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createBaseQuery('/api/auth'),
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: (body) => ({
        url: '/send-otp',
        method: 'POST',
        body,
      }),
    }),

    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: (body) => ({
        url: '/resend-otp',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: '/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/logout',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
} = authApi;
