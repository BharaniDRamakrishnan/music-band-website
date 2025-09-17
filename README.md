# Music Band Project

A full-stack web application for a music band with authentication, discography, events, and more.

## Features

- **Frontend**: React.js with modern UI design
- **Backend**: Node.js/Express.js with MongoDB
- **Authentication**: JWT-based role-based authentication system
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Admin Dashboard**: Full CRUD operations for events, users, and bookings
- **User Dashboard**: Personal dashboard for viewing events and managing bookings
- **Event Management**: Create, edit, and delete events (admin only)
- **Ticket Booking**: Users can book tickets for events
- **Responsive Design**: Mobile-friendly interface
- **Navigation**: Horizontal navigation bar with role-based menu items

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (for backend functionality)
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/music-band
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. Start MongoDB service on your system

5. Start the backend server:
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

### Public Pages
- **Home**: Welcome page with call-to-action button
- **About**: Information about the music band
- **Discography**: Album listings with embedded players
- **Events**: Upcoming events and concerts
- **Contact**: Contact information
- **Auth**: Combined login/signup page

### Admin Features (Admin Role Only)
- **Admin Dashboard** (`/admin`): Manage events, users, and bookings
- **Event Management**: Create, edit, and delete events
- **User Management**: View, edit roles, and delete users
- **Booking Management**: View and manage all bookings
- **Statistics**: Comprehensive site analytics

### User Features (User Role Only)
- **User Dashboard** (`/user`): Personal dashboard and quick actions
- **Event Browsing**: View all upcoming events
- **Ticket Booking**: Book tickets for events
- **My Bookings**: View and cancel personal bookings
- **Profile Management**: Update personal information and preferences

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Admin Only
- `GET /api/auth/users` - Get all users
- `PUT /api/auth/users/:id/role` - Update user role
- `DELETE /api/auth/users/:id` - Delete user
- `GET /api/events/admin/*` - Admin event management
- `GET /api/bookings/admin/*` - Admin booking management

### User Access
- `GET /api/events` - Get public events
- `POST /api/events` - Create event
- `POST /api/bookings/book` - Book tickets
- `GET /api/bookings/my-bookings` - Get user's bookings

## Project Structure

```
music-band-project/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Notes

- The navigation bar is horizontally aligned with a black background
- Login and signup are combined into a single page
- Backend requires MongoDB to be running for authentication features
- Frontend runs on port 3000, backend on port 5000
- **Role-Based Access**: Users are automatically assigned 'user' role on signup
- **Admin Creation**: Use `node createAdmin.js` in backend directory to create admin user
- **Route Protection**: `/admin/*` routes are admin-only, `/user/*` routes are user-only
- **JWT Tokens**: Authentication tokens expire after 24 hours

## Troubleshooting

- If MongoDB connection fails, ensure MongoDB service is running
- Check that all environment variables are set in the `.env` file
- Ensure both frontend and backend are running simultaneously
- **Authentication Issues**: Verify JWT token in localStorage and user role
- **Route Access Denied**: Check if user has appropriate role for the route
- **Admin Access**: Ensure admin user exists and has 'admin' role in database

## Quick Start

1. **Setup**: Follow installation steps above
2. **Create Admin**: Run `node createAdmin.js` in backend directory
3. **Login as Admin**: Use admin@musicband.com / admin123
4. **Create Regular User**: Sign up through the auth page
5. **Test Roles**: Verify different access levels for admin vs user accounts

For detailed information about the role-based authentication system, see [ROLE_BASED_AUTH_README.md](ROLE_BASED_AUTH_README.md).




