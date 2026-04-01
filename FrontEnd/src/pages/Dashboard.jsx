import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [api_key, setApiKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = "•".repeat(24);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // fix: check token first before fetching
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    getApiKey();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getApiKey = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/owner/api-key", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiKey(res.data.api_key);
    } catch (err) {
      console.log("Failed to get API key");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/owner/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // fix: handle all possible response shapes
      const data = res.data;
      if (Array.isArray(data)) setUsers(data);
      else if (Array.isArray(data.users)) setUsers(data.users);
      else if (Array.isArray(data.result)) setUsers(data.result);
      else setUsers([]);

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("data");
        navigate("/login");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", email: "", phone: "", address: "" });
    setError("");
    setModal({ mode: "add" });
  };

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
    });
    setError("");
    setModal({ mode: "edit", user });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return setError("Name and email required.");
    setError("");

    try {
      if (modal.mode === "add") {
        const res = await axios.post(
          "http://localhost:5000/api/client/register",
          form,
          { headers: { "x-api-key": api_key } }
        );
        // fix: handle nested result or flat response
        const newUser = res.data.result || res.data.user || res.data;
        setUsers((prev) => [...prev, newUser]);

      } else {
        const res = await axios.put(
          `http://localhost:5000/api/owner/users/${modal.user.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updated = res.data.result || res.data.user || res.data;
        setUsers((prev) =>
          prev.map((u) => (u.id === modal.user.id ? { ...u, ...updated } : u))
        );
      }

      setModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // fix: added auth header
      await axios.delete(`http://localhost:5000/api/owner/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-white/30 mb-1">Management</p>
          <h1 className="text-2xl text-white font-light">Users</h1>
        </div>
        <button
          onClick={openAdd}
          className="text-xs tracking-widest uppercase px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
        >
          + Add user
        </button>
      </div>

      {/* API Key */}
      <div className="mb-10 bg-[#0d1520] border border-[#1a2332] rounded-lg px-4 py-3">
        <p className="text-xs tracking-widest uppercase text-[#00ff9d]/60 mb-2">API Key</p>
        <div className="flex items-center gap-3">
          <code className="text-[#00ff9d] bg-[#080c10] border border-[#1a2332] px-3 py-1.5 rounded text-xs font-mono flex-1 truncate">
            {visible ? api_key : masked}
          </code>
          <button
            onClick={() => setVisible(!visible)}
            className="text-[#4a6380] hover:text-white text-xs tracking-widest uppercase transition-colors shrink-0"
          >
            {visible ? "Hide" : "Show"}
          </button>
          <button
            onClick={copy}
            className={`text-xs tracking-widest uppercase transition-colors shrink-0 ${copied ? "text-[#00ff9d]" : "text-[#4a6380] hover:text-white"}`}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length },
          { label: "Regular Users", value: users.filter((u) => u.role === "user").length },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-5 py-4">
            <p className="text-xs tracking-wider uppercase text-white/25 mb-1">{s.label}</p>
            <p className="text-2xl text-white font-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {/* fix: added Actions header */}
              {["Name", "Email", "Phone", "Address", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs tracking-widest uppercase text-white/25 px-5 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">No users yet</td>
              </tr>
            ) : (
              users.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === users.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-5 py-3.5 text-sm text-white/80">{user.name}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40">{user.email}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40">{user.phone || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40">{user.address || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-xs text-white/30 hover:text-white/70 px-3 py-1 rounded border border-white/[0.06] hover:border-white/20 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-xs text-red-400/50 hover:text-red-400 px-3 py-1 rounded border border-red-400/10 hover:border-red-400/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#141416] border border-white/[0.08] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-light">
                {modal.mode === "add" ? "Add user" : "Edit user"}
              </h2>
              <button onClick={() => setModal(null)} className="text-white/30 hover:text-white/60 text-lg">×</button>
            </div>
            <div className="space-y-4">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Full name" />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@example.com" />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="Phone number" />
              <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Address" />
              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 text-xs tracking-wider uppercase text-white/30 border border-white/[0.08] rounded hover:border-white/20 hover:text-white/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 text-xs tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
                >
                  {modal.mode === "add" ? "Add" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs tracking-wider uppercase text-white/30 block mb-1.5">{label}</label>
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