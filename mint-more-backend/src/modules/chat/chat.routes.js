const { Router } = require('express');
const controller = require('./chat.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

// ── Chat rooms ────────────────────────────────────────────────────────────────
// GET    /api/v1/chat/rooms                    — list my rooms
router.get('/rooms', controller.getMyRooms);

// GET    /api/v1/chat/rooms/:roomId            — room detail
router.get('/rooms/:roomId', controller.getRoom);

// GET    /api/v1/chat/rooms/:roomId/messages   — paginated messages
router.get('/rooms/:roomId/messages', controller.getMessages);

// POST   /api/v1/chat/rooms/:roomId/messages   — send a message
router.post('/rooms/:roomId/messages', controller.sendMessage);

// ── Presence ──────────────────────────────────────────────────────────────────
// POST   /api/v1/chat/presence/online          — mark self as online
router.post('/presence/online', controller.setOnline);

// POST   /api/v1/chat/presence/offline         — mark self as offline
router.post('/presence/offline', controller.setOffline);

// GET    /api/v1/chat/presence/:userId         — get a user's presence
router.get('/presence/:userId', controller.getPresence);

// ── Admin: WhatsApp number management ────────────────────────────────────────
// GET    /api/v1/chat/admin/wa-numbers
router.get('/admin/wa-numbers', authorize('admin'), controller.getWhatsAppNumbers);

// POST   /api/v1/chat/admin/wa-numbers
router.post('/admin/wa-numbers', authorize('admin'), controller.upsertWhatsAppNumber);

module.exports = router;