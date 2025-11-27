# Gym Mini Check-in System - Frontend

A modern, real-time gym membership management and check-in system built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Admin Features
- **Member Management**
  - View all members with filtering (status, active/expired, search)
  - Approve/Reject member registrations
  - View member details including profile photos and payment screenshots
  - Real-time notifications for new member registrations
  - Badge showing count of pending members in navigation

- **Membership Package Management**
  - Create, update, and delete membership packages
  - Activate/deactivate packages
  - Set pricing and duration

- **Check-in Logs**
  - View all check-in history
  - Filter by member ID and status (ALLOWED/DENIED)
  - Real-time updates via WebSocket

- **Real-time Updates**
  - WebSocket integration for instant notifications
  - Automatic data refresh when members are approved/rejected

### Member Features
- **Registration**
  - 3-step registration process:
    1. Personal information (name, email, password, phone, profile photo)
    2. Membership package selection
    3. Payment screenshot upload
  - Real-time status tracking
  - Automatic redirect on approval/rejection

- **Dashboard**
  - View membership details
  - Check membership status (Active/Expired)
  - View check-in history
  - QR code display for check-in
  - Check-in/Check-out functionality

- **Real-time Notifications**
  - Instant notifications when registration is approved/rejected
  - Automatic redirect to dashboard on approval

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: TanStack Query (React Query) 5.90.11
- **Form Handling**: React Hook Form 7.66.1 + Zod 4.1.13
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **Real-time**: Socket.IO Client 4.8.1
- **QR Code**: qrcode.react 4.2.0, html5-qrcode 2.3.8
- **Notifications**: React Hot Toast 2.6.0

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API server running (see backend repository)
- Modern web browser with JavaScript enabled

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Gym-Mini-Checkin-System-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```
   
   Update the URL to match your backend API server.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
src/
├── admins/              # Admin-side pages
│   ├── AdminLayout.tsx  # Admin layout with navigation
│   ├── auth/           # Admin authentication
│   ├── members/        # Member management
│   ├── membership-packages/  # Package management
│   └── checkin-logs/   # Check-in history
│
├── members/            # Member-side pages
│   ├── login/          # Member login
│   ├── register/      # Member registration
│   └── dashboard/      # Member dashboard
│
├── qr/                 # QR code scanner page
│
├── components/         # Reusable components
│   ├── ImageUpload.tsx # Drag-and-drop image upload
│   ├── QRScanner.tsx   # QR code display modal
│   └── ui/             # UI components
│
├── lib/                # Core utilities
│   ├── api/            # API client functions
│   ├── hooks/          # Custom React hooks
│   ├── axios-config.ts # Axios configuration
│   ├── socket.ts       # WebSocket setup
│   └── query-client.ts # React Query setup
│
└── types/              # TypeScript type definitions
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

### Admin Authentication
- Login endpoint: `/api/v1/admin/login`
- Token stored in localStorage as `adminAuthToken`
- Automatic token injection in API requests
- 401 redirects to login page

### Member Authentication
- Login endpoint: `/api/v1/members/login`
- Registration endpoint: `/api/v1/members/register`
- Token stored in localStorage as `memberAuthToken`
- Automatic token injection in API requests

## 🔌 API Integration

The frontend communicates with the backend API through:

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Custom error parsing from backend response format
- **Response Format**: Handles `_data.data` nested structure

### Key API Endpoints

#### Admin Endpoints
- `GET /members` - List all members
- `PATCH /members/:id/approve` - Approve member
- `PATCH /members/:id/reject` - Reject member
- `GET /membership-packages` - List packages
- `GET /checkins` - List check-in logs

#### Member Endpoints
- `POST /members/register` - Register new member
- `POST /members/login` - Member login
- `GET /members/check-status` - Check member status
- `POST /checkin` - Check in
- `POST /checkin/checkout` - Check out

## 🌐 WebSocket Integration

Real-time updates via Socket.IO:

- **Namespace**: `/members`
- **Events**:
  - `member:registered` - New member registration
  - `member:approved` - Member approved
  - `member:rejected` - Member rejected
  - `member:approval-status-changed` - Status change (backward compatibility)

### Socket Subscriptions

- **Admin**: Subscribes to `admin-room` for all member events
- **Members**: Subscribes to personal room `member:{memberId}` for approval/rejection notifications

## 🎨 Key Features Explained

### Debounced Search
All search inputs in admin pages use debouncing (500ms delay) to reduce API calls while typing.

### Image Upload
Drag-and-drop image upload component with:
- File validation (type, size)
- Image preview
- Support for profile photos and payment screenshots
- Automatic upload to backend

### QR Code Generation
- Generates QR code from member ID
- Displayed in modal for easy scanning
- Used for gym check-in process

### Real-time Status Updates
- Members receive instant notifications when approved/rejected
- Automatic page refresh and navigation
- Fallback polling every 5 seconds on success page

## 🚦 Routing

### Admin Routes
- `/admin/login` - Admin login
- `/admin/members` - Member management
- `/admin/membership-packages` - Package management
- `/admin/checkin-logs` - Check-in logs

### Member Routes
- `/members/login` - Member login
- `/members/register` - Member registration
- `/members/register/success` - Registration success page
- `/members/dashboard` - Member dashboard
- `/qr/scanner` - QR scanner page

## 🔒 Security Features

- JWT token-based authentication
- Automatic token refresh handling
- Protected routes with authentication checks
- Secure token storage in localStorage
- 401 error handling with automatic logout

## 📱 Responsive Design

- Mobile-first approach
- Responsive layouts for all screen sizes
- Dark mode support
- Accessible UI components

## 🐛 Error Handling

- Custom error parsing from backend
- Toast notifications for user feedback
- Graceful error handling with fallbacks
- Network error detection and retry logic

## 🔄 State Management

- **React Query**: Server state management
- **React Hook Form**: Form state management
- **Local Storage**: Persistent authentication and member data
- **WebSocket**: Real-time state updates

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Consistent naming conventions
- Component-based architecture

### Best Practices
- Custom hooks for reusable logic
- Type-safe API calls
- Error boundaries for error handling
- Optimistic updates where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Authors

[Add author information here]

## 🙏 Acknowledgments

- Backend API team
- All contributors

---

For backend API documentation, please refer to the backend repository.
