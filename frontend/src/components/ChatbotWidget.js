import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: 'Hello! I\'m your Music Band Assistant. How can I help you today?',
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const messagesEndRef = useRef(null);

    // API base URL - adjust if needed
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log('API_BASE_URL:', API_BASE_URL);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Get JWT token from localStorage
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Handle sending messages
    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const token = getToken();
            console.log('Sending chatbot request:', { message: inputText, token: !!token });
            
            const response = await axios.post(`${API_BASE_URL}/chatbot`, {
                message: inputText,
                token: token
            });

            console.log('Chatbot response received:', response.data);

            const botMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                isBot: true,
                timestamp: new Date(),
                data: response.data.data || null
            };

            setMessages(prev => [...prev, botMessage]);
            
            // If events data is returned, store it
            if (response.data.data && Array.isArray(response.data.data)) {
                setEvents(response.data.data);
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            console.error('Full error object:', error.response || error);
            
            const errorMessage = {
                id: Date.now() + 1,
                text: error.response?.data?.response || 'Sorry, I encountered an error. Please try again later.',
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render event data if available
    const renderEventData = (data) => {
        if (!data || !Array.isArray(data)) return null;

        return (
            <div className="event-data">
                {data.map(event => (
                    <div key={event.id} className="event-item">
                        <h4>{event.title}</h4>
                        <p><strong>Date:</strong> {formatDate(event.date)}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                        <p><strong>Price:</strong> ${event.ticketPrice}</p>
                        {event.description && (
                            <p><strong>Description:</strong> {event.description}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Render booking data if available
    const renderBookingData = (data) => {
        if (!data || !Array.isArray(data)) return null;

        return (
            <div className="booking-data">
                {data.map(booking => (
                    <div key={booking.id} className="booking-item">
                        <h4>{booking.eventTitle}</h4>
                        <p><strong>Date:</strong> {formatDate(booking.eventDate)}</p>
                        <p><strong>Location:</strong> {booking.eventLocation}</p>
                        <p><strong>Tickets:</strong> {booking.ticketQuantity}</p>
                        <p><strong>Total:</strong> ${booking.totalPrice}</p>
                        <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Music Band Assistant</h3>
                        <button 
                            className="close-btn" 
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.map(message => (
                            <div 
                                key={message.id} 
                                className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
                            >
                                <div className="message-content">
                                    <p>{message.text}</p>
                                    
                                    {/* Render event data */}
                                    {message.data && renderEventData(message.data)}
                                    
                                    {/* Render booking data */}
                                    {message.data && renderBookingData(message.data)}
                                </div>
                                <span className="message-time">
                                    {message.timestamp.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </span>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message bot-message loading">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me about events or bookings..."
                            disabled={isLoading}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={isLoading || !inputText.trim()}
                            className="send-btn"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
            
            {/* Chat Icon */}
            <button 
                className={`chatbot-icon ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open chat assistant"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default ChatbotWidget;
