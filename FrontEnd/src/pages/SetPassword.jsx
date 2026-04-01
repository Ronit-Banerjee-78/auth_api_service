import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {

        if (!password || !confirm) {
            return setMessage("All fields required");
        }

        if (password !== confirm) {
            return setMessage("Passwords do not match");
        }

        setLoading(true);

        try {

            await axios.post(
                "http://localhost:5000/api/client/set-password",
                {
                    token,
                    password
                }
            );

            setMessage("Account activated. You can login now.");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setMessage(err.response?.data?.error || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f14]">

            <div className="w-full max-w-sm bg-[#141416] border border-white/[0.08] rounded-xl p-6">

                <h2 className="text-white text-lg mb-6 font-light">
                    Set your password
                </h2>

                <div className="space-y-4">

                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2.5 text-sm text-white"
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2.5 text-sm text-white"
                    />

                    {message && (
                        <p className="text-xs text-red-400">
                            {message}
                        </p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs tracking-widest uppercase"
                    >
                        {loading ? "Processing..." : "Set Password"}
                    </button>

                </div>

            </div>

        </div>
    );
}