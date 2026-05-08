const env    = require('../../config/env');
const logger = require('../../utils/logger');

const WA_BASE = `https://graph.facebook.com/${env.whatsapp.apiVersion}`;

/**
 * Send a text message via WhatsApp Cloud API.
 *
 * @param {string} phoneNumberId  - MM's waba_phone_id (the sending number)
 * @param {string} toNumber       - recipient in E.164 format (e.g. +919876543210)
 * @param {string} text           - message body
 * @param {string} [contextMsgId] - reply-to WA message ID (for threading)
 */
const sendTextMessage = async (phoneNumberId, toNumber, text, contextMsgId = null) => {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to:                toNumber,
    type:              'text',
    text:              { body: text },
  };

  if (contextMsgId) {
    body.context = { message_id: contextMsgId };
  }

  try {
    const response = await fetch(
      `${WA_BASE}/${phoneNumberId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${env.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('WhatsApp API error', {
        phoneNumberId, toNumber,
        status: response.status,
        error:  data.error,
      });
      return { success: false, error: data.error };
    }

    logger.debug('WhatsApp message sent', {
      phoneNumberId,
      toNumber,
      waMessageId: data.messages?.[0]?.id,
    });

    return { success: true, wa_message_id: data.messages?.[0]?.id };
  } catch (err) {
    logger.error('WhatsApp send failed (network)', { error: err.message });
    return { success: false, error: err.message };
  }
};

/**
 * Send an image/document/video via WhatsApp.
 *
 * @param {string} phoneNumberId
 * @param {string} toNumber
 * @param {string} mediaUrl       - publicly accessible URL (Supabase Storage)
 * @param {string} mediaType      - 'image' | 'document' | 'video' | 'audio'
 * @param {string} [caption]      - optional caption for image/video
 */
const sendMediaMessage = async (phoneNumberId, toNumber, mediaUrl, mediaType, caption = '') => {
  const mediaPayload = { link: mediaUrl };
  if (caption && ['image', 'video'].includes(mediaType)) {
    mediaPayload.caption = caption;
  }

  const body = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to:                toNumber,
    type:              mediaType,
    [mediaType]:       mediaPayload,
  };

  try {
    const response = await fetch(
      `${WA_BASE}/${phoneNumberId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${env.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      logger.error('WhatsApp media send error', { error: data.error });
      return { success: false, error: data.error };
    }

    return { success: true, wa_message_id: data.messages?.[0]?.id };
  } catch (err) {
    logger.error('WhatsApp media send failed', { error: err.message });
    return { success: false, error: err.message };
  }
};

/**
 * Mark a WhatsApp message as read.
 * Sends a "read" receipt back to the sender.
 */
const markAsRead = async (phoneNumberId, waMessageId) => {
  try {
    await fetch(
      `${WA_BASE}/${phoneNumberId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${env.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status:            'read',
          message_id:        waMessageId,
        }),
      }
    );
  } catch (err) {
    logger.warn('WhatsApp read receipt failed', { error: err.message });
  }
};

/**
 * Send a WhatsApp template message.
 * Used for the initial greeting when a new client first messages a MM number.
 *
 * Templates must be pre-approved in Meta Business Manager.
 * Template name: 'mm_welcome' (you create this in Meta)
 */
const sendWelcomeTemplate = async (phoneNumberId, toNumber, clientName, categoryName) => {
  const body = {
    messaging_product: 'whatsapp',
    to:                toNumber,
    type:              'template',
    template: {
      name:     'mm_welcome',
      language: { code: 'en' },
      components: [
        {
          type:       'body',
          parameters: [
            { type: 'text', text: clientName || 'there' },
            { type: 'text', text: categoryName },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(
      `${WA_BASE}/${phoneNumberId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${env.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return response.ok
      ? { success: true, wa_message_id: data.messages?.[0]?.id }
      : { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendTextMessage,
  sendMediaMessage,
  markAsRead,
  sendWelcomeTemplate,
};