# Role-Based Authentication System

This document describes the comprehensive role-based authentication system implemented in the Music Band website.

## Overview

The system implements two distinct user roles:
- **Admin**: Full access to manage events, users, and bookings
- **User**: Access to view events and book tickets

## Features

### ✅ Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control (RBAC)
- Protected routes for admin and user areas
- Automatic role-based redirects after login

### ✅ Admin Capabilities
- **Dashboard**: Overview with statistics and analytics
- **User Management**: View, edit roles, and delete users
- **Event Management**: Create, read, update, delete events
- **Booking Management**: View and manage all bookings
- **Statistics**: Comprehensive site analytics

### ✅ User Capabilities
- **Dashboard**: Personal overview and quick actions
- **Event Browsing**: View all upcoming events
- **Ticket Booking**: Book tickets for events
- **Booking Management**: View and cancel personal bookings
- **Profile Management**: Update personal information and preferences

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    location: String,
    website: String,
    socialMedia: {
      twitter: String,
      instagram: String,
      facebook: String
    }
  },
  preferences: {
    emailNotifications: Boolean,
    eventUpdates: Boolean,
    newsletter: Boolean
  },
  stats: {
    eventsCreated: Number,
    eventsAttended: Number,
    lastLogin: Date
  }
}
```

### Event Model
```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  location: String (required),
  image: String,
  ticketPrice: Number,
  maxAttendees: Number,
  category: String (enum: ['Concert', 'Festival', 'Workshop', 'Meet & Greet', 'Other']),
  createdBy: ObjectId (ref: User, required),
  status: String (enum: ['upcoming', 'ongoing', 'completed', 'cancelled'])
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: User, required),
  event: ObjectId (ref: Event, required),
  ticketQuantity: Number (required, min: 1, max: 10),
  totalPrice: Number (required),
  status: String (enum: ['pending', 'confirmed', 'cancelled']),
  bookingDate: Date,
  paymentStatus: String (enum: ['pending', 'paid', 'refunded']),
  specialRequests: String,
  contactInfo: {
    phone: String,
    email: String
  }
}
```

## Route Protection

### Frontend Routes
- `/admin/*` - Protected, admin access only
- `/user/*` - Protected, user access only
- `/events` - Public access
- `/auth` - Public access

### Backend Middleware
- `authenticateToken` - Verifies JWT token
- `requireAdmin` - Ensures user has admin role
- `requireAdminOrOwner` - Allows admin or resource owner access

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token

### Admin Only
- `GET /api/auth/users` - Get all users
- `PUT /api/auth/users/:id/role` - Update user role
- `DELETE /api/auth/users/:id` - Delete user
- `GET /api/events/admin/all` - Get all events
- `PUT /api/events/admin/:id` - Update any event
- `DELETE /api/events/admin/:id` - Delete any event
- `GET /api/events/admin/stats` - Get event statistics
- `GET /api/bookings/admin/all` - Get all bookings
- `PUT /api/bookings/admin/:id/status` - Update booking status
- `DELETE /api/bookings/admin/:id` - Delete booking
- `GET /api/bookings/admin/stats` - Get booking statistics

### User Access
- `GET /api/events` - Get public events
- `GET /api/events/my-events` - Get user's events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update own event
- `DELETE /api/events/:id` - Delete own event
- `POST /api/bookings/book` - Book tickets
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PUT /api/bookings/cancel/:id` - Cancel booking

## Security Features

### JWT Implementation
- Secure token generation with user ID and role
- 24-hour token expiration
- Token verification on protected routes
- Automatic token refresh handling

### Password Security
- bcrypt hashing with salt rounds
- Minimum password length validation
- Secure password change functionality

### Role Validation
- Server-side role verification
- Frontend role-based UI rendering
- Route-level access control
- API endpoint protection

## Usage Examples

### Creating an Admin User
```bash
cd backend
node createAdmin.js
```

This creates an admin user with:
- Email: admin@musicband.com
- Password: admin123
- Role: admin

### Login Flow
1. User enters credentials
2. System validates credentials
3. JWT token generated with user role
4. Role-based redirect:
   - Admin → `/admin`
   - User → `/user`

### Protected Route Access
```javascript
// Frontend route protection
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Admin />
    </ProtectedRoute>
  } 
/>

// Backend middleware
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  // Only admins can access this endpoint
});
```

## Frontend Components

### Admin Components
- `AdminDashboard` - Main admin interface
- `AddEvent` - Event creation form
- Event management tables
- User management interface

### User Components
- `UserDashboard` - Personal dashboard
- `BookTicket` - Ticket booking interface
- `MyBookings` - Personal bookings view
- `UserProfile` - Profile management

## Styling & UX

### Design Principles
- Modern, responsive design
- Role-based color coding
- Intuitive navigation
- Mobile-friendly interface

### Color Scheme
- Admin: Red/Orange gradients
- User: Blue/Purple gradients
- Success: Green
- Warning: Yellow
- Error: Red

## Testing

### Manual Testing
1. Create admin user using `createAdmin.js`
2. Test admin login and dashboard access
3. Create regular user account
4. Test user login and dashboard access
5. Verify route protection
6. Test CRUD operations for both roles

### Security Testing
1. Attempt admin access with user account
2. Verify JWT token validation
3. Test API endpoint protection
4. Validate role-based permissions

## Deployment Considerations

### Environment Variables
```bash
MONGO_URI=mongodb://localhost:27017/musicband
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Security Best Practices
- Use strong JWT secrets
- Implement HTTPS in production
- Regular security audits
- Monitor authentication logs
- Rate limiting for auth endpoints

## Troubleshooting

### Common Issues
1. **JWT Token Expired**: Re-login required
2. **Role Mismatch**: Check user role in database
3. **Route Access Denied**: Verify user authentication and role
4. **Database Connection**: Check MongoDB connection string

### Debug Steps
1. Check browser console for errors
2. Verify localStorage token and role
3. Check backend logs for authentication errors
4. Validate database user records

## Future Enhancements

### Planned Features
- Multi-factor authentication
- Role hierarchy system
- Advanced permission management
- Audit logging
- Session management
- Password reset functionality

### Scalability
- Redis for session storage
- JWT refresh tokens
- Role-based caching
- API rate limiting
- Load balancing support

---

This role-based authentication system provides a robust foundation for user management and access control in the Music Band website, ensuring secure and appropriate access to different features based on user roles.
























