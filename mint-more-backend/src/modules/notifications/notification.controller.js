const notificationService = require('./notification.service');
const { sseHandler } = require('../../middleware/sse');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

// GET /api/v1/notifications/stream  — SSE connection
const stream = sseHandler;

// GET /api/v1/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, unread_only } = req.query;
    const result = await notificationService.getUserNotifications(req.user.sub, {
      page:        parseInt(page, 10)  || 1,
      limit:       parseInt(limit, 10) || 20,
      unread_only: unread_only === 'true',
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

// GET /api/v1/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.sub);
    return sendSuccess(res, { data: { unread_count: count } });
  } catch (err) { next(err); }
};

// PATCH /api/v1/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.user.sub
    );
    if (!notification) {
      throw new AppError('Notification not found or already read', 404);
    }
    return sendSuccess(res, {
      data:    { notification },
      message: 'Notification marked as read',
    });
  } catch (err) { next(err); }
};

// PATCH /api/v1/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.sub);
    return sendSuccess(res, {
      data:    result,
      message: `${result.marked_count} notifications marked as read`,
    });
  } catch (err) { next(err); }
};

// POST /api/v1/notifications/admin/broadcast  — admin only
const adminBroadcast = async (req, res, next) => {
  try {
    const { title, body, role, data } = req.body;
    if (!title || !body) {
      throw new AppError('title and body are required', 400);
    }
    const result = await notificationService.adminBroadcast({ title, body, role, data });
    return sendSuccess(res, {
      data:    result,
      message: `Broadcast sent to ${result.sent_count} users`,
    });
  } catch (err) { next(err); }
};

module.exports = {
  stream,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  adminBroadcast,
};