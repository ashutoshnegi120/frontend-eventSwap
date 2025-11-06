import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth(); // keep original API: signup(username, email, password)

  // ----- Validation (V2-FORM, P-ULTRA) -----
  const isEmailValid = (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // P-ULTRA: ≥8 chars, 1 upper, 1 lower, 1 number, 1 special
  const isPasswordStrong = (v) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!email.trim()) return "Email is required";
    if (!isEmailValid(email)) return "Enter a valid email address";
    if (!password) return "Password is required";
    if (!isPasswordStrong(password))
      return "Password must be 8+ chars and include uppercase, lowercase, number, and special character";
    if (!confirmPassword) return "Confirm Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      await signup(username, email, password);  // 🔒 unchanged logic
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Simple live hints (UI only)
  const showHints = password.length > 0 || confirmPassword.length > 0;

  return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h2>
              <p className="text-gray-600 text-sm mt-1">Join SlotSwapper and start swapping smarter</p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      id="username"
                      type="text"
                      className="input pl-10"
                      placeholder="john_doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      id="email"
                      type="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      id="password"
                      type="password"
                      className="input pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Strength Hints (UI only) */}
                {showHints && (
                    <ul className="mt-2 space-y-1 text-xs">
                      <Hint ok={password.length >= 8}>At least 8 characters</Hint>
                      <Hint ok={/[A-Z]/.test(password)}>One uppercase letter</Hint>
                      <Hint ok={/[a-z]/.test(password)}>One lowercase letter</Hint>
                      <Hint ok={/\d/.test(password)}>One number</Hint>
                      <Hint ok={/[^A-Za-z0-9]/.test(password)}>One special character</Hint>
                    </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      id="confirmPassword"
                      type="password"
                      className="input pl-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {showHints && confirmPassword.length > 0 && (
                    <p className={`mt-2 text-xs ${password === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" fullWidth loading={loading}>
                Create Account
              </Button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}

// Small UI helper for password hints (no logic side-effects)
function Hint({ ok, children }) {
  return (
      <li className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-500"}`}>
        <CheckCircle2 className={`w-4 h-4 ${ok ? "text-green-600" : "text-gray-400"}`} />
        <span>{children}</span>
      </li>
  );
}
