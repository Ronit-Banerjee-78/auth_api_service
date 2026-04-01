import { useState } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BASE_URL = "https://api.authvault.io/v1";

const MOCK_USERS = [
  { id: "usr_01", name: "Alice Hoffman", email: "alice@corp.io", role: "admin", status: "active", joined: "2024-10-02", lastLogin: "1 hour ago" },
  { id: "usr_02", name: "Ben Carter", email: "ben@corp.io", role: "user", status: "active", joined: "2024-11-18", lastLogin: "3 days ago" },
  { id: "usr_03", name: "Clara Sun", email: "clara@corp.io", role: "user", status: "inactive", joined: "2024-12-01", lastLogin: "30 days ago" },
  { id: "usr_04", name: "David Lim", email: "david@corp.io", role: "moderator", status: "active", joined: "2025-01-07", lastLogin: "5 hours ago" },
  { id: "usr_05", name: "Eva Moore", email: "eva@corp.io", role: "user", status: "suspended", joined: "2025-02-14", lastLogin: "15 days ago" },
  { id: "usr_06", name: "Frank Hale", email: "frank@corp.io", role: "user", status: "active", joined: "2025-03-01", lastLogin: "Just now" },
];

const MOCK_KEYS = [
  { id: 1, name: "Production", key: "av_live_8f3k2m9x1p0qr7nt5w6yj4hcb", created: "2024-11-15", lastUsed: "2 hours ago", requests: 142830, status: "active" },
  { id: 2, name: "Development", key: "av_test_2c7a9d4e6b1f8h3j5m0n", created: "2025-01-03", lastUsed: "Just now", requests: 3241, status: "active" },
  { id: 3, name: "Staging", key: "av_test_0p4w8r1s6u9v3x7z5y2q", created: "2025-02-20", lastUsed: "5 days ago", requests: 890, status: "revoked" },
];

const ROUTES = [
  { group: "Authentication", color: "#00ff9d", endpoints: [
    { method: "POST", path: "/auth/register", summary: "Register a new user", description: "Creates a new user account. Returns a JWT access token and refresh token on success.", auth: false, body: { name: "string", email: "string", password: "string (min 8 chars)" }, response: { token: "eyJhbGci...", refreshToken: "rt_abc123...", user: { id: "usr_01", name: "Alice", email: "alice@co.com" } }, errors: [{ code: 400, msg: "Validation failed" }, { code: 409, msg: "Email already in use" }] },
    { method: "POST", path: "/auth/login", summary: "Authenticate a user", description: "Validates credentials and returns a JWT access token (expires in 1h) and refresh token.", auth: false, body: { email: "string", password: "string" }, response: { token: "eyJhbGci...", refreshToken: "rt_xyz...", expiresIn: 3600 }, errors: [{ code: 401, msg: "Invalid credentials" }] },
    { method: "POST", path: "/auth/refresh", summary: "Refresh access token", description: "Exchange a valid refresh token for a new access token.", auth: false, body: { refreshToken: "string" }, response: { token: "eyJhbGci...", expiresIn: 3600 }, errors: [{ code: 401, msg: "Invalid or expired refresh token" }] },
    { method: "POST", path: "/auth/logout", summary: "Logout user", description: "Invalidates the provided refresh token, ending the session.", auth: true, body: { refreshToken: "string" }, response: { message: "Logged out successfully" }, errors: [] },
    { method: "POST", path: "/auth/forgot-password", summary: "Request password reset", description: "Sends a password reset link to the given email. Valid for 15 minutes.", auth: false, body: { email: "string" }, response: { message: "Reset link sent if email exists" }, errors: [{ code: 429, msg: "Too many requests" }] },
    { method: "POST", path: "/auth/reset-password", summary: "Reset password", description: "Resets a user password using a valid reset token.", auth: false, body: { token: "string", newPassword: "string (min 8 chars)" }, response: { message: "Password updated" }, errors: [{ code: 400, msg: "Invalid or expired token" }] },
  ]},
  { group: "Users", color: "#0ea5e9", endpoints: [
    { method: "GET", path: "/users", summary: "List all users", description: "Returns a paginated list of all users. Requires admin role.", auth: true, query: { page: "number (default: 1)", limit: "number (default: 20)", role: "user|admin|moderator", status: "active|inactive|suspended" }, response: { users: [{ id: "usr_01", name: "Alice" }], total: 142, page: 1, pages: 8 }, errors: [{ code: 403, msg: "Admin access required" }] },
    { method: "GET", path: "/users/:id", summary: "Get a user by ID", description: "Retrieves a single user's profile.", auth: true, response: { id: "usr_01", name: "Alice", email: "alice@co.com", role: "user", status: "active" }, errors: [{ code: 404, msg: "User not found" }] },
    { method: "PUT", path: "/users/:id", summary: "Update a user", description: "Update user profile fields. Admins can change any field including role and status.", auth: true, body: { name: "string (optional)", email: "string (optional)", role: "string (admin only)" }, response: { id: "usr_01", name: "Alice Updated", email: "new@co.com", role: "user" }, errors: [{ code: 403, msg: "Forbidden" }, { code: 409, msg: "Email already taken" }] },
    { method: "DELETE", path: "/users/:id", summary: "Delete a user", description: "Permanently deletes a user account. This action is irreversible.", auth: true, response: { message: "User deleted successfully" }, errors: [{ code: 403, msg: "Admin access required" }, { code: 404, msg: "User not found" }] },
  ]},
  { group: "Token Validation", color: "#f59e0b", endpoints: [
    { method: "POST", path: "/token/verify", summary: "Verify a JWT token", description: "Validates a JWT token and returns its decoded payload.", auth: false, body: { token: "string" }, response: { valid: true, payload: { userId: "usr_01", role: "user", exp: 1712345678 } }, errors: [{ code: 401, msg: "Token is invalid or expired" }] },
    { method: "GET", path: "/token/me", summary: "Get current user from token", description: "Returns the user profile from the Authorization header token.", auth: true, response: { id: "usr_01", name: "Alice", email: "alice@co.com", role: "user" }, errors: [{ code: 401, msg: "Unauthorized" }] },
  ]},
];

