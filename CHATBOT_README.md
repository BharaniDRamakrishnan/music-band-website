# Music Band Event Booking Platform - Chatbot Feature

## Overview
This document describes the chatbot feature that has been added to the Music Band Event Booking Platform. The chatbot allows users to interact with the platform using natural language to get help with events, bookings, and general platform information.

## Features

### Chatbot Capabilities
- **View Events**: Ask "Show upcoming events" or "What events are there?" to see upcoming events
- **Check Bookings**: Ask "My bookings" or "Show my bookings" to view user's booking history (requires login)
- **Booking Assistance**: Ask "Book tickets" or "How to purchase?" for guidance on booking tickets
- **General Help**: Ask "Help" or "What can you do?" for a list of capabilities

### User Interface
- **Floating Widget**: Chat icon appears in bottom-right corner of all pages
- **Clean Design**: Modern chat bubble interface with blue gradient styling
- **Responsive**: Mobile-friendly design that adapts to different screen sizes
- **Real-time**: Instant responses with typing indicators

## Technical Implementation

### Backend (Node.js + Express)
- **Route**: `POST /api/chatbot`
- **Authentication**: JWT token support for user-specific queries
- **Rule-based Responses**: Pattern matching for different user intents
- **Data Integration**: Fetches real data from events and bookings APIs

### Frontend (React)
- **Component**: `ChatbotWidget.js` in `/src/components/`
- **Styling**: `Chatbot.css` with modern design and animations
- **API Integration**: Axios for HTTP requests
- **State Management**: React hooks for message history and UI state

## Setup Instructions

### Backend Setup
1. The chatbot route is automatically included in `server.js`
2. Ensure your backend server is running on port 5000 (or set PORT environment variable)
3. MongoDB connection is required for data queries

### Frontend Setup
1. The chatbot widget is included in `App.js` automatically
2. For production, update the API URL in `ChatbotWidget.js` or set `REACT_APP_API_URL` environment variable
3. Restart the React development server to see the chatbot

### Environment Variables
```
# Backend (.env)
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_connection_string
PORT=5000

# Frontend (optional)
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing the Chatbot

### Basic Tests
1. **Events Query**: Send message "events" or "show events"
2. **Bookings Query**: Send message "my bookings" (requires login)
3. **Help Query**: Send message "help"
4. **Booking Guidance**: Send message "book tickets"

### Advanced Tests
1. **Unauthenticated Features**: Test event viewing without login
2. **Authenticated Features**: Test booking access with valid JWT token
3. **Error Handling**: Test with invalid messages or API errors
4. **Mobile Responsiveness**: Test on mobile devices

## API Endpoints

### POST /api/chatbot
**Request Body:**
```json
{
  "message": "show upcoming events",
  "token": "jwt_token_string" // optional
}
```

**Response:**
```json
{
  "response": "Here are the upcoming events:",
  "data": [
    {
      "id": "event_id",
      "title": "Event Title",
      "date": "2024-01-15T18:00:00.000Z",
      "location": "Venue Name",
      "ticketPrice": 25,
      "description": "Event description"
    }
  ],
  "needsAuth": false
}
```

### GET /api/chatbot/health
**Response:**
```json
{
  "status": "OK",
  "message": "Chatbot is running",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Security Considerations

1. **JWT Token Handling**: Tokens are passed in request body for user-specific queries
2. **Input Sanitization**: User messages are processed safely
3. **Error Handling**: Graceful error responses without exposing sensitive information
4. **CORS**: Configured to work with React frontend

## Future Enhancements

### Potential Improvements
1. **Natural Language Processing**: Upgrade to more sophisticated NLP
2. **Machine Learning**: Train models for better intent recognition
3. **Multi-language Support**: Add support for multiple languages
4. **Rich Responses**: Support for images, buttons, and interactive elements
5. **Analytics**: Track conversation patterns and popular queries
6. **Offline Mode**: Cache responses for offline functionality

### Customization Options
1. **Branding**: Customize colors and styling to match brand
2. **Personality**: Adjust bot responses to match platform tone
3. **Knowledge Base**: Expand with FAQ and platform-specific information
4. **Integration**: Connect with external services or databases

## Troubleshooting

### Common Issues
1. **Chatbot not appearing**: Ensure `ChatbotWidget` is imported in `App.js`
2. **API errors**: Check backend server is running and accessible
3. **Authentication issues**: Verify JWT token is valid and properly formatted
4. **Styling issues**: Ensure `Chatbot.css` is imported correctly

### Debug Mode
1. Check browser console for JavaScript errors
2. Check network tab for failed API requests
3. Verify JWT token in browser local storage
4. Test API endpoints directly using Postman or curl

## Support

For issues or questions regarding the chatbot feature:
1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Ensure both frontend and backend servers are running
4. Check MongoDB connection status

## Version History

- **v1.0**: Initial implementation with basic rule-based responses
- Features: Event viewing, booking access, help system, mobile-responsive design
