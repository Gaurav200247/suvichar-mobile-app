# Suvichar - Daily Motivation App 🙏✨

A full-stack mobile application for creating and sharing inspirational Hindi quotes with personalized branding. Users can generate beautiful quote images with their profile photo/logo, download them, and share on social media.

![Suvichar App](mobile-app/assets/app_icon.png)

## 📱 Features

### Authentication
- 📞 Phone-based OTP authentication via Twilio SMS
- 🔐 Secure JWT token management
- 👤 Support for Personal and Business account types
- 🖼️ Profile photo/logo upload to Cloudinary

### Home & Quotes
- 🎨 20+ beautiful quote template backgrounds
- 📜 Multiple quote categories (Good Morning, Inspirational, Shayari, Religious, Love, Festival)
- 🔄 Swipe through quotes with smooth animations
- 📅 Auto-date display in Hindi calendar format
- 💧 Watermark with user's name on quote cards

### Quote Actions
- 📥 Download quotes to device gallery (clean version without watermark)
- 📤 Share quotes with personal branding
- 🎨 Edit design preferences (show/hide date)
- 🖼️ User profile photo displayed on quote cards

### Premium Features
- 👑 Monthly and Yearly subscription plans
- ✨ Remove watermarks
- ♾️ Unlimited downloads
- 🎨 Access to all templates

### Profile & Settings
- 🌓 Dark/Light theme toggle
- ✏️ Edit profile information
- 🚪 Secure logout

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS | Node.js framework |
| TypeORM | Database ORM |
| PostgreSQL | Database |
| JWT | Authentication tokens |
| Twilio | SMS OTP delivery |
| Cloudinary | Image storage |
| Swagger | API documentation |

### Mobile App
| Technology | Purpose |
|------------|---------|
| Expo SDK 54 | React Native framework |
| Expo Router | File-based navigation |
| Redux Toolkit | State management |
| RTK Query | API data fetching |
| NativeWind | Tailwind CSS for React Native |
| React Native Reanimated | Animations |
| Expo Image Picker | Profile photo selection |
| ViewShot | Quote card capture |

## 📂 Project Structure

```
bolt-sample/
├── backend/                    # NestJS Backend API
│   ├── models/                 # TypeORM entities
│   │   ├── auth/               # AccessToken, OTP entities
│   │   └── user/               # User entity
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── user/               # User management module
│   │   ├── common/             # Shared services (config, logger)
│   │   ├── third-party/        # Twilio, Cloudinary integrations
│   │   ├── middlewares/        # Auth guard, logging
│   │   └── utils/              # Multer, responses, helpers
│   └── package.json
│
├── mobile-app/                 # Expo React Native App
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Login, OTP screens
│   │   ├── (user)/             # Main app screens
│   │   │   ├── (tabs)/         # Tab navigation (Home, Profile)
│   │   │   ├── edit-design.tsx # Design customization
│   │   │   └── profile-setup.tsx
│   │   └── (plans)/            # Subscription plans
│   ├── assets/                 # Images, quote templates
│   ├── components/             # Reusable components
│   ├── constants/              # App constants
│   ├── context/                # Theme context
│   ├── store/                  # Redux store
│   │   ├── api/                # RTK Query APIs
│   │   └── slices/             # Redux slices
│   └── package.json
│
└── _docs/                      # Documentation & assets
    └── Quote JPEGS/            # Quote background templates
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL database
- Twilio account (for SMS)
- Cloudinary account (for images)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Physical device with Expo Go

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```ini
   # Server
   NODE_ENV=development
   PORT=4000

   # PostgreSQL
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USERNAME=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DATABASE=suvichar_db

   # JWT
   JWT_ACCESS_TOKEN_SECRET=your_super_secret_key
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
   ```

5. **Create PostgreSQL database:**
   ```bash
   createdb suvichar_db
   ```

6. **Start the server:**
   ```bash
   # Development mode (with hot reload)
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

7. **Access Swagger API docs:**
   ```
   http://localhost:4000/api/docs
   ```

### Mobile App Setup

1. **Navigate to mobile-app directory:**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API base URL:**
   
   Create a `.env` file or set the environment variable:
   ```ini
   EXPO_PUBLIC_BASE_URL=http://your-backend-ip:4000
   ```
   
   > **Note:** Use your local IP address (not `localhost`) when testing on physical devices. Example: `http://192.168.1.100:4000`

4. **Start the Expo development server:**
   ```bash
   npm run dev
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/send-otp` | Send OTP to phone | No |
| POST | `/api/auth/resend-otp` | Resend OTP | No |
| POST | `/api/auth/verify-otp` | Verify OTP & get token | No |
| PUT | `/api/auth/account-type` | Set account type | Yes |
| PUT | `/api/auth/complete-profile` | Upload photo & name | Yes |
| GET | `/api/auth/logout` | Invalidate token | Yes |

### User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Get user profile | Yes |

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| **Login** | Phone number entry with country code |
| **OTP** | 6-digit code verification with resend timer |
| **Purpose** | Account type selection (Personal/Business) |
| **Profile Setup** | Upload photo/logo and enter name |
| **Home** | Quote browsing with category filters |
| **Edit Design** | Customize quote card preferences |
| **Profile** | View/edit profile, theme toggle, logout |
| **Plans** | Premium subscription options |

## 🎨 Quote Categories

- 🌅 **गुड मॉर्निंग** (Good Morning)
- 💪 **प्रेरणादायक** (Inspirational)
- 📝 **शायरी** (Shayari/Poetry)
- 🙏 **धार्मिक** (Religious)
- ❤️ **प्रेम** (Love)
- 🎉 **त्योहार** (Festival)

## 🔧 Development Notes

### Backend
- **OTP in Dev Mode:** If Twilio credentials are not configured, OTP will be logged to console
- **Database Sync:** Tables are auto-created in development mode via TypeORM synchronize
- **Swagger Docs:** Available at `/api/docs` when running

### Mobile App
- **Theme Persistence:** Uses React Context for dark/light mode
- **Token Storage:** Access tokens stored in Expo SecureStore
- **Image Capture:** Uses ViewShot for quote card capture and MediaLibrary for saving
- **Animations:** Smooth transitions using Reanimated and Animated API

## 📄 Scripts

### Backend
```bash
npm run start:dev    # Start with hot reload
npm run start:prod   # Start production build
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Mobile App
```bash
npm run dev          # Start Expo development server
npm run build:web    # Export web build
npm run lint         # Run Expo lint
npm run typecheck    # TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and unlicensed.

---

**Built with ❤️ using NestJS, Expo, and React Native**

