# NTA Admin Backend API

Express.js backend server for NTA Admin Panel with SQLite database and JWT authentication.

## Features

- 🔐 User authentication (signup/login)
- 🔑 JWT token-based authorization
- 🛡️ Password hashing with bcryptjs
- 📁 SQLite database
- 🌐 CORS enabled
- ✅ Input validation

## Installation

```bash
cd backend
npm install
```

## Setup

1. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
PORT=3000
JWT_SECRET=your-secure-secret-key
NODE_ENV=development
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### Sign Up
**POST** `/api/admin/signup`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Login
**POST** `/api/admin/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Get Current User
**GET** `/api/admin/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Health Check
**GET** `/api/health`

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Security

- Passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire after 7 days
- CORS is enabled for the frontend URL
- Input validation on all endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| NODE_ENV | Environment mode | development |

## File Structure

```
backend/
├── server.js          # Main server file
├── db.js              # Database initialization and helpers
├── auth.js            # Authentication utilities and middleware
├── routes.js          # API routes
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── data/              # SQLite database file (auto-created)
    └── admin.db
```

## Troubleshooting

### Database not found
The database is created automatically on first run. Check the `data/` folder.

### JWT errors
Make sure to change the `JWT_SECRET` in `.env` for production.

### CORS errors
Ensure the frontend is making requests to `http://localhost:3000/api`

## Next Steps

- Add more API endpoints for articles management
- Implement refresh tokens
- Add email verification
- Add password reset functionality
- Set up database backups
