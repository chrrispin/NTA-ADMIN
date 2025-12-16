import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import routes from './routes.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('📋 Configuration:');
console.log('  PORT:', PORT);
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('  Headers:', JSON.stringify(req.headers));
  console.log('  Body length:', req.rawBody ? req.rawBody.length : 'none');
  next();
});

// Routes
app.use('/api', routes);

// Test endpoint
app.get('/test', (req, res) => {
  console.log('📌 TEST ENDPOINT HIT');
  res.json({ success: true, message: 'Server is responding' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Initialize database and start server
const start = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log('Initializing database...');
    await initDB();
    console.log('✓ Database initialized successfully');

    console.log('📌 About to call app.listen on port:', PORT);
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ LISTEN CALLBACK FIRED
╔═══════════════════════════════════════╗
║     NTA Admin Backend Server          ║
║                                       ║
║  Server running on port ${PORT}         ║
║  API: http://localhost:${PORT}/api       ║
╚═══════════════════════════════════════╝
      `);
    });

    console.log('📌 Returned from app.listen()');

    // Handle server errors
    server.on('error', (err) => {
      console.error('🔴 Server error:', err);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Exit handler
process.on('exit', (code) => {
  console.log('⛔ Process exiting with code:', code);
});

// SIGINT handler
process.on('SIGINT', () => {
  console.log('⛔ Received SIGINT, exiting gracefully');
  process.exit(0);
});

console.log('📝 Loading server...');
start();
