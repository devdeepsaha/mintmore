const { getHealthStatus } = require('./health.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const healthCheck = async (req, res, next) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;

    if (statusCode === 200) {
      return sendSuccess(res, {
        data: health,
        message: 'All systems operational',
        statusCode,
      });
    } else {
      return sendError(res, {
        message: 'One or more systems are degraded',
        statusCode,
        errors: health.checks,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { healthCheck };