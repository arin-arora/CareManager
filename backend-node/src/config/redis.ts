import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;
let isRedisConnected = false;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      // Retry connection but limit it so we don't block
      if (times > 3) {
        isRedisConnected = false;
        return null; // stop retrying
      }
      return Math.min(times * 100, 2000);
    }
  });

  redis.on('connect', () => {
    isRedisConnected = true;
    console.log('✓ Connected to Redis successfully');
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
    console.warn('⚠ Redis connection error:', err.message);
  });
} catch (err: any) {
  console.error('✗ Redis initialization error:', err.message);
}

export const getRedisClient = (): Redis | null => {
  return isRedisConnected ? redis : null;
};

export const checkRedisStatus = (): boolean => {
  return isRedisConnected;
};

export default redis;
