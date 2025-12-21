import { Logger } from '@nestjs/common';
import { Client } from 'pg';

const logger = new Logger('Database');

/**
 * Parse DATABASE_URL into connection components
 */
function parseDatabaseUrl(url: string) {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
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

/**
 * Initialize database - creates the database if it doesn't exist
 */
export async function initializeDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const { user, password, host, port, database } = parseDatabaseUrl(databaseUrl);

  // Connect to postgres (default database) to check/create target database
  const adminClient = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await adminClient.connect();
    logger.log(`Connected to PostgreSQL server at ${host}:${port}`);

    // Check if database exists
    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database],
    );

    if (checkResult.rowCount === 0) {
      // Database doesn't exist, create it
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

