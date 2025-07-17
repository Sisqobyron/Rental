const express = require('express');
const MessageController = require('../controllers/MessageController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Send a message
router.post('/', authenticateToken, MessageController.sendMessage);

// Get all messages for user
router.get('/', authenticateToken, MessageController.getMessages);

// Get conversations (list of people user has messaged with)
router.get('/conversations', authenticateToken, MessageController.getConversations);

// Get messages in a specific conversation
router.get('/conversations/:otherUserId', authenticateToken, MessageController.getConversationMessages);

// Mark message as read
router.patch('/:messageId/read', authenticateToken, MessageController.markAsRead);

// Get unread message count
router.get('/unread-count', authenticateToken, MessageController.getUnreadCount);

// Get list of landlords (for tenants to message)
router.get('/landlords', authenticateToken, MessageController.getLandlords);

module.exports = router;