const METHOD_COLORS = {
  GET: "bg-[#001a10] border border-[#003d1f] text-[#00ff9d]",
  POST: "bg-[#001528] border border-[#003060] text-[#0ea5e9]",
  PUT: "bg-[#1a1000] border border-[#3d2500] text-[#f59e0b]",
  DELETE: "bg-red-950 border border-red-900 text-red-400",
};

const statusStyle = { active: "text-[#00ff9d] bg-[#001a0d] border border-[#004d2a]", inactive: "text-[#4a6380] bg-[#0d1520] border border-[#1a2332]", suspended: "text-red-400 bg-red-950 border border-red-900" };
const roleStyle = { admin: "text-[#f59e0b] bg-[#1a1000] border border-[#4a3000]", moderator: "text-[#0ea5e9] bg-[#001020] border border-[#003060]", user: "text-[#6b7280] bg-[#111827] border border-[#1f2937]" };

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ text, style }) {
  return <span className={`text-xs px-2 py-0.5 font-mono tracking-wide ${style}`}>{text}</span>;
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ email, name: name || email.split("@")[0] }); }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex overflow-hidden" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Left */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 border-r border-[#1a2332]">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#00ff9d 1px, transparent 1px), linear-gradient(90deg, #00ff9d 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00ff9d] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 border border-[#00ff9d] flex items-center justify-center"><div className="w-3 h-3 bg-[#00ff9d]" /></div>
          <span className="text-[#00ff9d] text-sm tracking-[0.3em] uppercase">AuthVault</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[#00ff9d] text-xs tracking-[0.4em] uppercase mb-4">Authentication API</p>
            <h1 className="text-5xl font-black text-white leading-tight">Secure.<br /><span className="text-[#00ff9d]">Scalable.</span><br />Simple.</h1>
          </div>
          <p className="text-[#4a6380] text-sm leading-relaxed max-w-sm">Enterprise-grade authentication infrastructure. Manage users, issue tokens, and protect your routes — all through a single REST API.</p>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#1a2332]">
            {[{ val: "99.9%", label: "Uptime" }, { val: "<50ms", label: "Latency" }, { val: "256-bit", label: "Encryption" }].map((s) => (
              <div key={s.label}><div className="text-[#00ff9d] text-xl font-black">{s.val}</div><div className="text-[#4a6380] text-xs mt-1">{s.label}</div></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 bg-[#0d1520] border border-[#1a2332] p-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 opacity-70" /><div className="w-2 h-2 rounded-full bg-yellow-500 opacity-70" /><div className="w-2 h-2 rounded-full bg-green-500 opacity-70" />
            <span className="text-[#2a3a52] ml-2">terminal</span>
          </div>
          <div className="space-y-1">
            <div><span className="text-[#4a6380]">$ </span><span className="text-[#00ff9d]">curl</span><span className="text-white"> -X POST {BASE_URL}/auth/login</span></div>
            <div className="text-[#4a6380] pl-4">-H "Content-Type: application/json"</div>
            <div className="mt-2 text-[#0ea5e9]">{"{ \"token\": \"eyJhbGci...\" }"}</div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-7 h-7 border border-[#00ff9d] flex items-center justify-center"><div className="w-2.5 h-2.5 bg-[#00ff9d]" /></div>
            <span className="text-[#00ff9d] text-sm tracking-[0.3em] uppercase">AuthVault</span>
          </div>
          <h2 className="text-white text-3xl font-black mb-2">{isLogin ? "Sign in" : "Create account"}</h2>
          <p className="text-[#4a6380] text-sm mb-8">{isLogin ? "Access your API keys and dashboard" : "Start building with AuthVault API"}</p>
          <div className="flex border border-[#1a2332] mb-6">
            {["Login", "Register"].map((t, i) => (
              <button key={t} onClick={() => setIsLogin(i === 0)} className={`flex-1 py-2.5 text-xs tracking-widest uppercase transition-all ${isLogin === (i === 0) ? "bg-[#00ff9d] text-[#080c10] font-black" : "text-[#4a6380] hover:text-white"}`}>{t}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full bg-[#0d1520] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52]" />
              </div>
            )}
            <div>
              <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-[#0d1520] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52]" required />
            </div>
            <div>
              <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0d1520] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52]" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#00ff9d] text-[#080c10] py-3.5 text-xs tracking-[0.3em] uppercase font-black hover:bg-[#00cc7a] transition-colors disabled:opacity-50 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border border-[#080c10] border-t-transparent rounded-full animate-spin inline-block" />Authenticating...</span> : isLogin ? "Sign In →" : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── API KEYS PAGE ────────────────────────────────────────────────────────────

function APIKeysPage() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState("live");
  const [createdKey, setCreatedKey] = useState(null);

  const maskKey = (k) => k.slice(0, 12) + "•".repeat(12) + k.slice(-4);
  const copyText = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const revokeKey = (id) => setKeys((ks) => ks.map((k) => k.id === id ? { ...k, status: "revoked" } : k));
  const createKey = () => {
    if (!newKeyName.trim()) return;
    const generated = `av_${newKeyEnv}_${Math.random().toString(36).slice(2, 26)}`;
    setKeys((ks) => [{ id: Date.now(), name: newKeyName, key: generated, created: new Date().toISOString().split("T")[0], lastUsed: "Never", requests: 0, status: "active" }, ...ks]);
    setCreatedKey(generated); setNewKeyName(""); setShowCreate(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div><h1 className="text-white text-2xl font-black">API Keys</h1><p className="text-[#4a6380] text-sm mt-1">Manage your API credentials</p></div>
        <button onClick={() => { setShowCreate(true); setCreatedKey(null); }} className="bg-[#00ff9d] text-[#080c10] px-5 py-2.5 text-xs tracking-widest uppercase font-black hover:bg-[#00cc7a] transition-colors">+ New Key</button>
      </div>

      {/* Base URL */}
      <div className="border border-[#1a2332] bg-[#0d1520] p-5">
        <div className="flex items-center gap-2 mb-3"><div className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full" /><span className="text-[#00ff9d] text-xs tracking-widest uppercase">Base URL</span></div>
        <div className="flex items-center gap-4 bg-[#080c10] border border-[#1a2332] px-4 py-3">
          <code className="text-[#0ea5e9] text-sm flex-1 font-mono">{BASE_URL}</code>
          <button onClick={() => copyText(BASE_URL, "url")} className="text-[#4a6380] hover:text-[#00ff9d] text-xs tracking-widest uppercase transition-colors">{copiedId === "url" ? "✓ Copied" : "Copy"}</button>
        </div>
        <p className="text-[#2a3a52] text-xs mt-2 font-mono">Include your API key as: <code className="text-white">Authorization: Bearer &lt;key&gt;</code></p>
      </div>

      {/* New key banner */}
      {createdKey && (
        <div className="border border-[#00ff9d] bg-[#001a0d] p-5">
          <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse" /><span className="text-[#00ff9d] text-xs font-black tracking-widest uppercase">New Key Generated — Save it now!</span></div>
          <p className="text-[#4a6380] text-xs mb-3">This key will only be shown once.</p>
          <div className="flex items-center gap-3 bg-[#080c10] border border-[#00ff9d] px-4 py-3">
            <code className="text-[#00ff9d] text-sm flex-1 font-mono break-all">{createdKey}</code>
            <button onClick={() => copyText(createdKey, "new")} className="text-[#00ff9d] text-xs tracking-widest uppercase font-black shrink-0">{copiedId === "new" ? "✓" : "Copy"}</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-[#1a2332] overflow-x-auto">
        <div className="border-b border-[#1a2332] px-5 py-3 grid grid-cols-12 gap-3 text-[#2a3a52] text-xs tracking-widest uppercase min-w-[640px]">
          <div className="col-span-2">Name</div><div className="col-span-5">Key</div><div className="col-span-1">Req</div><div className="col-span-2">Last Used</div><div className="col-span-1">Status</div><div className="col-span-1" />
        </div>
        {keys.map((k) => (
          <div key={k.id} className={`px-5 py-4 grid grid-cols-12 gap-3 items-center border-b border-[#1a2332] last:border-b-0 hover:bg-[#0d1520] transition-colors min-w-[640px] ${k.status === "revoked" ? "opacity-50" : ""}`}>
            <div className="col-span-2"><div className="text-white text-sm font-bold">{k.name}</div><div className="text-[#2a3a52] text-xs">{k.created}</div></div>
            <div className="col-span-5 flex items-center gap-2">
              <code className="text-[#4a6380] text-xs font-mono flex-1 truncate">{visibleKeys[k.id] ? k.key : maskKey(k.key)}</code>
              <button onClick={() => setVisibleKeys((v) => ({ ...v, [k.id]: !v[k.id] }))} className="text-[#2a3a52] hover:text-[#4a6380] text-xs shrink-0">{visibleKeys[k.id] ? "Hide" : "Show"}</button>
              <button onClick={() => copyText(k.key, k.id)} className="text-[#2a3a52] hover:text-[#00ff9d] text-xs shrink-0">{copiedId === k.id ? "✓" : "Copy"}</button>
            </div>
            <div className="col-span-1 text-white text-xs font-mono">{k.requests.toLocaleString()}</div>
            <div className="col-span-2 text-[#4a6380] text-xs">{k.lastUsed}</div>
            <div className="col-span-1"><span className={`text-xs px-2 py-0.5 font-mono ${k.status === "active" ? "text-[#00ff9d] bg-[#001a0d] border border-[#004d2a]" : "text-red-400 bg-red-950 border border-red-900"}`}>{k.status}</span></div>
            <div className="col-span-1 flex justify-end">{k.status === "active" && <button onClick={() => revokeKey(k.id)} className="text-[#2a3a52] hover:text-red-400 text-xs transition-colors">Revoke</button>}</div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1520] border border-[#1a2332] w-full max-w-md p-8">
            <h3 className="text-white text-lg font-black mb-6">Generate New API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">Key Name</label>
                <input autoFocus value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Production Backend" className="w-full bg-[#080c10] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52] font-mono" />
              </div>
              <div>
                <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">Environment</label>
                <div className="flex border border-[#1a2332]">
                  {["live", "test"].map((env) => (
                    <button key={env} onClick={() => setNewKeyEnv(env)} className={`flex-1 py-2.5 text-xs tracking-widest uppercase transition-all ${newKeyEnv === env ? "bg-[#00ff9d] text-[#080c10] font-black" : "text-[#4a6380] hover:text-white"}`}>{env === "live" ? "Production" : "Development"}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-[#1a2332] text-[#4a6380] py-3 text-xs tracking-widest uppercase hover:text-white transition-colors">Cancel</button>
              <button onClick={createKey} className="flex-1 bg-[#00ff9d] text-[#080c10] py-3 text-xs tracking-widest uppercase font-black hover:bg-[#00cc7a] transition-colors">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function DashboardPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "user", status: "active" });

  const filtered = users.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return ms && (filterRole === "all" || u.role === filterRole) && (filterStatus === "all" || u.status === filterStatus);
  });

  const toggleSelect = (id) => setSelectedIds((s) => s.includes(id) ? s.filter((i) => i !== id) : [...s, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((u) => u.id));
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setEditUser(u); };
  const saveEdit = () => { setUsers((us) => us.map((u) => u.id === editUser.id ? { ...u, ...form } : u)); setEditUser(null); };
  const createUser = () => {
    if (!form.name || !form.email) return;
    setUsers((us) => [{ id: `usr_${String(Date.now()).slice(-5)}`, ...form, joined: new Date().toISOString().split("T")[0], lastLogin: "Never" }, ...us]);
    setShowCreate(false); setForm({ name: "", email: "", role: "user", status: "active" });
  };
  const deleteUser = (id) => { setUsers((us) => us.filter((u) => u.id !== id)); setDeleteConfirm(null); setSelectedIds((s) => s.filter((i) => i !== id)); };
  const bulkDelete = () => { setUsers((us) => us.filter((u) => !selectedIds.includes(u.id))); setSelectedIds([]); };

  const stats = { total: users.length, active: users.filter((u) => u.status === "active").length, admins: users.filter((u) => u.role === "admin").length, suspended: users.filter((u) => u.status === "suspended").length };

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div><h1 className="text-white text-2xl font-black">User Management</h1><p className="text-[#4a6380] text-sm mt-1">Manage all registered users</p></div>
        <button onClick={() => { setShowCreate(true); setForm({ name: "", email: "", role: "user", status: "active" }); }} className="bg-[#00ff9d] text-[#080c10] px-5 py-2.5 text-xs tracking-widest uppercase font-black hover:bg-[#00cc7a] transition-colors">+ Create User</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Total Users", val: stats.total, c: "text-white" }, { label: "Active", val: stats.active, c: "text-[#00ff9d]" }, { label: "Admins", val: stats.admins, c: "text-[#f59e0b]" }, { label: "Suspended", val: stats.suspended, c: "text-red-400" }].map((s) => (
          <div key={s.label} className="border border-[#1a2332] bg-[#0d1520] p-5"><div className="text-[#4a6380] text-xs tracking-widest uppercase mb-2">{s.label}</div><div className={`text-3xl font-black ${s.c}`}>{s.val}</div></div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-40 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a3a52] text-xs">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-[#0d1520] border border-[#1a2332] text-white pl-8 pr-4 py-2.5 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52] font-mono" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-[#0d1520] border border-[#1a2332] text-[#4a6380] px-3 py-2.5 text-xs outline-none font-mono">
          <option value="all">All Roles</option>
          {["user", "moderator", "admin"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#0d1520] border border-[#1a2332] text-[#4a6380] px-3 py-2.5 text-xs outline-none font-mono">
          <option value="all">All Status</option>
          {["active", "inactive", "suspended"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {selectedIds.length > 0 && <button onClick={bulkDelete} className="border border-red-900 text-red-400 px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-red-950 transition-colors font-mono">Delete {selectedIds.length} Selected</button>}
      </div>

      <div className="border border-[#1a2332] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#1a2332]">
              <th className="px-4 py-3 text-left w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-[#00ff9d]" /></th>
              {["User", "ID", "Role", "Status", "Last Login", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[#2a3a52] text-xs tracking-widest uppercase font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-[#2a3a52] text-sm">No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className={`border-b border-[#1a2332] last:border-b-0 hover:bg-[#0d1520] transition-colors ${selectedIds.includes(u.id) ? "bg-[#0d1520]" : ""}`}>
                <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} className="accent-[#00ff9d]" /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a2332] border border-[#243040] flex items-center justify-center text-xs text-[#4a6380] font-black shrink-0">{u.name.charAt(0)}</div>
                    <div><div className="text-white text-sm font-bold">{u.name}</div><div className="text-[#4a6380] text-xs">{u.email}</div></div>
                  </div>
                </td>
                <td className="px-4 py-4"><code className="text-[#2a3a52] text-xs font-mono">{u.id}</code></td>
                <td className="px-4 py-4"><Badge text={u.role} style={roleStyle[u.role]} /></td>
                <td className="px-4 py-4"><Badge text={u.status} style={statusStyle[u.status]} /></td>
                <td className="px-4 py-4 text-[#4a6380] text-xs">{u.lastLogin}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(u)} className="text-[#4a6380] hover:text-[#00ff9d] text-xs transition-colors">Edit</button>
                    <button onClick={() => setDeleteConfirm(u)} className="text-[#4a6380] hover:text-red-400 text-xs transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[#1a2332]"><p className="text-[#2a3a52] text-xs font-mono">Showing {filtered.length} of {users.length} users</p></div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1520] border border-[#1a2332] w-full max-w-md p-8">
            <h3 className="text-white text-lg font-black mb-6">{showCreate ? "Create New User" : `Edit — ${editUser.name}`}</h3>
            <div className="space-y-4">
              {["name", "email"].map((field) => (
                <div key={field}>
                  <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">{field}</label>
                  <input type={field === "email" ? "email" : "text"} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full bg-[#080c10] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors font-mono" />
                </div>
              ))}
              {["role", "status"].map((field) => (
                <div key={field}>
                  <label className="text-[#4a6380] text-xs tracking-widest uppercase block mb-2">{field}</label>
                  <select value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full bg-[#080c10] border border-[#1a2332] text-white px-4 py-3 text-sm outline-none focus:border-[#00ff9d] transition-colors font-mono">
                    {(field === "role" ? ["user", "moderator", "admin"] : ["active", "inactive", "suspended"]).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setEditUser(null); }} className="flex-1 border border-[#1a2332] text-[#4a6380] py-3 text-xs tracking-widest uppercase hover:text-white transition-colors">Cancel</button>
              <button onClick={showCreate ? createUser : saveEdit} className="flex-1 bg-[#00ff9d] text-[#080c10] py-3 text-xs tracking-widest uppercase font-black hover:bg-[#00cc7a] transition-colors">{showCreate ? "Create" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1520] border border-red-900 w-full max-w-sm p-8 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠</div>
            <h3 className="text-white text-lg font-black mb-2">Delete User</h3>
            <p className="text-[#4a6380] text-sm mb-6">Delete <span className="text-white font-bold">{deleteConfirm.name}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#1a2332] text-[#4a6380] py-3 text-xs tracking-widest uppercase hover:text-white transition-colors">Cancel</button>
              <button onClick={() => deleteUser(deleteConfirm.id)} className="flex-1 bg-red-900 text-red-200 py-3 text-xs tracking-widest uppercase font-black hover:bg-red-800 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GUIDANCE / DOCS PAGE ─────────────────────────────────────────────────────

function EndpointCard({ ep }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fullUrl = BASE_URL + ep.path;
  const copy = () => { navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
  return (
    <div className="border border-[#1a2332] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#0d1520] transition-colors text-left">
        <span className={`text-xs font-black px-2.5 py-1 font-mono shrink-0 ${mc}`}>{ep.method}</span>
        <code className="text-white text-sm flex-1 font-mono">{ep.path}</code>
        {ep.auth && <span className="text-[#f59e0b] text-xs border border-[#3d2500] bg-[#1a1000] px-2 py-0.5 font-mono shrink-0">Auth</span>}
        <span className="text-[#4a6380] text-sm shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-[#1a2332] bg-[#080c10]">
          <div className="px-5 py-4 border-b border-[#1a2332]">
            <p className="text-white text-sm font-bold">{ep.summary}</p>
            <p className="text-[#4a6380] text-xs mt-1">{ep.description}</p>
          </div>
          <div className="px-5 py-3 border-b border-[#1a2332] flex items-center gap-3">
            <span className="text-[#2a3a52] text-xs tracking-widest uppercase shrink-0">URL</span>
            <code className="text-[#4a6380] text-xs font-mono flex-1 truncate">{fullUrl}</code>
            <button onClick={copy} className="text-[#2a3a52] hover:text-[#00ff9d] text-xs transition-colors shrink-0">{copied ? "✓" : "Copy"}</button>
          </div>
          <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
            <div>
              {(ep.body || ep.query) && (
                <>
                  <div className="text-[#4a6380] text-xs tracking-widest uppercase mb-2">{ep.body ? "Request Body" : "Query Params"}</div>
                  <div className="bg-[#0d1520] border border-[#1a2332] p-4">
                    {Object.entries(ep.body || ep.query).map(([k, v]) => (
                      <div key={k} className="flex gap-3 text-xs font-mono mb-1.5 last:mb-0">
                        <span className="text-[#00ff9d] shrink-0">{k}</span><span className="text-[#4a6380]">{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {ep.auth && <div className="mt-4 border border-[#3d2500] bg-[#1a1000] p-3 text-xs font-mono"><div className="text-[#f59e0b] mb-1">Authorization Header</div><div className="text-[#4a6380]">Bearer &lt;your-api-key&gt;</div></div>}
            </div>
            <div>
              <div className="text-[#4a6380] text-xs tracking-widest uppercase mb-2">Response (200)</div>
              <pre className="bg-[#0d1520] border border-[#1a2332] p-4 text-xs text-[#00ff9d] font-mono overflow-x-auto max-h-48 overflow-y-auto">{JSON.stringify(ep.response, null, 2)}</pre>
              {ep.errors && ep.errors.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {ep.errors.map((err) => (
                    <div key={err.code} className="flex gap-3 items-center bg-[#0d1520] border border-[#1a2332] px-3 py-2">
                      <span className="text-red-400 font-mono text-xs font-black">{err.code}</span>
                      <span className="text-[#4a6380] text-xs">{err.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuidancePage() {
  const [activeGroup, setActiveGroup] = useState("all");
  const [search, setSearch] = useState("");
  const visible = ROUTES.filter((r) => activeGroup === "all" || r.group === activeGroup)
    .map((r) => ({ ...r, endpoints: r.endpoints.filter((ep) => ep.path.toLowerCase().includes(search.toLowerCase()) || ep.summary.toLowerCase().includes(search.toLowerCase()) || ep.method.toLowerCase().includes(search.toLowerCase())) }))
    .filter((r) => r.endpoints.length > 0);
  const total = ROUTES.reduce((a, r) => a + r.endpoints.length, 0);

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full" /><span className="text-[#00ff9d] text-xs tracking-[0.4em] uppercase">API Reference</span></div>
        <h1 className="text-white text-2xl font-black">API Documentation</h1>
        <p className="text-[#4a6380] text-sm mt-1">Complete reference for all {total} available endpoints</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Base URL", value: "api.authvault.io/v1", c: "text-[#0ea5e9]" }, { label: "Auth Method", value: "Bearer Token", c: "text-[#f59e0b]" }, { label: "Content-Type", value: "application/json", c: "text-white" }, { label: "Token Expiry", value: "1 hour", c: "text-[#00ff9d]" }].map((i) => (
          <div key={i.label} className="border border-[#1a2332] bg-[#0d1520] p-4"><div className="text-[#2a3a52] text-xs tracking-widest uppercase mb-2">{i.label}</div><code className={`text-xs font-mono ${i.c}`}>{i.value}</code></div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-40 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a3a52] text-xs">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search endpoints..." className="w-full bg-[#0d1520] border border-[#1a2332] text-white pl-8 pr-4 py-2.5 text-sm outline-none focus:border-[#00ff9d] transition-colors placeholder-[#2a3a52] font-mono" />
        </div>
        <div className="flex border border-[#1a2332] overflow-hidden flex-wrap">
          {["all", ...ROUTES.map((r) => r.group)].map((g) => (
            <button key={g} onClick={() => setActiveGroup(g)} className={`px-3 py-2.5 text-xs tracking-widest uppercase transition-all ${activeGroup === g ? "bg-[#00ff9d] text-[#080c10] font-black" : "text-[#4a6380] hover:text-white"}`}>{g === "all" ? "All" : g}</button>
          ))}
        </div>
      </div>
      {visible.map((group) => (
        <div key={group.group} className="space-y-2">
          <div className="flex items-center gap-3 mb-3"><div className="w-2 h-2 rounded-full" style={{ background: group.color }} /><h2 className="text-white text-sm font-black tracking-widest uppercase">{group.group}</h2><div className="flex-1 h-px bg-[#1a2332]" /><span className="text-[#2a3a52] text-xs font-mono">{group.endpoints.length} routes</span></div>
          {group.endpoints.map((ep) => <EndpointCard key={ep.path + ep.method} ep={ep} />)}
        </div>
      ))}
      {visible.length === 0 && <div className="text-center py-20 text-[#2a3a52] text-sm">No endpoints match your search</div>}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Users", icon: "⊞" },
  { id: "keys", label: "API Keys", icon: "⌗" },
  { id: "docs", label: "API Docs", icon: "∷" },
];

function Sidebar({ page, setPage, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`bg-[#080c10] border-r border-[#1a2332] flex flex-col transition-all duration-200 ${collapsed ? "w-14" : "w-52"} shrink-0 relative`}>
      <div className={`flex items-center gap-3 p-4 border-b border-[#1a2332] ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 border border-[#00ff9d] flex items-center justify-center shrink-0"><div className="w-2.5 h-2.5 bg-[#00ff9d]" /></div>
        {!collapsed && <span className="text-[#00ff9d] text-xs tracking-[0.3em] uppercase font-black">AuthVault</span>}
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${page === n.id ? "bg-[#0d1520] border border-[#1a2332] text-white" : "text-[#4a6380] hover:text-white hover:bg-[#0d1520]"} ${collapsed ? "justify-center" : ""}`}>
            <span className={`text-base shrink-0 ${page === n.id ? "text-[#00ff9d]" : ""}`}>{n.icon}</span>
            {!collapsed && <span className="text-xs tracking-wide">{n.label}</span>}
            {!collapsed && page === n.id && <div className="ml-auto w-1.5 h-1.5 bg-[#00ff9d] rounded-full" />}
          </button>
        ))}
      </nav>
      <div className={`border-t border-[#1a2332] p-4 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#1a2332] border border-[#243040] flex items-center justify-center text-xs text-[#4a6380] font-black">{user.name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><div className="text-white text-xs font-bold truncate">{user.name}</div><div className="text-[#2a3a52] text-xs truncate">{user.email}</div></div>
            </div>
            <button onClick={onLogout} className="text-xs text-[#2a3a52] hover:text-red-400 transition-colors tracking-wide">Sign out →</button>
          </div>
        ) : <button onClick={onLogout} title="Sign out" className="text-[#2a3a52] hover:text-red-400 transition-colors text-sm">⏻</button>}
      </div>
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 bg-[#0d1520] border border-[#1a2332] flex items-center justify-center text-[#4a6380] hover:text-white transition-colors z-10 text-xs">
        {collapsed ? "›" : "‹"}
      </button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!user) return <LoginPage onLogin={(u) => setUser(u)} />;

  const pages = { dashboard: <DashboardPage />, keys: <APIKeysPage />, docs: <GuidancePage /> };
  const nav = NAV.find((n) => n.id === page);

  return (
    <div className="min-h-screen bg-[#080c10] flex" style={{ fontFamily: "'Courier New', monospace" }}>
      <Sidebar page={page} setPage={setPage} user={user} onLogout={() => setUser(null)} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-[#1a2332] px-8 py-4 flex items-center justify-between bg-[#080c10] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-black">{nav?.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full animate-pulse" /><span className="text-[#00ff9d] text-xs tracking-widest">API Online</span></div>
            <div className="text-[#2a3a52] text-xs border border-[#1a2332] px-3 py-1.5 font-mono">v1.4.2</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{pages[page]}</div>
      </div>
    </div>
  );
}
