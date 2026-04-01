import Link from "next/link";

export default function Home() {
  return (
    <div className="auth-wrapper flex-column text-center">
      <div style={{ maxWidth: 520 }}>
        <h1 className="fw-bold mb-3" style={{ fontSize: "2rem" }}>
          AuthService
        </h1>
        <p className="text-secondary mb-4">
          A plug-and-play authentication API for your applications. Register once, get an API key, and handle auth for all your users.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link href="/register" className="btn btn-dark px-4">
            Get Started
          </Link>
          <Link href="/login" className="btn btn-outline-secondary px-4">
            Sign In
          </Link>
        </div>
        <div className="mt-5 d-flex justify-content-center gap-4 text-secondary small">
          <span>✓ JWT Sessions</span>
          <span>✓ Email Verification</span>
          <span>✓ Password Reset</span>
        </div>
      </div>
    </div>
  );
}
