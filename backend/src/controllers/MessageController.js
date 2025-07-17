const Message = require('../models/Message');
const User = require('../models/User');

class MessageController {
  static async sendMessage(req, res) {
    try {
      const { receiver_id, property_id, subject, message } = req.body;
      const sender_id = req.user.id;

      // Validate receiver exists
      const receiver = await User.findById(receiver_id);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      const messageData = {
        sender_id,
        receiver_id,
        property_id: property_id || null,
        subject,
        message
      };

      const newMessage = await Message.create(messageData);
      res.status(201).json({
        message: 'Message sent successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const messages = await Message.findByUserId(userId);
      
      res.json({
        message: 'Messages retrieved successfully',
        data: messages
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await Message.getConversations(userId);
      
      res.json({
        message: 'Conversations retrieved successfully',
        data: conversations
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getConversationMessages(req, res) {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      
      const messages = await Message.getConversationMessages(userId, parseInt(otherUserId));
      
      res.json({
        message: 'Conversation messages retrieved successfully',
        data: messages
      });
    } catch (error) {
      console.error('Get conversation messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      
      await Message.markAsRead(parseInt(messageId), userId);
      
      res.json({
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Message.getUnreadCount(userId);
      
      res.json({
        message: 'Unread count retrieved successfully',
        data: { count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getLandlords(req, res) {
    try {
      const landlords = await User.findByRole('landlord');
      
      res.json({
        message: 'Landlords retrieved successfully',
        data: landlords.map(landlord => ({
          id: landlord.id,
          first_name: landlord.first_name,
          last_name: landlord.last_name,
          email: landlord.email
        }))
      });
    } catch (error) {
      console.error('Get landlords error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = MessageController;
