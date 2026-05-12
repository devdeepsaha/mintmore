const Replicate = require('replicate');
const env       = require('../../../config/env');
const logger    = require('../../../utils/logger');

const replicate = new Replicate({ auth: env.ai.replicateToken });

/**
 * Generate an image via Replicate.
 * Polls until complete then returns the output URL.
 *
 * @param {string} modelId   - Replicate model string (e.g. 'black-forest-labs/flux-schnell')
 * @param {string} prompt    - image generation prompt
 * @param {object} params    - width, height, num_outputs, guidance_scale, etc.
 * @returns {{ url, duration_ms }}
 */
const generateImage = async (modelId, prompt, params = {}) => {
  const startTime = Date.now();

  const {
    width          = 1024,
    height         = 1024,
    num_outputs    = 1,
    guidance_scale = 3.5,
    num_inference_steps = 4,  // flux-schnell uses 4 steps
    output_format  = 'webp',
    output_quality = 90,
  } = params;

  const input = {
    prompt,
    width,
    height,
    num_outputs,
    output_format,
    output_quality,
  };

  // Model-specific parameters
  if (modelId.includes('flux')) {
    input.guidance_scale         = guidance_scale;
    input.num_inference_steps    = num_inference_steps;
  } else if (modelId.includes('sdxl')) {
    input.negative_prompt        = params.negative_prompt || 'blurry, low quality, watermark';
    input.num_inference_steps    = params.num_inference_steps || 30;
  }

  try {
    const output = await replicate.run(modelId, { input });

    // output is an array of URLs
    const imageUrls = Array.isArray(output) ? output : [output];
    const url       = imageUrls[0];
    const duration_ms = Date.now() - startTime;

    if (!url) throw new Error('Replicate returned no image URL');

    logger.info('Replicate image generated', { modelId, duration_ms });
    return { url, duration_ms };
  } catch (err) {
    const msg = err.message || 'Replicate generation failed';
    logger.error('Replicate error', { modelId, error: msg });
    throw new Error(`Image generation failed: ${msg}`);
  }
};

module.exports = { generateImage };