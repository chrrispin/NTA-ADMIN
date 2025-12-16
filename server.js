const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'nta-admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// In-memory storage for demo purposes
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    fullName: 'System Administrator'
  }
];

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login.html');
}

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard.html');
  } else {
    res.redirect('/login.html');
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ success: true, message: 'Login successful', user: { username: user.username, role: user.role, fullName: user.fullName } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (user) {
    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        role: user.role,
        fullName: user.fullName 
      } 
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Get all users (admin only)
app.get('/api/users', requireAuth, (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    fullName: u.fullName
  }));
  
  res.json({ success: true, users: userList });
});

// Dashboard stats endpoint
app.get('/api/stats', requireAuth, (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      activeUsers: users.length,
      totalSessions: 1,
      systemStatus: 'operational'
    }
  });
});

app.listen(PORT, () => {
  console.log(`NTA-ADMIN server running on port ${PORT}`);
  console.log(`Default login - Username: admin, Password: admin123`);
});
