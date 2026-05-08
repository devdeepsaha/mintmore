/**
 * Razorpay webhook signature verification requires the raw request body
 * as a Buffer — Express's json() middleware parses it away by default.
 *
 * This middleware captures the raw body BEFORE json() runs.
 * Mount it ONLY on the webhook route, not globally.
 */
const rawBody = (req, res, next) => {
  let data = '';
  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    req.rawBody = data;
    next();
  });
};

module.exports = { rawBody };