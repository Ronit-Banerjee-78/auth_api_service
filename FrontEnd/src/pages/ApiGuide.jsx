import { useNavigate } from "react-router-dom";

const BASE = "https://api.yourservice.com/v1";

const endpoints = [
  {
    method: "POST",
    path: "/api/user/register",
    desc: "Register a new user",
    body: `{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret"
}`,
    response: `{
  "id": "usr_01",
  "email": "alice@example.com",
  "token": "eyJ..."
}`,
  },
  {
    method: "POST",
    path: "/api/user/login",
    desc: "Authenticate and receive a token",
    body: `{
  "email": "alice@example.com",
  "password": "secret"
}`,
    response: `{
  "token": "eyJ...",
  "expires_in": 3600
}`,
  },
  {
    method: "GET",
    path: "/api/owner/users",
    desc: "List all users (auth required)",
    body: null,
    response: `[
  { "id": "usr_01", "name": "Alice" }
]`,
  },
  {
    method: "POST",
    path: "/api/client/register",
    desc: "Create a new client user",
    body: `{
  "name": "Bob",
  "email": "bob@example.com"
}`,
    response: `{ "id": "usr_02", "name": "Bob" }`,
  },
  {
    method: "PUT",
    path: "/api/owner/users/:id",
    desc: "Update an existing user",
    body: `{
  "name": "Bob Updated"
}`,
    response: `{ "id": "usr_02", "name": "Bob Updated" }`,
  },
  {
    method: "DELETE",
    path: "/api/owner/users/:id",
    desc: "Delete a user",
    body: null,
    response: `{ "message": "User deleted." }`,
  },
];

const METHOD_STYLE = {
  GET: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  POST: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function ApiGuide({ isLoggedIn }) {

  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div className="mb-14">
        <p className="text-xs tracking-widest uppercase text-emerald-400/60 mb-3">
          Authentication as a Service
        </p>

        <h1 className="text-4xl text-white font-light leading-tight mb-4">
          Simple auth,
          <br />
          <span className="text-white/30">for your app.</span>
        </h1>

        <p className="text-white/40 text-sm max-w-md leading-relaxed mb-8">
          Drop-in authentication API. Register users, issue tokens, manage sessions —
          all via REST.
        </p>

        <div className="flex gap-3">

          {!isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/register")}
                className="text-xs tracking-widest uppercase px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
              >
                Get started
              </button>

              <button
                onClick={() => navigate("/login")}
                className="text-xs tracking-widest uppercase px-5 py-2.5 text-white/30 border border-white/[0.08] rounded hover:border-white/20 hover:text-white/60 transition-all"
              >
                Sign in
              </button>
            </>
          )}

          {isLoggedIn && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs tracking-widest uppercase px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
            >
              Go to Dashboard →
            </button>
          )}

        </div>
      </div>

      {/* Base URL */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-white/25 mb-2">
          Base URL
        </p>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 flex items-center justify-between">
          <code className="text-sm text-white/60">{BASE}</code>
          <span className="text-xs text-white/20">REST · JSON</span>
        </div>
      </div>

      {/* Auth Header */}
      <div className="mb-10 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
        <p className="text-xs tracking-wider uppercase text-amber-400/60 mb-1">
          Authentication
        </p>

        <p className="text-sm text-white/40">
          Protected routes require{" "}
          <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
            Authorization: Bearer {"<token>"}
          </code>
        </p>
      </div>

      {/* Endpoints */}
      <div>
        <p className="text-xs tracking-widest uppercase text-white/25 mb-4">
          Endpoints
        </p>

        <div className="space-y-3">
          {endpoints.map((ep, i) => (
            <EndpointCard key={i} {...ep} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EndpointCard({ method, path, desc, body, response }) {
  return (
    <details className="bg-white/[0.02] border border-white/[0.06] rounded-lg group">

      <summary className="flex items-center gap-4 px-5 py-3.5 cursor-pointer list-none hover:bg-white/[0.02] rounded-lg transition-colors">

        <span className={`text-xs tracking-widest uppercase px-2 py-0.5 rounded border font-medium min-w-[52px] text-center ${METHOD_STYLE[method]}`}>
          {method}
        </span>

        <code className="text-sm text-white/70 flex-1">{path}</code>

        <span className="text-xs text-white/25">{desc}</span>

        <span className="text-white/20 text-xs ml-2 group-open:rotate-90 transition-transform inline-block">
          ▶
        </span>

      </summary>

      <div className="px-5 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-white/[0.05] mt-1">

        {body && (
          <div>
            <p className="text-xs tracking-wider uppercase text-white/20 mb-2">
              Request body
            </p>

            <pre className="bg-white/[0.03] border border-white/[0.06] rounded p-3 text-xs text-white/50 overflow-x-auto">
              {body}
            </pre>
          </div>
        )}

        <div className={body ? "" : "col-span-2"}>
          <p className="text-xs tracking-wider uppercase text-white/20 mb-2">
            Response
          </p>

          <pre className="bg-white/[0.03] border border-white/[0.06] rounded p-3 text-xs text-white/50 overflow-x-auto">
            {response}
          </pre>
        </div>

      </div>

    </details>
  );
}