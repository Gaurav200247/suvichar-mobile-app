# NestJS Backend API

## Authentication Flow

This backend implements a phone-based OTP authentication flow:

### Sign-Up / Sign-In Flow

1. **Send OTP** (`POST /auth/send-otp`)
   - User enters phone number with country code (e.g., +919876543210)
   - OTP is sent via Twilio SMS
   - Creates new user if doesn't exist

2. **Verify OTP** (`POST /auth/verify-otp`)
   - User enters 6-digit OTP
   - Returns access token and user profile
   - Indicates if profile setup is needed

3. **Set Account Type** (`PUT /auth/account-type`) - Protected
   - User selects PERSONAL or BUSINESS account type

4. **Complete Profile** (`PUT /auth/complete-profile`) - Protected
   - User uploads photo/logo and enters name
   - Image is uploaded to Cloudinary

5. **Logout** (`GET /auth/logout`) - Protected
   - Invalidates the access token

## Environment Variables

Create a `.env` file with the following variables:

```ini
# Server
NODE_ENV=development
PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=nestjs_starter

# JWT
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_LIFETIME=7d
ACCESS_TOKEN_EXPIRY=604800000

# Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS (optional, for email/S3)
AWS_SES_EMAIL=noreply@example.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/send-otp` | Send OTP to phone number | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| POST | `/auth/verify-otp` | Verify OTP and get token | No |
| PUT | `/auth/account-type` | Set account type | Yes |
| PUT | `/auth/complete-profile` | Complete profile setup | Yes |
| GET | `/auth/logout` | Logout | Yes |

### User
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file with the required variables.

4. Start PostgreSQL and create the database:
   ```sh
   createdb nestjs_starter
   ```

5. Start the application:
   ```sh
   npm run start:dev
   ```

## Development Notes

- **OTP in Dev Mode**: If Twilio credentials are not configured, OTP will be logged to console
- **Database Sync**: Tables are auto-created in development mode
- **Swagger Docs**: Available at `/api/docs` when running

## Database Entities

- **User** - User accounts with phone number, profile info, account type
- **AccessToken** - JWT access tokens for authentication
- **OTPToken** - OTP codes with expiry for phone verification
