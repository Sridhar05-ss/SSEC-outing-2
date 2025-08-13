# SSEC Attendance System Backend

This is the backend API for the SSEC Attendance System, converted from TypeScript/React frontend files to Node.js/Express.js backend files.

## Project Structure

```
backend/
├── controllers/          # Business logic controllers
│   ├── zktecoController.js      # ZKTeco device operations
│   └── employeeController.js    # Employee management
├── services/            # Service layer for external APIs
│   ├── zktechoService.js        # ZKTeco device communication
│   ├── apiService.js            # EasyTime Pro integration
│   └── employeeRoutes.js        # Employee management service
├── routes/              # Express.js routes
│   ├── deviceRoutes.js          # ZKTeco API endpoints
│   └── employeeRoutes.js        # Employee endpoints
├── models/              # MongoDB schemas
│   └── Attendance.js            # Attendance records schema
├── utils/               # Utility functions
│   ├── auth.js                  # Authentication middleware
│   └── deviceHelpers.js         # Device-specific helpers
├── server.js            # Main entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Conversion Summary

The following TSX files were converted to their corresponding backend JS files:

### Frontend → Backend Conversion Map

1. **`src/lib/zktecoApi.ts`** → **`services/zktechoService.js`**
   - ZKTeco API integration service
   - Device communication logic
   - Authentication methods

2. **`src/lib/easytimeproApi.ts`** → **`services/apiService.js`**
   - EasyTime Pro API integration
   - Staff management functions
   - Authentication handling

3. **`src/lib/easytimeproStaffService.ts`** → **`services/employeeRoutes.js`**
   - Employee management service functions
   - Add/delete staff operations

4. **`src/lib/zktecoAuth.ts`** → **`utils/auth.js`**
   - Authentication utility
   - Token management
   - Device status checking

5. **`src/lib/demoCredentials.ts`** → **`utils/deviceHelpers.js`** (merged)
   - Demo credentials for testing
   - Device helper functions

6. **`src/config/zkteco.ts`** → **`utils/deviceHelpers.js`** (merged)
   - ZKTeco configuration
   - API endpoints

7. **`src/config/easytimepro.ts`** → **`utils/deviceHelpers.js`** (merged)
   - EasyTime Pro configuration
   - API endpoints

## API Endpoints

### Device Routes (`/api/device`)

- `GET /status` - Get device connection status
- `POST /sync` - Sync with device
- `GET /attendance` - Get attendance data
- `GET /users` - Get all users from device
- `POST /users` - Add user to device
- `DELETE /users/:userId` - Delete user from device
- `GET /logs` - Get device logs
- `POST /authenticate` - Authenticate with device
- `POST /logout` - Logout from device
- `GET /auth/status` - Get authentication status

### Employee Routes (`/api/employees`)

- `POST /authenticate` - Authenticate with EasyTime Pro
- `GET /` - Get all staff members
- `POST /` - Add a new staff member
- `DELETE /:staffId` - Delete a staff member
- `GET /transactions` - Get transaction logs
- `GET /:staffId` - Get specific staff member
- `PUT /:staffId` - Update staff member
- `GET /search` - Search staff members

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/attendance-system

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# ZKTeco Device Configuration
ZKTECO_API_URL=http://localhost:8000
ZKTECO_DEVICE_IP=192.168.1.100
ZKTECO_DEVICE_PORT=4370
ZKTECO_TIMEOUT=10000

# EasyTime Pro Configuration
EASYTIMEPRO_API_URL=http://127.0.0.1:8081
EASYTIMEPRO_USERNAME=admin
EASYTIMEPRO_PASSWORD=Admin123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `axios` - HTTP client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `morgan` - HTTP request logger
- `compression` - Response compression
- `multer` - File upload handling
- `moment` - Date manipulation
- `lodash` - Utility functions

### Development Dependencies
- `nodemon` - Auto-restart on file changes
- `jest` - Testing framework
- `supertest` - HTTP testing
- `eslint` - Code linting

## Database Schema

### Attendance Model

The `Attendance` model includes:
- User identification (`user_id`, `name`)
- Timestamp and status (`timestamp`, `status`)
- Device information (`device_id`, `device_name`)
- Source system tracking (`source`, `verification_method`)
- Metadata and notes
- Created/updated timestamps

## Authentication

The backend supports multiple authentication methods:
1. **ZKTeco JWT Authentication** - Primary method
2. **ZKTeco Staff Token Authentication** - Fallback method
3. **Demo Credentials** - For testing/development

## Error Handling

The backend includes comprehensive error handling:
- Validation errors
- Database errors
- Device communication errors
- Authentication errors
- Rate limiting
- CORS handling

## Security Features

- CORS configuration
- Rate limiting
- Input validation
- JWT token authentication
- Password hashing
- Helmet security headers

## Testing

Run tests with:
```bash
npm test
```

## Linting

Run linting with:
```bash
npm run lint
npm run lint:fix
```

## API Documentation

Visit `http://localhost:3001/` for API documentation and available endpoints.

## Health Check

Visit `http://localhost:3001/health` to check server and database status.
