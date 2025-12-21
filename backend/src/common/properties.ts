import { User } from 'models/user';
import { AccessToken, OTPToken } from 'models/auth';

/**
 * Parse DATABASE_URL into TypeORM config
 * Supports both standard format and Neon pooled connections
 */
function parseDbUrl(url: string) {
  if (!url) {
    return {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nestjs_starter',
    };
  }

  try {
    const dbUrl = new URL(url);
    
    // Extract database name (remove leading slash)
    let database = dbUrl.pathname.slice(1);
    
    // Handle Neon's query parameters (e.g., ?sslmode=require)
    if (database.includes('?')) {
      database = database.split('?')[0];
    }

    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10) || 5432,
      username: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: database,
    };
  } catch {
    // Fallback regex for edge cases
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
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
}

/**
 * Check if running in serverless environment (Vercel)
 */
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Check if using cloud database (requires SSL)
 */
const isCloudDb = (url: string) => {
  if (!url) return false;
  return url.includes('neon.tech') || 
         url.includes('supabase.co') || 
         url.includes('railway.app') ||
         url.includes('render.com');
};

export default {
  development: () => {
    const dbUrl = process.env.DATABASE_URL || '';
    const dbConfig = parseDbUrl(dbUrl);
    const needsSsl = isCloudDb(dbUrl);
    
    return {
      postgresConfig: {
        type: 'postgres' as const,
        ...dbConfig,
        entities: [User, AccessToken, OTPToken],
        synchronize: true,
        logging: false,
        // SSL configuration for cloud databases
        ...(needsSsl && {
          ssl: {
            rejectUnauthorized: false,
          },
        }),
      },
    };
  },

  production: () => {
    const dbUrl = process.env.DATABASE_URL || '';
    const dbConfig = parseDbUrl(dbUrl);
    
    return {
      postgresConfig: {
        type: 'postgres' as const,
        ...dbConfig,
        entities: [User, AccessToken, OTPToken],
        synchronize: false,
        logging: false,
        // SSL is required for production cloud databases
        ssl: {
          rejectUnauthorized: false,
        },
        // Connection pool settings optimized for serverless
        ...(isServerless && {
          extra: {
            // Reduce connection pool for serverless
            max: 3,
            // Faster connection timeout for cold starts
            connectionTimeoutMillis: 10000,
            // Idle timeout
            idleTimeoutMillis: 30000,
          },
        }),
      },
    };
  },
};
