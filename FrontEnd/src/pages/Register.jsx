import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        if (!form.name.trim()) return "Name required.";
        if (!form.email.trim()) return "Email required.";

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(form.email)) return "Invalid email.";

        if (form.password.length < 6)
            return "Password must be at least 6 characters.";

        return null;
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");

        try {

            await axios.post(
                "http://localhost:5000/api/owner/register",
                form
            );

            setSuccess(true);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Registration failed."
            );

        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-sm mx-auto mt-16 text-center">

                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-400 text-lg">✓</span>
                </div>

                <h2 className="text-white text-lg font-light mb-2">
                    Account created
                </h2>

                <p className="text-white/30 text-sm mb-6">
                    You can now sign in to your account.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    className="text-xs tracking-widest uppercase px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
                >
                    Go to Login
                </button>

            </div>
        );
    }

    return (
        <div className="max-w-sm mx-auto mt-16">

            <div className="mb-8">
                <p className="text-xs tracking-widest uppercase text-white/30 mb-2">
                    Get started
                </p>
                <h1 className="text-2xl text-white font-light">
                    Create account
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <Field
                    label="Name"
                    type="text"
                    value={form.name}
                    onChange={(v) => updateField("name", v)}
                    placeholder="Your name"
                />

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
                    {loading ? "Creating..." : "Create account"}
                </button>

            </form>

            <p className="mt-6 text-xs text-white/30 text-center">
                Already have an account?{" "}
                <button
                    onClick={() => navigate("/login")}
                    className="text-white/60 hover:text-white underline underline-offset-2"
                >
                    Sign in
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