import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Message as MessageIcon,
  Send,
  Reply,
  Person,
  Add,
  Close,
  Search,
  MoreVert,
  Circle
} from '@mui/icons-material';
import { api } from '../utils/api';
import { useAuth } from '../context/useAuth.js';

const Messages = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [composeDialog, setComposeDialog] = useState(false);
  const [landlords, setLandlords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageData, setNewMessageData] = useState({
    receiver_id: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
    if (user?.role === 'tenant') {
      fetchLandlords();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const fetchConversationMessages = async (otherUserId) => {
    try {
      const response = await api.get(`/messages/conversations/${otherUserId}`);
      setMessages(response.data.data || []);
      
      // Mark messages as read
      const unreadMessages = response.data.data.filter(
        msg => msg.receiver_id === user.id && !msg.is_read
      );
      
      for (const msg of unreadMessages) {
        await api.patch(`/messages/${msg.id}/read`);
      }
      
      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchLandlords = async () => {
    try {
      const response = await api.get('/messages/landlords');
      setLandlords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching landlords:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchConversationMessages(conversation.other_user_id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post('/messages', {
        receiver_id: selectedConversation.other_user_id,
        subject: 'Re: Conversation',
        message: newMessage.trim()
      });

      setNewMessage('');
      fetchConversationMessages(selectedConversation.other_user_id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendNewMessage = async () => {
    try {
      setLoading(true);
      await api.post('/messages', newMessageData);
      
      setComposeDialog(false);
      setNewMessageData({ receiver_id: '', subject: '', message: '' });
      fetchConversations();
      
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'grey.50',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Messages
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setComposeDialog(true)}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            New Message
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        gap: 0
      }}>
        {/* Conversations Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', md: 380 },
          bgcolor: 'white',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'grey.50',
                  '& fieldset': { border: 'none' },
                }
              }}
            />
          </Box>

          {/* Conversations List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {conversations.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center'
              }}>
                <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a new conversation to get started
                </Typography>
              </Box>
            ) : (
              conversations
                .filter(conv => 
                  searchQuery === '' || 
                  `${conv.first_name} ${conv.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                  <Box
                    key={conversation.other_user_id}
                    onClick={() => selectConversation(conversation)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: selectedConversation?.other_user_id === conversation.other_user_id 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge 
                        badgeContent={conversation.unread_count} 
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            minWidth: 18,
                            height: 18
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: conversation.role === 'landlord' ? 'primary.main' : 'secondary.main',
                            fontSize: '1.2rem',
                            fontWeight: 600
                          }}
                        >
                          {conversation.first_name.charAt(0)}{conversation.last_name.charAt(0)}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={conversation.unread_count > 0 ? 600 : 500}
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {conversation.first_name} {conversation.last_name}
                          </Typography>
                          {conversation.unread_count > 0 && (
                            <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip 
                            label={conversation.role} 
                            size="small" 
                            variant="outlined"
                            color={conversation.role === 'landlord' ? 'primary' : 'secondary'}
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 20,
                              borderRadius: 2
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatMessageTime(conversation.last_message_date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))
            )}
          </Box>
        </Box>
        {/* Messages Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'white'
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: selectedConversation.role === 'landlord' ? 'primary.main' : 'secondary.main',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {selectedConversation.first_name.charAt(0)}{selectedConversation.last_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedConversation.first_name} {selectedConversation.last_name}
                      </Typography>
                      <Chip 
                        label={selectedConversation.role} 
                        size="small" 
                        variant="outlined"
                        color={selectedConversation.role === 'landlord' ? 'primary' : 'secondary'}
                        sx={{ fontSize: '0.7rem', height: 18 }}
                      />
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                bgcolor: 'grey.50'
              }}>
                <Stack spacing={2}>
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user.id;
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          mb: 1
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '75%',
                            bgcolor: isOwnMessage ? 'primary.main' : 'white',
                            color: isOwnMessage ? 'white' : 'text.primary',
                            borderRadius: 3,
                            borderTopRightRadius: isOwnMessage ? 1 : 3,
                            borderTopLeftRadius: isOwnMessage ? 3 : 1,
                            p: 2,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative'
                          }}
                        >
                          {message.subject && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                opacity: isOwnMessage ? 0.9 : 0.8
                              }}
                            >
                              {message.subject}
                            </Typography>
                          )}
                          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.4 }}>
                            {message.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7,
                              fontSize: '0.7rem'
                            }}
                          >
                            {new Date(message.created_at).toLocaleString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          {message.property_address && (
                            <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                mt: 0.5, 
                                opacity: 0.7,
                                fontSize: '0.7rem',
                                fontStyle: 'italic'
                              }}
                            >
                              📍 {message.property_address}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                bgcolor: 'white'
              }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    multiline
                    maxRows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'grey.50',
                        '& fieldset': { borderColor: 'divider' },
                      }
                    }}
                  />
                  <Fab
                    size="small"
                    color="primary"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ 
                      boxShadow: 2,
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Send />
                  </Fab>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              bgcolor: 'grey.50'
            }}>
              <MessageIcon sx={{ 
                fontSize: 80, 
                color: 'text.secondary', 
                mb: 3, 
                opacity: 0.3 
              }} />
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={500}>
                Select a conversation
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Choose a conversation from the sidebar to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Compose Message Dialog */}
      <Dialog 
        open={composeDialog} 
        onClose={() => setComposeDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" fontWeight={600}>
            New Message
          </Typography>
          <IconButton
            onClick={() => setComposeDialog(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>To</InputLabel>
              <Select
                value={newMessageData.receiver_id}
                onChange={(e) => setNewMessageData(prev => ({ ...prev, receiver_id: e.target.value }))}
                label="To"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  }
                }}
              >
                {landlords.map((landlord) => (
                  <MenuItem key={landlord.id} value={landlord.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                        {landlord.first_name.charAt(0)}{landlord.last_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {landlord.first_name} {landlord.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {landlord.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Subject"
              value={newMessageData.subject}
              onChange={(e) => setNewMessageData(prev => ({ ...prev, subject: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'divider' }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={5}
              value={newMessageData.message}
              onChange={(e) => setNewMessageData(prev => ({ ...prev, message: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'divider' }
                }
              }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setComposeDialog(false)}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={sendNewMessage}
            variant="contained"
            disabled={!newMessageData.receiver_id || !newMessageData.subject || !newMessageData.message || loading}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
