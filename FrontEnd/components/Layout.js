import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/login", "/register", "/"];

export default function Layout({ children }) {
  const { owner, loading } = useAuth();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(router.pathname);

  useEffect(() => {
    if (!loading && !owner && !isPublic) {
      router.push("/login");
    }
  }, [owner, loading, isPublic]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-secondary" />
      </div>
    );
  }

  if (isPublic) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="container py-4">{children}</main>
    </>
  );
}
