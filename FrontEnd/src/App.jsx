import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApiGuide from "./pages/ApiGuide";
import Layout from "./pages/Layout";
import SetPassword from "./pages/SetPassword";

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");
  const data = localStorage.getItem("data");

  const isLoggedIn = !!(token && data);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {

  const token = localStorage.getItem("token");
  const data = localStorage.getItem("data");

  const isLoggedIn = !!(token && data);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
    window.location.reload();
  };

  return (
    <BrowserRouter>

      <Layout isLoggedIn={isLoggedIn} onLogout={logout}>

        <Routes>

          <Route path="/" element={<ApiGuide />} />

          <Route
            path="/login"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : <Login />
            }
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/set-password/:token"
            element={<SetPassword />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}