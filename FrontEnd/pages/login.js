import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ownerAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ownerAPI.login(form);
      login(res.data.token, res.data.owner);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h4 className="fw-semibold mb-1">Sign in</h4>
        <p className="text-secondary small mb-4">Welcome back to AuthService.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-medium">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn btn-dark w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-secondary small mt-4 mb-0">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-dark fw-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
