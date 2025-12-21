import { User } from 'models/user';
import { AccessToken, OTPToken } from 'models/auth';

/**
 * Parse DATABASE_URL into TypeORM config
 */
function parseDbUrl(url: string) {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    return {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nestjs_starter',
    };
  }

  return {
    host: match[3],
    port: parseInt(match[4], 10),
    username: match[1],
    password: match[2],
    database: match[5],
  };
}

export default {
  development: () => {
    const dbConfig = parseDbUrl(process.env.DATABASE_URL || '');
    return {
      postgresConfig: {
        type: 'postgres' as const,
        ...dbConfig,
        entities: [User, AccessToken, OTPToken],
        synchronize: true,
        logging: false,
      },
    };
  },

  production: () => {
    const dbConfig = parseDbUrl(process.env.DATABASE_URL || '');
    return {
      postgresConfig: {
        type: 'postgres' as const,
        ...dbConfig,
        entities: [User, AccessToken, OTPToken],
        synchronize: false,
        logging: false,
      },
    };
  },
};
