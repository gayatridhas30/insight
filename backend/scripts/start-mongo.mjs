import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', '.mongo-data');

const mongod = await MongoMemoryServer.create({
  instance: {
    ip: '127.0.0.1',
    port: 27017,
    dbPath,
    storageEngine: 'wiredTiger',
  },
});

console.log(`[MongoDB] running at ${mongod.getUri()} (data: ${dbPath})`);

const shutdown = async () => {
  await mongod.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
setInterval(() => {}, 1 << 30);
