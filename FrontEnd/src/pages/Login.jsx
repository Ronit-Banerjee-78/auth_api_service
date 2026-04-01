import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields required.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await axios.post(
        "http://localhost:5000/api/owner/login",
        form
      );

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "data",
        JSON.stringify({
          email: res.data.email,
          name: res.data.name
        })
      );

      navigate("/dashboard");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">

      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-white/30 mb-2">
          Welcome back
        </p>
        <h1 className="text-2xl text-white font-light">
          Sign in
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          placeholder="••••••••"
        />

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-xs tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all disabled:opacity-40"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

      </form>

      <p className="mt-6 text-xs text-white/30 text-center">
        No account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-white/60 hover:text-white underline underline-offset-2"
        >
          Register
        </button>
      </p>

    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>

      <label className="text-xs tracking-wider uppercase text-white/30 block mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-all"
      />

    </div>
  );
}