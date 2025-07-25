import process from 'node:process';
import readline from 'node:readline';
import { Logger } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';

import mongoose from 'mongoose';

dotenvConfig();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techrun-server';
const logger = new Logger('DropAllCollections');

async function dropAllCollections() {
  try {
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collections = await db.db!.listCollections().toArray();

    for (const collection of collections) {
      await db.collection(collection.name).drop();
      logger.log(`Dropped collection: ${collection.name}`);
    }

    logger.log('All collections dropped successfully.');
  }
  catch (error) {
    console.error('Error dropping collections:', error);
  }
  finally {
    await mongoose.disconnect();
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Are you sure you want to drop all collections? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    dropAllCollections()
      .then(() => {
        logger.log('Drop operation completed.');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Error during drop operation:', error);
        process.exit(1);
      })
      .finally(() => {
        rl.close();
      });
  }
  else {
    logger.log('Operation cancelled.');
    rl.close();
    process.exit(0);
  }
});
