export default function Layout({ children, page, navigate, isLoggedIn, onLogout }) {
  const navItems = [
    { key: "guide", label: "API Guide" },
    { key: "dashboard", label: "Dashboard", protected: true },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#e8e6e1] font-mono">
      {/* Top Nav */}
      <header className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm tracking-widest uppercase text-white/60">AuthKit</span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) =>
            item.protected && !isLoggedIn ? null : (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`px-4 py-1.5 text-xs tracking-wider uppercase rounded transition-all ${page === item.key
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="text-xs tracking-wider uppercase text-white/40 hover:text-white/70 px-4 py-1.5 rounded border border-white/10 hover:border-white/20 transition-all"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("login")}
                className={`text-xs tracking-wider uppercase px-4 py-1.5 rounded transition-all ${page === "login"
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate("register")}
                className="text-xs tracking-wider uppercase px-4 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12">{children}</main>
    </div>
  );
}