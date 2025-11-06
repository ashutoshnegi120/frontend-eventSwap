import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const success = await login(formData.email, formData.password);
      setLoading(false);

      if (success) navigate("/dashboard");
      else setError("Invalid email or password");
    } catch {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Welcome Back</h2>
              <p className="text-gray-600 text-sm mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      type="email"
                      className="input pl-10"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                      }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                      type="password"
                      className="input pl-10"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                      }
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button fullWidth loading={loading} type="submit" iconLeft={<LogIn className="w-4 h-4" />}>
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="text-center text-xs text-gray-500 mt-4">
            <p className="mb-1 font-medium text-gray-600">Demo Credentials</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
  );
};

export default Login;
