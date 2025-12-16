import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

console.log('🚀 Starting test server');

// Minimal middleware
app.use(cors());
app.use(express.json());

app.post('/api/test', (req, res) => {
  console.log('📧 Test route hit');
  res.json({ success: true, message: 'Test OK' });
});

console.log('Calling app.listen...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

console.log('Returned from app.listen()');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
