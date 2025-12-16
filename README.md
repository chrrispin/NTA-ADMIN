# NTA-ADMIN

**New Time Africa Admin Dashboard**

A modern, secure admin dashboard system for managing New Time Africa operations.

## Features

- 🔐 Secure authentication system
- 📊 Real-time dashboard statistics
- 👥 User management interface
- ⚙️ Settings and configuration panel
- 📱 Responsive design for all devices
- 🎨 Modern, intuitive UI

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chrrispin/NTA-ADMIN.git
cd NTA-ADMIN
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change these credentials in production!

## Project Structure

```
NTA-ADMIN/
├── public/              # Frontend files
│   ├── login.html       # Login page
│   ├── dashboard.html   # Dashboard interface
│   ├── dashboard.js     # Dashboard functionality
│   └── styles.css       # Styling
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md           # Documentation
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Admin
- `GET /api/users` - Get all users (admin only)
- `GET /api/stats` - Get dashboard statistics

## Technology Stack

- **Backend:** Node.js, Express
- **Authentication:** express-session, bcryptjs
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## Security Features

- Password hashing with bcrypt
- Session management
- Authentication middleware
- Protected routes

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Customization

### Adding New Users

Edit the `users` array in `server.js`:

```javascript
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    fullName: 'System Administrator'
  },
  // Add more users here
];
```

### Changing the Port

Set the PORT environment variable:
```bash
PORT=8080 npm start
```

Or modify the default in `server.js`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License

## Support

For issues and questions, please open an issue on GitHub.

---

**New Time Africa** - Building the future of administration
