const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
};

// Middleware to check if user is admin or the owner of the resource
const requireAdminOrOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Check if user is the owner (assuming resource has createdBy field)
        if (req.params.id && req.resource && req.resource.createdBy) {
            if (req.resource.createdBy.toString() === req.user._id.toString()) {
                return next();
            }
        }
        
        return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireAdminOrOwner
};

