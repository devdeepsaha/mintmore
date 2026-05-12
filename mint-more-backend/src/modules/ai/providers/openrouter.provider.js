const env    = require('../../../config/env');
const logger = require('../../../utils/logger');

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

/**
 * Generate text via OpenRouter.
 */
const generateText = async (openrouterId, prompt, params = {}, systemPromptOverride = null) => {
  const startTime = Date.now();

  const {
    temperature = 0.7,
    max_tokens  = 2000,
  } = params;

  const systemPrompt = systemPromptOverride ||
    'You are a helpful creative assistant for Mint More, an Indian creative services platform. Be concise, professional, and culturally relevant for Indian businesses.';

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${env.ai.openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mintmoremarketing.com',
      'X-Title':      'Mint More AI',
    },
    body: JSON.stringify({
      model:       openrouterId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
      temperature,
      max_tokens,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `OpenRouter error: ${response.status}`;
    logger.error('OpenRouter error', { openrouterId, error: errorMsg, status: response.status });
    throw new Error(errorMsg);
  }

  return {
    text:          data.choices?.[0]?.message?.content || '',
    tokens_input:  data.usage?.prompt_tokens     || 0,
    tokens_output: data.usage?.completion_tokens || 0,
    duration_ms:   Date.now() - startTime,
  };
};

/**
 * Generate image via OpenRouter.
 * Supports models like dall-e-3, stable-diffusion via OpenRouter's image endpoint.
 */
const generateImage = async (openrouterId, prompt, params = {}) => {
  const startTime = Date.now();

  const {
    width  = 1024,
    height = 1024,
    n      = 1,
  } = params;

  const response = await fetch(`${OPENROUTER_BASE}/images/generations`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${env.ai.openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mintmoremarketing.com',
      'X-Title':      'Mint More AI',
    },
    body: JSON.stringify({
      model:  openrouterId,
      prompt,
      n,
      size:   `${width}x${height}`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `OpenRouter image error: ${response.status}`;
    logger.error('OpenRouter image error', { openrouterId, error: errorMsg });
    throw new Error(errorMsg);
  }

  const url = data.data?.[0]?.url || data.data?.[0]?.b64_json;
  if (!url) throw new Error('OpenRouter returned no image URL');

  return {
    url,
    duration_ms: Date.now() - startTime,
  };
};

/**
 * Fetch all available models from OpenRouter.
 * Used by admin to browse and add new models.
 */
const fetchOpenRouterModels = async () => {
  try {
    const response = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { Authorization: `Bearer ${env.ai.openrouterKey}` },
    });
    const data = await response.json();
    return (data.data || []).map((m) => ({
      openrouter_id:  m.id,
      name:           m.name,
      description:    m.description,
      context_window: m.context_length,
      pricing:        m.pricing,
      is_free:        parseFloat(m.pricing?.completion || '0') === 0,
    }));
  } catch (err) {
    logger.error('fetchOpenRouterModels failed', { error: err.message });
    return [];
  }
};

module.exports = { generateText, generateImage, fetchOpenRouterModels };