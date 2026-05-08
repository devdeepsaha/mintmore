const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
  return new Promise((resolve, reject) => {
    const client = new Redis(env.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // Exponential back-off on reconnect
      retryStrategy: (times) => {
        if (times > 10) {
          logger.error('Redis: max reconnect attempts reached');
          return null; // stop retrying
        }
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
    });

    client.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    client.on('ready', () => {
      redisClient = client;
      resolve(client);
    });

    client.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
      // Don't reject here — ioredis manages reconnection internally
    });

    client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    // If it doesn't connect within 10s, reject (startup guard)
    setTimeout(() => {
      if (!redisClient) {
        reject(new Error('Redis connection timed out after 10s'));
      }
    }, 10000);
  });
};

const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialised. Call connectRedis() first.');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedis };