import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { NotifyProvider } from "./context/NotifyContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ToastStack from "./components/ToastStack"
import { SSEProvider } from "./context/SSEContext"

// Pages
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Calendar from "./pages/Calendar"
import Marketplace from "./pages/Marketplace"
import Requests from "./pages/Requests"

// Theme
import ThemeToggle from "./components/ThemeToggle"  // <-- add this

export default function App() {
  return (
      <Router>
        <AuthProvider>
          <SSEProvider>
            <NotifyProvider>
              <ToastStack />
              {/* Dark/Light Theme Toggle */}
              <ThemeToggle />

              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/requests" element={<Requests />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </NotifyProvider>
          </SSEProvider>
        </AuthProvider>
      </Router>
  )
}
