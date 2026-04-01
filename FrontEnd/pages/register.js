import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ownerAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ownerAPI.register(form);
      setApiKey(res.data.apiKey);
      setDone(true);
      toast.success("Account created! Check your email to verify.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card text-center">
          <div className="mb-3" style={{ fontSize: "2rem" }}>✓</div>
          <h5 className="fw-semibold mb-2">Account Created</h5>
          <p className="text-secondary small mb-4">
            Check your email to verify your account, then save your API key below.
          </p>
          <p className="text-secondary small mb-1 text-start">Your API Key</p>
          <div className="api-key-box mb-4">{apiKey}</div>
          <p className="text-secondary small mb-4">
            Keep this key safe. You will need it to authenticate your users.
          </p>
          <Link href="/login" className="btn btn-dark w-100">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h4 className="fw-semibold mb-1">Create account</h4>
        <p className="text-secondary small mb-4">Get your API key in seconds.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Full name</label>
            <input
              name="name"
              className="form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn btn-dark w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-center text-secondary small mt-4 mb-0">
          Already have an account?{" "}
          <Link href="/login" className="text-dark fw-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
