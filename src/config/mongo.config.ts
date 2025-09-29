import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  host: process.env.MONGO_HOST || 'localhost',
  port: parseInt(process.env.MONGO_PORT, 10) || 27017,
  user: process.env.MONGO_USER || 'root',
  pass: process.env.MONGO_PASS || 'rootpass',
  dbName: process.env.MONGO_DB || 'mydatabase',
}));
