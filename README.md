# NTA-ADMIN
New Time Africa ADMIN - Administrative Portal

A modern, secure administrative portal for managing New Time Africa operations. This application provides user management, authentication, and dashboard analytics capabilities.

## Features

- 🔐 Secure authentication system with session management
- 👥 User management (view, create, update, delete)
- 📊 Dashboard with real-time statistics
- 🎨 Modern, responsive UI design
- 🚀 Built with Node.js and Express

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/chrrispin/NTA-ADMIN.git
cd NTA-ADMIN
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
SESSION_SECRET=your-secure-secret-key
NODE_ENV=development
```

## Usage

### Start the server

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Default Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change these credentials in a production environment!

## Project Structure

```
NTA-ADMIN/
├── src/
│   ├── server.js           # Main application server
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── admin.js        # Admin panel routes
│   └── middleware/
│       └── auth.js         # Authentication middleware
├── public/
│   ├── login.html          # Login page
│   └── dashboard.html      # Admin dashboard
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/session` - Check session status

### Admin Panel
- `GET /admin/dashboard` - Admin dashboard page
- `GET /admin/api/stats` - Get dashboard statistics
- `GET /admin/api/users` - Get all users
- `GET /admin/api/users/:id` - Get specific user
- `POST /admin/api/users` - Create new user
- `PUT /admin/api/users/:id` - Update user
- `DELETE /admin/api/users/:id` - Delete user

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Protected admin routes
- Environment variable configuration
- Secure cookie settings for production

## Development

To run the application in development mode:

```bash
npm run dev
```

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Email notifications
- Role-based access control (RBAC)
- Activity logging and audit trail
- File upload functionality
- Export reports to CSV/PDF
- Two-factor authentication

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
