import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ReactNode } from "react";

export default function Protected({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
