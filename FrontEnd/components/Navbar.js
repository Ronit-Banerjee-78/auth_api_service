import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { owner, logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/api-guide", label: "API Guide" },
    { href: "/mail-setup", label: "Mail Setup" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light border-bottom bg-white sticky-top">
      <div className="container">
        <Link href="/dashboard" className="navbar-brand fw-semibold text-dark">
          AuthService
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.href}>
                <Link
                  href={l.href}
                  className={`nav-link ${router.pathname === l.href ? "text-dark fw-semibold" : "text-secondary"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {owner && (
            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary small">{owner.email}</span>
              <button
                onClick={logout}
                className="btn btn-sm btn-outline-secondary"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
