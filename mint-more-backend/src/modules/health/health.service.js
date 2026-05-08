const { query } = require('../../config/database');
const { getRedis } = require('../../config/redis');
const logger = require('../../utils/logger');

/**
 * Runs lightweight connectivity checks against DB and Redis.
 * Returns structured status object — used by health controller.
 */
const getHealthStatus = async () => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    redis: 'unknown',
  };

  // ── PostgreSQL check ──────────────────────────────
  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch (err) {
    logger.error('Health check — DB failed', { error: err.message });
    checks.database = 'error';
  }

  // ── Redis check ───────────────────────────────────
  try {
    const redis = getRedis();
    const pong = await redis.ping();
    checks.redis = pong === 'PONG' ? 'ok' : 'degraded';
  } catch (err) {
    logger.error('Health check — Redis failed', { error: err.message });
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return {
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };
};

module.exports = { getHealthStatus };