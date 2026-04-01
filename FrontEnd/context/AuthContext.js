import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    const ownerData = localStorage.getItem("ownerData");
    if (token && ownerData) {
      setOwner(JSON.parse(ownerData));
    }
    setLoading(false);
  }, []);

  const login = (token, ownerData) => {
    localStorage.setItem("ownerToken", token);
    localStorage.setItem("ownerData", JSON.stringify(ownerData));
    setOwner(ownerData);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerData");
    setOwner(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ owner, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
