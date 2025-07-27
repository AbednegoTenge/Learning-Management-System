import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10)
  },
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', err => {
  console.error('❌ Redis Client Error:', err);
});

await redisClient.connect();

console.log('✅ Redis connected successfully');

export default redisClient;
