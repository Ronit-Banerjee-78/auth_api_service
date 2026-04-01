import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const endpoints = [
  {
    method: "POST",
    path: "/api/client/register",
    desc: "Register a new user",
    auth: "x-api-key header",
    body: `{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "9999999999",
  "address": "123 Street"
}`,
    response: `{ "userId": 1, "message": "User registered. Verification email sent." }`,
  },
  {
    method: "POST",
    path: "/api/client/login",
    desc: "Login a user",
    auth: "x-api-key header",
    body: `{
  "email": "john@example.com",
  "password": "secret123"
}`,
    response: `{ "token": "abc123...", "client": { "id": 1, "name": "John" } }`,
  },
  {
    method: "POST",
    path: "/api/client/logout",
    desc: "Logout a user",
    auth: "x-api-key + x-session-token headers",
    body: null,
    response: `{ "message": "Logged out successfully" }`,
  },
  {
    method: "POST",
    path: "/api/client/forgot-password",
    desc: "Send password reset email",
    auth: "x-api-key header",
    body: `{ "email": "john@example.com" }`,
    response: `{ "message": "If that email exists, a reset link was sent." }`,
  },
  {
    method: "POST",
    path: "/api/client/reset-password",
    desc: "Reset password with token",
    auth: "None",
    body: `{
  "token": "jwt_token_from_email",
  "newPassword": "newpassword123"
}`,
    response: `{ "message": "Password updated successfully" }`,
  },
  {
    method: "GET",
    path: "/api/client/verify-email",
    desc: "Verify email address",
    auth: "?token= query param",
    body: null,
    response: `{ "message": "Email verified successfully" }`,
  },
];

const methodClass = {
  POST: "method-post",
  GET: "method-get",
  PUT: "method-put",
  DELETE: "method-delete",
};

export default function ApiGuide() {
  const { owner } = useAuth();
  const [active, setActive] = useState(0);
  const ep = endpoints[active];

  return (
    <>
      <div className="mb-4">
        <h5 className="fw-semibold mb-1">API Guide</h5>
        <p className="text-secondary small mb-0">
          Use your API key to integrate authentication into any app.
        </p>
      </div>

      {/* API Key reminder */}
      <div className="bg-white border rounded-3 p-3 mb-4 d-flex align-items-center gap-3">
        <div>
          <p className="small fw-medium mb-0">Your API Key</p>
          <p className="text-secondary small mb-0">
            Pass this in every request as the{" "}
            <code className="text-dark">x-api-key</code> header.
          </p>
        </div>
      </div>

      {/* Quick start */}
      <div className="bg-white border rounded-3 p-3 mb-4">
        <p className="fw-medium mb-3">Quick Start</p>
        <div className="d-flex gap-2 mb-3">
          {["Step 1", "Step 2", "Step 3"].map((s, i) => (
            <div key={i} className="d-flex align-items-center gap-2">
              <div className="step-number">{i + 1}</div>
              <span className="small text-secondary">
                {i === 0 && "Copy your API key"}
                {i === 1 && "Call /register with user data"}
                {i === 2 && "Call /login to get session token"}
              </span>
              {i < 2 && <span className="text-secondary mx-1">→</span>}
            </div>
          ))}
        </div>

        <p className="small fw-medium mb-2">Example — Register a user</p>
        <div className="code-block">
          <span className="keyword">fetch</span>
          {"("}
          <span className="string">
            &apos;https://your-api.com/api/client/register&apos;
          </span>
          {", {\n"}
          {"  "}
          <span className="key">method</span>
          {": "}
          <span className="string">&apos;POST&apos;</span>
          {",\n"}
          {"  "}
          <span className="key">headers</span>
          {": {\n"}
          {"    "}
          <span className="string">&apos;Content-Type&apos;</span>
          {": "}
          <span className="string">&apos;application/json&apos;</span>
          {",\n"}
          {"    "}
          <span className="string">&apos;x-api-key&apos;</span>
          {": "}
          <span className="string">&apos;YOUR_API_KEY&apos;</span>
          {"\n  },\n  "}
          <span className="key">body</span>
          {": JSON.stringify({\n"}
          {"    "}
          <span className="key">name</span>
          {": "}
          <span className="string">&apos;John Doe&apos;</span>
          {",\n"}
          {"    "}
          <span className="key">email</span>
          {": "}
          <span className="string">&apos;john@example.com&apos;</span>
          {",\n"}
          {"    "}
          <span className="key">password</span>
          {": "}
          <span className="string">&apos;secret123&apos;</span>
          {"\n  })\n})"}
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white border rounded-3 p-3">
        <p className="fw-medium mb-3">All Endpoints</p>
        <div className="row g-3">
          {/* List */}
          <div className="col-md-4">
            {endpoints.map((e, i) => (
              <div
                key={i}
                className={`endpoint-row cursor-pointer ${active === i ? "border-dark" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setActive(i)}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    className={`badge-method ${methodClass[e.method]}`}
                  >
                    {e.method}
                  </span>
                  <code className="small text-dark">{e.path}</code>
                </div>
                <p className="text-secondary mb-0" style={{ fontSize: "0.78rem" }}>
                  {e.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="col-md-8">
            <div className="border rounded-3 p-3 h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className={`badge-method ${methodClass[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="fw-semibold">{ep.path}</code>
              </div>

              <p className="text-secondary small mb-3">{ep.desc}</p>

              <p className="small fw-medium mb-1">Auth</p>
              <p className="text-secondary small mb-3">{ep.auth}</p>

              {ep.body && (
                <>
                  <p className="small fw-medium mb-1">Request Body</p>
                  <div className="code-block mb-3">{ep.body}</div>
                </>
              )}

              <p className="small fw-medium mb-1">Response</p>
              <div className="code-block">{ep.response}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
