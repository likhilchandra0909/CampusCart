import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiSend, FiPaperclip, FiMoreVertical, FiChevronLeft, FiSearch, FiCheck, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Messages.css';

const Messages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Consistent ID handling
    const currentUserId = user?.id || user?._id;
    
    // The conversation ID can come from navigation state (when clicking "Message" on a product or sidebar)
    const activeId = location.state?.conversationId;
    
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedConv, setSelectedConv] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const socket = useRef();
    const scrollRef = useRef();
    const typingTimeout = useRef();

    // Socket Initialization
    useEffect(() => {
        socket.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socket.current.on('getMessage', (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                conversationId: data.conversationId,
                createdAt: Date.now(),
            });
        });

        socket.current.on('displayTyping', (data) => {
            if (activeId === data.conversationId) {
                setIsTyping(true);
            }
        });

        socket.current.on('hideTyping', (data) => {
            if (activeId === data.conversationId) {
                setIsTyping(false);
            }
        });

        socket.current.on('getUsers', (users) => {
            setOnlineUsers(users);
        });

        return () => socket.current.disconnect();
    }, [activeId]);

    // Register user on socket
    useEffect(() => {
        if (currentUserId && socket.current) {
            socket.current.emit('addUser', currentUserId);
        }
    }, [currentUserId]);

    // Handle arrival message
    useEffect(() => {
        if (arrivalMessage && selectedConv?._id === arrivalMessage.conversationId) {
            setMessages((prev) => [...prev, arrivalMessage]);
            chatService.markAsSeen(arrivalMessage.conversationId);
        }
        fetchConversations();
    }, [arrivalMessage, selectedConv]);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            const res = await chatService.getConversations();
            setConversations(res.data);
            if (activeId) {
                const current = res.data.find(c => c._id === activeId);
                if (current) {
                    setSelectedConv(current);
                } else {
                    // If not in list (newly created), re-fetch or wait
                    // For now, if we have an activeId but it's not in the list, it might be the list is still older
                    // We check if we need to fetch this specific conversation
                }
            }
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [activeId]);

    // Fetch messages when conversation selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (activeId) {
                try {
                    const res = await chatService.getMessages(activeId);
                    setMessages(res.data);
                    await chatService.markAsSeen(activeId);
                    fetchConversations();
                } catch (err) {
                    console.error('Failed to fetch messages', err);
                }
            } else {
                setMessages([]);
                setSelectedConv(null);
            }
        };
        fetchMessages();
    }, [activeId]);

    // Auto scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        const receiverId = selectedConv.members.find(m => (m._id || m) !== currentUserId)?._id;

        const messageData = {
            conversationId: selectedConv._id,
            text: newMessage,
        };

        try {
            const res = await chatService.sendMessage(messageData);
            setMessages([...messages, res.data]);
            setNewMessage('');
            
            socket.current.emit('sendMessage', {
                senderId: currentUserId,
                receiverId,
                text: newMessage,
                conversationId: selectedConv._id
            });

            // Stop typing indicator
            socket.current.emit('stopTyping', {
                senderId: currentUserId,
                receiverId,
                conversationId: selectedConv._id
            });

            fetchConversations(); // Update last message in list
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleTyping = () => {
        if (!selectedConv) return;
        const currentUserId = user.id || user._id;
        const receiverId = selectedConv.members.find(m => (m._id || m) !== currentUserId)?._id;
        if (!receiverId) return;
        socket.current.emit('typing', {
            senderId: currentUserId,
            receiverId,
            conversationId: selectedConv._id
        });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        
        typingTimeout.current = setTimeout(() => {
            socket.current.emit('stopTyping', {
                senderId: currentUserId,
                receiverId,
                conversationId: selectedConv._id
            });
        }, 3000);
    };

    const getOtherMember = (conv) => {
        return conv.members.find(m => (m._id || m) !== currentUserId);
    };

    const isUserOnline = (userId) => {
        return onlineUsers.some(u => u.userId === userId);
    };

    const filteredConversations = conversations.filter(c => {
        const other = getOtherMember(c);
        return other?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.product?.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="messages-container glass-panel">
            {/* Sidebar */}
            <div className={`conv-sidebar ${activeId ? 'hidden-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2>Chats</h2>
                    <div className="search-box">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="conv-list">
                    {filteredConversations.map(conv => {
                        const otherMember = getOtherMember(conv);
                        const isActive = conv._id === activeId;
                        const unread = conv.unreadCount?.[currentUserId] || 0;

                        return (
                            <div 
                                key={conv._id} 
                                className={`conv-item ${isActive ? 'active' : ''}`}
                                onClick={() => navigate('/messages', { state: { conversationId: conv._id } })}
                            >
                                <div className="avatar-wrapper">
                                    <img src={otherMember?.avatar} alt={otherMember?.name} />
                                    {isUserOnline(otherMember?._id) && <span className="online-status"></span>}
                                </div>
                                <div className="conv-content">
                                    <div className="conv-top">
                                        <span className="conv-name">{otherMember?.name}</span>
                                        <span className="conv-time">
                                            {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'p') : ''}
                                        </span>
                                    </div>
                                    <div className="conv-bottom">
                                        <p className="last-msg">{conv.lastMessage || 'Start a conversation'}</p>
                                        {unread > 0 && <span className="unread-badge">{unread}</span>}
                                    </div>
                                    <span className="product-tag">{conv.product?.title}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`chat-window ${!activeId ? 'hidden-mobile' : ''}`}>
                {selectedConv ? (
                    <>
                        <div className="chat-header">
                            <button className="back-btn mobile-only" onClick={() => navigate('/messages')}>
                                <FiChevronLeft />
                            </button>
                            <div className="chat-user-info">
                                <img src={getOtherMember(selectedConv)?.avatar} alt="Other" />
                                <div>
                                    <h3>{getOtherMember(selectedConv)?.name}</h3>
                                    <p className="online-indicator">
                                        {isUserOnline(getOtherMember(selectedConv)?._id) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="chat-product-preview glass-panel">
                                <img src={selectedConv.product?.images?.[0] ? (selectedConv.product.images[0].startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedConv.product.images[0]}` : selectedConv.product.images[0]) : ''} alt="Product" />
                                <div>
                                    <h4>{selectedConv.product?.title}</h4>
                                    <span>₹{selectedConv.product?.price?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => toast('Settings coming soon', { icon: '⚙️' })}><FiMoreVertical /></button>
                        </div>

                        <div className="messages-display">
                            <AnimatePresence>
                                {messages.map((msg, index) => {
                                    const msgSenderId = msg.sender._id || msg.sender;
                                    const isOwn = msgSenderId.toString() === currentUserId?.toString();
                                    
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            key={msg._id || index} 
                                            className={`message-bubble-wrapper ${isOwn ? 'own' : ''}`}
                                        >
                                            <div className="message-bubble">
                                                <p>{msg.text}</p>
                                                <div className="message-meta">
                                                    <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                                    {isOwn && (
                                                        <span className={`status-icon ${msg.seen ? 'seen' : ''}`}>
                                                            {msg.seen ? <FiCheckCircle /> : <FiCheck />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {isTyping && (
                                <div className="typing-indicator">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <button type="button" className="icon-btn" onClick={() => toast('File uploads coming soon', { icon: '📎' })}><FiPaperclip /></button>
                            <input 
                                type="text" 
                                placeholder="Write a message..." 
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                            />
                            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                <FiSend />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="welcome-chat">
                            <FiMessageSquare size={64} />
                            <h2>Your Messages</h2>
                            <p>Select a conversation to start chatting with buyers and sellers.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
