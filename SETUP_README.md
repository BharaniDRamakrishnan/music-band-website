# Music Band Website - Role-Based Authentication Setup

This is a music band website with role-based authentication where:
- **Normal users** can view events and book tickets
- **Admins** can add, edit, and delete events

## Features

- ✅ Role-based authentication (user/admin)
- ✅ MongoDB integration for data storage
- ✅ JWT-based authentication
- ✅ Role-specific UI elements
- ✅ Simple navigation: Home, About, Events, Contact, Login

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=mongodb://localhost:27017/music-band-db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. Start MongoDB service on your system

5. Create an admin user:
   ```bash
   node createCustomAdmin.js
   ```
   This will create an admin user with the credentials defined in the script.

6. Start the backend server:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```

## Usage

### For Regular Users:
1. Sign up with a new account (defaults to 'user' role)
2. Login and you'll be redirected to the Events page
3. View events and book tickets
4. Only "Book Ticket" buttons will be visible

### For Admins:
1. Use the admin credentials created by the script
2. Login and you'll be redirected to the Events page
3. View events with "Add", "Edit", and "Delete" options
4. Can create new events, modify existing ones, and delete events

## API Endpoints

### Public Endpoints:
- `GET /api/events` - Get all upcoming events
- `GET /api/events/:id` - Get specific event

### Protected Endpoints (Admin Only):
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/admin/all` - Get all events (admin view)
- `GET /api/events/admin/stats` - Get event statistics

### Authentication:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

## Database Models

### User Model:
- username, email, password
- role (user/admin)
- profile information
- preferences and stats

### Event Model:
- title, description, date, location
- image, ticketPrice, maxAttendees
- category, status, createdBy

### Booking Model:
- event, user, quantity, totalPrice
- status, bookingDate

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API endpoints
- Input validation and sanitization

## File Structure

```
music-band-project/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Main server file
│   └── createAdmin.js   # Admin user creation script
├── frontend/
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running on your system
2. **JWT Secret Error**: Check that JWT_SECRET is set in your .env file
3. **Port Already in Use**: Change the PORT in .env file or stop other services using port 5000
4. **Admin Creation Failed**: Check MongoDB connection and ensure no duplicate emails/usernames

## Development Notes

- The system uses localStorage for client-side authentication
- All users are redirected to the Events page after login
- Role-based UI elements are conditionally rendered
- The backend enforces role-based access control for all protected endpoints






















