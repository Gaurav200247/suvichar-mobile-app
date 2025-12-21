import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import configProperties from '../properties';

// Load .env FIRST before anything else
config();

// Initialize config after env is loaded
const initConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return configProperties.production();
  }
  return configProperties.development();
};

@Injectable()
export class CustomConfigService {
  static PROPERTIES = initConfig();
}
