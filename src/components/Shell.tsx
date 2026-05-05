import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Shell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <>
      <div className="sakura-bg" aria-hidden />
      {!hideNav && <Navbar />}
      <main className="container pb-24 pt-2 animate-fade-in">{children}</main>
    </>
  );
}
