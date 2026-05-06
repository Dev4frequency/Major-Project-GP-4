import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ReactNode } from "react";

export default function Protected({ children }: { children: ReactNode }) {
  const { authUser, loading } = useApp();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        <div className="animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!authUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
