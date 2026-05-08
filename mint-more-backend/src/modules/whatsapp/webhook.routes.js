const { Router } = require('express');
const { rawBody } = require('../../middleware/rawBody');
const { verifyWebhook, handleWebhook } = require('./webhook.controller');

const router = Router();

// GET  /api/v1/whatsapp/webhook  — Meta verification handshake (no auth, no rawBody)
router.get('/webhook', verifyWebhook);

// POST /api/v1/whatsapp/webhook  — Incoming events (rawBody for sig verify, no auth)
router.post('/webhook', rawBody, handleWebhook);

module.exports = router;