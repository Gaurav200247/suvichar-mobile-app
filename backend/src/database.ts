import { Logger } from '@nestjs/common';
import { Client } from 'pg';

const logger = new Logger('Database');

/**
 * Check if using a cloud database provider that manages the database for us
 */
function isCloudManagedDb(url: string): boolean {
  return url.includes('neon.tech') || 
         url.includes('supabase.co') || 
         url.includes('railway.app') ||
         url.includes('render.com') ||
         !!process.env.VERCEL;
}

/**
 * Parse DATABASE_URL into connection components
 */
function parseDatabaseUrl(url: string) {
  try {
    const dbUrl = new URL(url);
    let database = dbUrl.pathname.slice(1);
    if (database.includes('?')) {
      database = database.split('?')[0];
    }
    
    return {
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10) || 5432,
      database: database,
    };
  } catch {
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = url.match(regex);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4], 10),
      database: match[5],
    };
  }
}

/**
 * Initialize database - creates the database if it doesn't exist
 * For cloud databases (Neon, Supabase, etc.), this just validates the connection
 */
export async function initializeDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Cloud databases manage the database for us - just validate connection
  if (isCloudManagedDb(databaseUrl)) {
    logger.log('Using cloud-managed database, skipping database creation check');
    
    const { host, database } = parseDatabaseUrl(databaseUrl);
    
    // Just test the connection
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      logger.log(`Connected to cloud database at ${host}/${database}`);
    } finally {
      await client.end();
    }
    return;
  }

  // Local database - check/create if needed
  const { user, password, host, port, database } = parseDatabaseUrl(databaseUrl);

  const adminClient = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    logger.log(`Connected to PostgreSQL server at ${host}:${port}`);

    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database],
    );

    if (checkResult.rowCount === 0) {
      logger.log(`Database "${database}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${database}"`);
      logger.log(`Database "${database}" created successfully!`);
    } else {
      logger.log(`Database "${database}" already exists.`);
    }
  } finally {
    await adminClient.end();
  }
}

