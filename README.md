# SlotSwapper 🔄

> A modern time-slot swapping platform that enables users to trade calendar events seamlessly with real-time notifications.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **Smart Event Management** - Create, edit, and delete calendar events with intelligent time-slot validation
- **Real-Time Swap Requests** - Send and receive swap requests with live Server-Sent Events (SSE)
- **Interactive Marketplace** - Browse and request swaps from other users' available time slots
- **Status Tracking** - Monitor pending, accepted, and rejected swap requests in real-time
- **Dark/Light Theme** - Elegant theme toggle with persistent preference storage

### 🔐 Security & Auth
- JWT-based authentication
- Protected routes with authentication guards
- Automatic token refresh and logout on expiration

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Smooth animations and transitions
- Toast notifications for user feedback
- Real-time badge counters for unread requests
- Loading states and skeleton screens

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** - Modern React with hooks
- **Vite 7.1** - Lightning-fast build tool
- **TailwindCSS 4.1** - Utility-first CSS framework
- **React Router 7.9** - Client-side routing
- **Recharts 3.3** - Data visualization
- **Lucide React** - Beautiful icon library
- **date-fns 4.1** - Date manipulation

### State Management & Real-Time
- **Context API** - Global state management
- **Server-Sent Events (SSE)** - Real-time notifications
- **Axios 1.13** - HTTP client with interceptors

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20.19.0
npm >= 8.0.0
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/slotswapper.git
   cd slotswapper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your backend API URL:
   ```env
   VITE_API_BASE=https://your-backend-url.com/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

---

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Backend API Base URL
VITE_API_BASE=https://backend-1fkt.onrender.com/api
```

---

## 📁 Project Structure

```
slotswapper/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, etc.)
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   ├── Sidebar.jsx     # Side navigation menu
│   │   ├── ThemeToggle.jsx # Dark/light mode toggle
│   │   ├── ToastStack.jsx  # Notification system
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── NotifyContext.jsx  # Notifications & badges
│   │   └── SSEContext.jsx     # Server-Sent Events
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useSwapSSE.js   # SSE hook for swap events
│   │
│   ├── pages/              # Route pages
│   │   ├── Login.jsx       # Login page
│   │   ├── Signup.jsx      # Signup page
│   │   ├── Dashboard.jsx   # Analytics dashboard
│   │   ├── Calendar.jsx    # Event management
│   │   ├── Marketplace.jsx # Browse swap opportunities
│   │   └── Requests.jsx    # Swap request management
│   │
│   ├── services/           # API & utilities
│   │   └── api.js          # Axios instance with interceptors
│   │
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles & theme tokens
│
├── public/                 # Static assets
├── .env                    # Environment variables (not in git)
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── vercel.json             # Deployment config (SPA routing)
```

---

## 🎯 Key Features

### 1. Calendar Management
- **Smart Time Blocking** - Automatically prevents overlapping events
- **Free Window Detection** - Finds available time slots between busy periods
- **Fully Blocked Days** - Visual indicator for completely booked days
- **Locked Events** - Events involved in pending swaps cannot be edited/deleted
- **Status Toggle** - Mark events as "Busy" or "Swappable"

### 2. Marketplace
- **Real-Time Listings** - Browse all swappable events from other users
- **Search & Filter** - Find events by title, date, or user
- **Smart Sorting** - Sort by earliest/latest time slots
- **One-Click Requests** - Send swap requests directly from listings

### 3. Request Management
- **Live Updates** - SSE-powered real-time notifications
- **Dual Views** - Track both incoming and outgoing requests
- **Visual Comparison** - Side-by-side event details
- **Status Tracking** - Monitor pending, accepted, and rejected swaps
- **Unread Badges** - Never miss a new request

### 4. Dashboard Analytics
- **Event Overview** - Visual charts showing event distribution
- **Status Breakdown** - Pie chart of busy vs. swappable events
- **Swap Rate** - Track your swap availability percentage
- **Upcoming Swaps** - Quick view of next swappable events

---

## 🔌 API Integration

### Authentication Endpoints
```javascript
POST /auth/register  // Signup
POST /auth/login     // Login
```

### Event Endpoints
```javascript
GET    /getEvent/:userId      // Get user's events
GET    /getAll/:userId        // Get all marketplace events
POST   /create                // Create new event
PATCH  /update/:eventId       // Update event
DELETE /delete/:eventId       // Delete event
```

### Swap Endpoints
```javascript
GET  /getSwap/:userId                     // Get user's swaps
POST /swapRequest/:userId/:eventId/:userEventId  // Request swap
POST /responceToRequest/:swapId           // Accept/reject swap
POST /cancelSwap/:swapId                  // Cancel pending swap
GET  /busy-times                          // Get all blocked times
```

### Real-Time Events
```javascript
GET /SSE/:email  // Server-Sent Events stream
// Events: 'swapRequest', 'swapResponse'
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel auto-deploys on push to main

The `vercel.json` file handles SPA routing automatically.

### Manual Build

```bash
npm run build
# Upload 'dist' folder to your hosting provider
```

---

## 🎨 Theming

The app uses CSS custom properties for theming:

```css
/* Light Mode */
--bg: 250 250 255;       /* Background */
--fg: 17 24 39;          /* Foreground text */
--card: 255 255 255;     /* Card background */
--brand600: 99 102 241;  /* Primary color */

/* Dark Mode (via data-theme="dark") */
--bg: 10 12 20;
--fg: 226 232 240;
--card: 17 24 39;
```

Toggle theme via the floating button in the bottom-right corner.

---

## 🧩 Key Components

### Button Component
```jsx
<Button 
  variant="primary"    // primary | outline | subtle | ghost | danger
  loading={isLoading}
  fullWidth
  iconLeft={<Icon />}
>
  Click Me
</Button>
```

### Toast Notifications
```jsx
const { pushToast } = useNotify();
pushToast("Success message!", "success");  // success | error | warn | info
```

### Protected Routes
```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

---

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- Use functional components with hooks
- Follow the existing file structure
- Keep components small and focused
- Use Tailwind utility classes (avoid custom CSS)
- Add comments for complex logic

---

## 🐛 Troubleshooting

### SSE Connection Issues
- Check backend CORS settings
- Verify API URL in `.env`
- Ensure backend SSE endpoint is running

### Authentication Errors
- Clear browser local storage
- Check token expiration
- Verify backend JWT secret matches

### Build Failures
- Clear `node_modules` and reinstall
- Check Node version compatibility
- Update dependencies: `npm update`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Composable charting library
- [Lucide](https://lucide.dev/) - Beautiful icon library
- Backend hosted on [Render](https://render.com/)

---

## 📧 Contact

For questions or support, please reach out to:
- **Email**: support@slotswapper.com
- **GitHub**: [Ashutosh](https://github.com/ashutsohnegi120)

---

