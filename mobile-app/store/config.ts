import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import * as SecureStore from 'expo-secure-store';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_BASE_URL) {
    return process.env.EXPO_PUBLIC_BASE_URL;
  }else{
    return 'http://localhost:4000';
  }
};

export const BASE_URL = getBaseUrl();

// Timestamp formatter
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
};

// Custom baseQuery with logging
export const createBaseQuery = (basePath: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}${basePath}`,
    prepareHeaders: async (headers) => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.log('Error getting token:', error);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    // Build full URL for logging
    const url = typeof args === 'string' ? args : args.url;
    const method = typeof args === 'string' ? 'GET' : (args.method || 'GET');
    const fullUrl = `${BASE_URL}${basePath}${url}`;

    // Log request sent
    console.log(`\n📤 Sent - [${getTimestamp()}] - ${method} ${fullUrl}`);

    // Execute the request
    const result = await rawBaseQuery(args, api, extraOptions);

    // Log response received
    if (result.error) {
      console.log(`📥 Received - [${getTimestamp()}] - ${method} ${fullUrl} - ❌ Error: ${result.error.status}`);
    } else {
      console.log(`📥 Received - [${getTimestamp()}] - ${method} ${fullUrl} - ✅ Success`);
    }

    return result;
  };
};
