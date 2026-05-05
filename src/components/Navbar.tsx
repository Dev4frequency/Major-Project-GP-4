import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useApp();
  const nav = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm transition-colors ${
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40">
      <div className="container py-4">
        <nav className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to={user ? "/intro" : "/"} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-display text-xl tracking-tight">Dev<span className="text-primary">·</span>Assistant</span>
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/intro" className={linkCls}>Home</NavLink>
              <NavLink to="/assistant" className={linkCls}>Assistant</NavLink>
              <NavLink to="/modules" className={linkCls}>Modules</NavLink>
              <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
              <NavLink to="/team" className={linkCls}>Team</NavLink>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:block text-xs text-muted-foreground">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={() => { logout(); nav("/"); }}>Sign out</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => nav("/auth")}>Sign in</Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
