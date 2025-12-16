const express = require('express');
const path = require('path');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@newtimeafrica.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@newtimeafrica.com', role: 'user', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@newtimeafrica.com', role: 'user', status: 'inactive' }
];

const mockStats = {
  totalUsers: 150,
  activeUsers: 127,
  newUsersThisMonth: 23,
  totalRevenue: '$45,230'
};

// Apply auth middleware to all admin routes
router.use(requireAuth);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// Get dashboard stats
router.get('/api/stats', (req, res) => {
  res.json(mockStats);
});

// Get all users
router.get('/api/users', (req, res) => {
  res.json(mockUsers);
});

// Get single user
router.get('/api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create user
router.post('/api/users', (req, res) => {
  const newUser = {
    id: mockUsers.length + 1,
    ...req.body,
    status: 'active'
  };
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

// Update user
router.put('/api/users/:id', (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...req.body };
    res.json(mockUsers[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Delete user
router.delete('/api/users/:id', (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    mockUsers.splice(index, 1);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

module.exports = router;
